use std::{
    collections::{HashMap, VecDeque},
    io::{Read, Write},
    net::{SocketAddr, TcpListener},
    process::Command,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    thread::{self, JoinHandle},
    time::Duration,
};

use serde_json::{json, Value};

#[derive(Clone)]
enum MockOutcome {
    Json { status: u16, body: Value },
    DropConnection,
}

struct MockHttpServer {
    address: SocketAddr,
    hits: Arc<Mutex<HashMap<String, usize>>>,
    shutdown: Arc<AtomicBool>,
    thread: Option<JoinHandle<()>>,
}

impl MockHttpServer {
    fn start(routes: Vec<(&'static str, Vec<MockOutcome>)>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind mock server");
        listener
            .set_nonblocking(true)
            .expect("set listener nonblocking");

        let address = listener.local_addr().expect("read local addr");
        let shutdown = Arc::new(AtomicBool::new(false));
        let shutdown_flag = Arc::clone(&shutdown);

        let hits = Arc::new(Mutex::new(HashMap::<String, usize>::new()));
        let hits_for_thread = Arc::clone(&hits);

        let responses = Arc::new(Mutex::new(
            routes
                .into_iter()
                .map(|(path, outcomes)| (path.to_string(), VecDeque::from(outcomes)))
                .collect::<HashMap<_, _>>(),
        ));
        let responses_for_thread = Arc::clone(&responses);

        let thread = thread::spawn(move || {
            while !shutdown_flag.load(Ordering::Relaxed) {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        stream
                            .set_nonblocking(false)
                            .expect("set accepted stream blocking");
                        let mut buffer = [0_u8; 4096];
                        let read = stream.read(&mut buffer).expect("read request");
                        if read == 0 {
                            continue;
                        }

                        let request = String::from_utf8_lossy(&buffer[..read]);
                        let request_line = request.lines().next().expect("request line");
                        let path = request_line
                            .split_whitespace()
                            .nth(1)
                            .expect("request path")
                            .to_string();

                        let mut hits = hits_for_thread.lock().expect("lock hits");
                        *hits.entry(path.clone()).or_default() += 1;
                        drop(hits);

                        let outcome = {
                            let mut responses =
                                responses_for_thread.lock().expect("lock response queue");
                            let queue = responses.get_mut(&path).expect("path registered");
                            if queue.len() > 1 {
                                queue.pop_front().expect("queued response")
                            } else {
                                queue.front().expect("fallback response").clone()
                            }
                        };

                        match outcome {
                            MockOutcome::Json { status, body } => {
                                let body = body.to_string();
                                let status_text = match status {
                                    200 => "OK",
                                    404 => "Not Found",
                                    500 => "Internal Server Error",
                                    _ => "Mock",
                                };

                                let response = format!(
                                    "HTTP/1.1 {} {}\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
                                    status,
                                    status_text,
                                    body.len(),
                                    body
                                );

                                stream
                                    .write_all(response.as_bytes())
                                    .expect("write response");
                            }
                            MockOutcome::DropConnection => {}
                        }
                    }
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(5));
                    }
                    Err(error) => panic!("mock server accept error: {error}"),
                }
            }
        });

        Self {
            address,
            hits,
            shutdown,
            thread: Some(thread),
        }
    }

    fn base_url(&self) -> String {
        format!("http://{}", self.address)
    }

    fn hits_for(&self, path: &str) -> usize {
        self.hits
            .lock()
            .expect("lock hits")
            .get(path)
            .copied()
            .unwrap_or_default()
    }
}

impl Drop for MockHttpServer {
    fn drop(&mut self) {
        self.shutdown.store(true, Ordering::Relaxed);
        let _ = std::net::TcpStream::connect(self.address);
        if let Some(thread) = self.thread.take() {
            thread.join().expect("join mock server");
        }
    }
}

fn operation_detail(state: &str) -> Value {
    json!({
        "id": "op_123",
        "type": "probe_host",
        "state": state,
        "initiator": "cli",
        "hostId": "host_alpha",
        "startedAt": "2026-04-16T12:00:00.000Z",
        "finishedAt": if matches!(state, "queued" | "running") { Value::Null } else { json!("2026-04-16T12:00:01.000Z") }
    })
}

fn operation_detail_with_evidence() -> Value {
    json!({
        "id": "op_123",
        "type": "backup",
        "state": "degraded",
        "initiator": "cli",
        "hostId": "host_alpha",
        "startedAt": "2026-04-16T12:00:00.000Z",
        "finishedAt": "2026-04-16T12:00:01.000Z",
        "resultSummary": "required GitHub backup is not configured",
        "backupId": "backup_alpha_002",
        "rollbackPointId": "rp_alpha_002",
        "eventStreamUrl": "/operations/events?operationId=op_123"
    })
}

fn run_portmanager(args: &[&str], base_url: &str) -> std::process::Output {
    run_portmanager_with_env(args, &[("PORTMANAGER_CONTROLLER_BASE_URL", base_url)])
}

fn run_portmanager_with_env(
    args: &[&str],
    env_pairs: &[(&str, &str)],
) -> std::process::Output {
    Command::new(env!("CARGO_BIN_EXE_portmanager"))
        .args(args)
        .envs(env_pairs.iter().copied())
        .output()
        .expect("run portmanager")
}

#[test]
fn operation_get_json_returns_operation_detail_only() {
    let server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![MockOutcome::Json {
            status: 200,
            body: operation_detail("queued"),
        }],
    )]);

    let output = run_portmanager(&["operation", "get", "op_123", "--json"], &server.base_url());

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed, operation_detail("queued"));
}

#[test]
fn operation_get_wait_polls_until_terminal_state() {
    let server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![
            MockOutcome::Json {
                status: 200,
                body: operation_detail("queued"),
            },
            MockOutcome::Json {
                status: 200,
                body: operation_detail("running"),
            },
            MockOutcome::Json {
                status: 200,
                body: operation_detail("succeeded"),
            },
        ],
    )]);

    let output = run_portmanager(
        &[
            "operation",
            "get",
            "op_123",
            "--json",
            "--wait",
            "--poll-interval-ms",
            "5",
            "--timeout-ms",
            "200",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["state"], "succeeded");
    assert_eq!(server.hits_for("/operations/op_123"), 3);
}

#[test]
fn operation_get_wait_reports_timeout_explicitly() {
    let server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![MockOutcome::Json {
            status: 200,
            body: operation_detail("running"),
        }],
    )]);

    let output = run_portmanager(
        &[
            "operation",
            "get",
            "op_123",
            "--json",
            "--wait",
            "--poll-interval-ms",
            "5",
            "--timeout-ms",
            "30",
        ],
        &server.base_url(),
    );

    assert!(!output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["error"], "timeout");
    assert_eq!(parsed["operationId"], "op_123");
    assert_eq!(parsed["lastState"], "running");
    assert_eq!(parsed["timeoutMs"], 30);
}

#[test]
fn operation_get_text_surfaces_summary_recovery_and_event_replay_path() {
    let server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![MockOutcome::Json {
            status: 200,
            body: operation_detail_with_evidence(),
        }],
    )]);

    let output = run_portmanager(&["operation", "get", "op_123"], &server.base_url());

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("required GitHub backup is not configured"));
    assert!(stdout.contains("backup_alpha_002"));
    assert!(stdout.contains("rp_alpha_002"));
    assert!(stdout.contains("/operations/events?operationId=op_123"));
}

#[test]
fn degraded_operation_stays_distinct_from_transport_failure() {
    let degraded_server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![MockOutcome::Json {
            status: 200,
            body: operation_detail("degraded"),
        }],
    )]);

    let degraded_output = run_portmanager(
        &[
            "operation",
            "get",
            "op_123",
            "--json",
            "--wait",
            "--timeout-ms",
            "50",
        ],
        &degraded_server.base_url(),
    );

    assert!(degraded_output.status.success());
    let degraded_stdout = String::from_utf8(degraded_output.stdout).expect("utf8 stdout");
    let degraded_parsed: Value =
        serde_json::from_str(&degraded_stdout).expect("parse degraded json");
    assert_eq!(degraded_parsed["state"], "degraded");

    let transport_server = MockHttpServer::start(vec![(
        "/operations/op_123",
        vec![MockOutcome::DropConnection],
    )]);

    let transport_output =
        run_portmanager(&["operation", "get", "op_123", "--json"], &transport_server.base_url());

    assert!(!transport_output.status.success());
    assert!(transport_output.stderr.is_empty());

    let transport_stdout = String::from_utf8(transport_output.stdout).expect("utf8 stdout");
    let transport_parsed: Value =
        serde_json::from_str(&transport_stdout).expect("parse transport json");
    assert_eq!(transport_parsed["error"], "transport");
}

#[test]
fn events_list_json_reads_shared_event_stream_history() {
    let server = MockHttpServer::start(vec![(
        "/events?limit=2",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "evt_002",
                        "kind": "operation_state_changed",
                        "operationId": "op_apply_001",
                        "operationType": "apply_policy",
                        "state": "succeeded",
                        "level": "success",
                        "summary": "rule_alpha_https applied and awaiting diagnostics",
                        "hostId": "host_alpha",
                        "ruleId": "rule_alpha_https",
                        "emittedAt": "2026-04-16T18:30:02.000Z"
                    },
                    {
                        "id": "evt_001",
                        "kind": "operation_state_changed",
                        "operationId": "op_apply_001",
                        "operationType": "apply_policy",
                        "state": "running",
                        "level": "info",
                        "summary": "apply_policy entered running",
                        "hostId": "host_alpha",
                        "ruleId": "rule_alpha_https",
                        "emittedAt": "2026-04-16T18:30:00.000Z"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(&["events", "list", "--json", "--limit", "2"], &server.base_url());

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["operationType"], "apply_policy");
    assert_eq!(parsed["items"][0]["level"], "success");
    assert_eq!(parsed["items"][0]["summary"], "rule_alpha_https applied and awaiting diagnostics");
}

#[test]
fn events_list_json_filters_by_operation_id() {
    let server = MockHttpServer::start(vec![(
        "/events?limit=20&operationId=op_backup_required_001",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "evt_011",
                        "kind": "operation_state_changed",
                        "operationId": "op_backup_required_001",
                        "operationType": "backup",
                        "state": "degraded",
                        "level": "warn",
                        "summary": "required GitHub backup is not configured",
                        "hostId": "host_alpha",
                        "emittedAt": "2026-04-16T19:00:02.000Z"
                    },
                    {
                        "id": "evt_010",
                        "kind": "operation_state_changed",
                        "operationId": "op_backup_required_001",
                        "operationType": "backup",
                        "state": "running",
                        "level": "info",
                        "summary": "backup operation entered running",
                        "hostId": "host_alpha",
                        "emittedAt": "2026-04-16T19:00:00.000Z"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "events",
            "list",
            "--json",
            "--operation-id",
            "op_backup_required_001",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["operationId"], "op_backup_required_001");
    assert_eq!(parsed["items"][0]["state"], "degraded");
    assert_eq!(parsed["items"][1]["state"], "running");
}

#[test]
fn events_list_text_surfaces_selected_operation_timeline() {
    let server = MockHttpServer::start(vec![(
        "/events?limit=20&operationId=op_backup_required_001",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "evt_011",
                        "kind": "operation_state_changed",
                        "operationId": "op_backup_required_001",
                        "operationType": "backup",
                        "state": "degraded",
                        "level": "warn",
                        "summary": "required GitHub backup is not configured",
                        "hostId": "host_alpha",
                        "emittedAt": "2026-04-16T19:00:02.000Z"
                    },
                    {
                        "id": "evt_010",
                        "kind": "operation_state_changed",
                        "operationId": "op_backup_required_001",
                        "operationType": "backup",
                        "state": "running",
                        "level": "info",
                        "summary": "backup operation entered running",
                        "hostId": "host_alpha",
                        "emittedAt": "2026-04-16T19:00:00.000Z"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &["events", "list", "--operation-id", "op_backup_required_001"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("op_backup_required_001"));
    assert!(stdout.contains("degraded"));
    assert!(stdout.contains("running"));
    assert!(stdout.contains("required GitHub backup is not configured"));
}

#[test]
fn health_checks_list_json_reads_degraded_bridge_verify_checks() {
    let server = MockHttpServer::start(vec![(
        "/health-checks?hostId=host_alpha&ruleId=rule_alpha_https",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "hc_rule_alpha_https_drift",
                        "hostId": "host_alpha",
                        "ruleId": "rule_alpha_https",
                        "category": "bridge_verify",
                        "status": "degraded",
                        "summary": "drift detected: expected expected_hash_alpha, observed observed_hash_bravo, rollback inspection required",
                        "backupPolicy": "required",
                        "checkedAt": "2026-04-16T18:45:00.000Z"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "health-checks",
            "list",
            "--json",
            "--host-id",
            "host_alpha",
            "--rule-id",
            "rule_alpha_https",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["status"], "degraded");
    assert_eq!(parsed["items"][0]["backupPolicy"], "required");
}

#[test]
fn backups_list_json_filters_by_host() {
    let server = MockHttpServer::start(vec![(
        "/backups?hostId=host_alpha",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "backup_alpha_001",
                        "hostId": "host_alpha",
                        "operationId": "op_backup_alpha_001",
                        "createdAt": "2026-04-16T19:05:00.000Z",
                        "backupMode": "required",
                        "localStatus": "succeeded",
                        "githubStatus": "not_configured",
                        "remoteTarget": "github",
                        "remoteConfigured": false,
                        "remoteStatusSummary": "GitHub backup missing; required-mode degradation stays active until remote backup is configured.",
                        "remoteAction": "Configure GitHub backup before rerunning required-mode mutations.",
                        "manifestPath": "/var/lib/portmanager/snapshots/op_backup_alpha_001-manifest.json"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &["backups", "list", "--json", "--host-id", "host_alpha"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["hostId"], "host_alpha");
    assert_eq!(parsed["items"][0]["localStatus"], "succeeded");
    assert_eq!(parsed["items"][0]["backupMode"], "required");
    assert_eq!(parsed["items"][0]["githubStatus"], "not_configured");
    assert_eq!(parsed["items"][0]["remoteTarget"], "github");
    assert_eq!(parsed["items"][0]["remoteConfigured"], false);
    assert_eq!(
        parsed["items"][0]["remoteAction"],
        "Configure GitHub backup before rerunning required-mode mutations."
    );
}

#[test]
fn backups_list_text_surfaces_backup_policy_and_remote_status() {
    let server = MockHttpServer::start(vec![(
        "/backups?hostId=host_alpha",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "backup_alpha_001",
                        "hostId": "host_alpha",
                        "operationId": "op_backup_alpha_001",
                        "createdAt": "2026-04-16T19:05:00.000Z",
                        "backupMode": "best_effort",
                        "localStatus": "succeeded",
                        "githubStatus": "not_configured",
                        "remoteTarget": "github",
                        "remoteConfigured": false,
                        "remoteStatusSummary": "GitHub backup missing; best_effort continues with local-only backup evidence.",
                        "remoteAction": "Configure GitHub backup for remote redundancy or keep best_effort local-only behavior.",
                        "manifestPath": "/var/lib/portmanager/snapshots/op_backup_alpha_001-manifest.json"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(&["backups", "list", "--host-id", "host_alpha"], &server.base_url());

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("best_effort"));
    assert!(stdout.contains("not_configured"));
    assert!(stdout.contains("Configure GitHub backup"));
}

#[test]
fn diagnostics_list_json_filters_by_host_and_rule() {
    let server = MockHttpServer::start(vec![(
        "/diagnostics?hostId=host_alpha&ruleId=rule_alpha_https",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "op_diag_001",
                        "type": "diagnostics",
                        "state": "succeeded",
                        "initiator": "web",
                        "hostId": "host_alpha",
                        "ruleId": "rule_alpha_https",
                        "startedAt": "2026-04-16T19:10:00.000Z",
                        "finishedAt": "2026-04-16T19:11:00.000Z",
                        "resultSummary": "diagnostics confirmed https relay and refreshed host readiness evidence",
                        "diagnosticResult": {
                            "hostId": "host_alpha",
                            "ruleId": "rule_alpha_https",
                            "port": 443,
                            "tcpReachable": true,
                            "httpStatus": 200,
                            "pageTitle": "Alpha Relay Healthy",
                            "finalUrl": "http://127.0.0.1/status"
                        },
                        "snapshotResult": {
                            "hostId": "host_alpha",
                            "ruleId": "rule_alpha_https",
                            "httpStatus": 200,
                            "pageTitle": "Alpha Relay Healthy",
                            "artifactPath": "/tmp/artifacts/snapshot-op_diag_001.html"
                        }
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "diagnostics",
            "list",
            "--json",
            "--host-id",
            "host_alpha",
            "--rule-id",
            "rule_alpha_https",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["type"], "diagnostics");
    assert_eq!(parsed["items"][0]["snapshotResult"]["pageTitle"], "Alpha Relay Healthy");
}

#[test]
fn rollback_points_list_json_filters_by_host_and_state() {
    let server = MockHttpServer::start(vec![(
        "/rollback-points?hostId=host_alpha&state=applied",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "rp_op_backup_alpha_001",
                        "hostId": "host_alpha",
                        "operationId": "op_backup_alpha_001",
                        "state": "applied",
                        "createdAt": "2026-04-16T19:14:00.000Z"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "rollback-points",
            "list",
            "--json",
            "--host-id",
            "host_alpha",
            "--state",
            "applied",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["id"], "rp_op_backup_alpha_001");
    assert_eq!(parsed["items"][0]["state"], "applied");
}

#[test]
fn rollback_points_apply_json_waits_for_terminal_operation() {
    let server = MockHttpServer::start(vec![
        (
            "/rollback-points/rp_op_backup_alpha_001/apply",
            vec![MockOutcome::Json {
                status: 202,
                body: json!({
                    "operationId": "op_rollback_001",
                    "state": "queued"
                }),
            }],
        ),
        (
            "/operations/op_rollback_001",
            vec![
                MockOutcome::Json {
                    status: 200,
                    body: json!({
                        "id": "op_rollback_001",
                        "type": "rollback",
                        "state": "queued",
                        "initiator": "cli",
                        "hostId": "host_alpha",
                        "startedAt": "2026-04-16T19:15:00.000Z"
                    }),
                },
                MockOutcome::Json {
                    status: 200,
                    body: json!({
                        "id": "op_rollback_001",
                        "type": "rollback",
                        "state": "succeeded",
                        "initiator": "cli",
                        "hostId": "host_alpha",
                        "startedAt": "2026-04-16T19:15:00.000Z",
                        "finishedAt": "2026-04-16T19:15:03.000Z",
                        "rollbackPointId": "rp_op_backup_alpha_001",
                        "resultSummary": "rollback rp_op_backup_alpha_001 applied"
                    }),
                },
            ],
        ),
    ]);

    let output = run_portmanager(
        &[
            "rollback-points",
            "apply",
            "rp_op_backup_alpha_001",
            "--json",
            "--wait",
            "--poll-interval-ms",
            "5",
            "--timeout-ms",
            "200",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["id"], "op_rollback_001");
    assert_eq!(parsed["state"], "succeeded");
    assert_eq!(parsed["rollbackPointId"], "rp_op_backup_alpha_001");
    assert_eq!(server.hits_for("/operations/op_rollback_001"), 2);
}

#[test]
fn operations_list_json_filters_by_host_state_and_type() {
    let server = MockHttpServer::start(vec![(
        "/operations?hostId=host_alpha&state=degraded&type=backup",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "op_backup_required_001",
                        "type": "backup",
                        "state": "degraded",
                        "hostId": "host_alpha",
                        "startedAt": "2026-04-16T20:00:00.000Z",
                        "finishedAt": "2026-04-16T20:00:02.000Z",
                        "resultSummary": "required GitHub backup is not configured",
                        "backupId": "backup_alpha_002",
                        "rollbackPointId": "rp_alpha_002"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "operations",
            "list",
            "--json",
            "--host-id",
            "host_alpha",
            "--state",
            "degraded",
            "--type",
            "backup",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["items"][0]["id"], "op_backup_required_001");
    assert_eq!(parsed["items"][0]["backupId"], "backup_alpha_002");
    assert_eq!(parsed["items"][0]["rollbackPointId"], "rp_alpha_002");
}

#[test]
fn operations_list_text_surfaces_result_summary_and_recovery_links() {
    let server = MockHttpServer::start(vec![(
        "/operations?hostId=host_alpha&state=degraded&type=backup",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "op_backup_required_001",
                        "type": "backup",
                        "state": "degraded",
                        "hostId": "host_alpha",
                        "startedAt": "2026-04-16T20:00:00.000Z",
                        "finishedAt": "2026-04-16T20:00:02.000Z",
                        "resultSummary": "required GitHub backup is not configured",
                        "backupId": "backup_alpha_002",
                        "rollbackPointId": "rp_alpha_002"
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "operations",
            "list",
            "--host-id",
            "host_alpha",
            "--state",
            "degraded",
            "--type",
            "backup",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("required GitHub backup is not configured"));
    assert!(stdout.contains("backup_alpha_002"));
    assert!(stdout.contains("rp_alpha_002"));
}

#[test]
fn operations_persistence_readiness_json_reads_shared_controller_surface() {
    let server = MockHttpServer::start(vec![(
        "/persistence-readiness",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "backend": "sqlite",
                "databasePath": "/var/lib/portmanager/controller.sqlite",
                "status": "monitor",
                "migrationTarget": "postgresql",
                "summary": "SQLite remains the active default store, but measured persistence pressure now needs explicit migration-readiness tracking.",
                "recommendedAction": "Keep SQLite as default, preserve schema parity, and rehearse PostgreSQL migration criteria before pressure crosses the next threshold.",
                "metrics": {
                    "operationRows": {
                        "current": 512,
                        "monitor": 500,
                        "migrationReady": 2000,
                        "status": "monitor"
                    },
                    "diagnosticRows": {
                        "current": 12,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "backupRows": {
                        "current": 8,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "rollbackPointRows": {
                        "current": 4,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "hostRows": {
                        "current": 3,
                        "monitor": 25,
                        "migrationReady": 100,
                        "status": "healthy"
                    }
                }
            }),
        }],
    )]);

    let output = run_portmanager(
        &["operations", "persistence-readiness", "--json"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");

    assert_eq!(parsed["status"], "monitor");
    assert_eq!(parsed["migrationTarget"], "postgresql");
    assert_eq!(parsed["metrics"]["operationRows"]["status"], "monitor");
}

#[test]
fn operations_persistence_readiness_json_supports_consumer_boundary_env_and_prefix() {
    let server = MockHttpServer::start(vec![(
        "/api/controller/persistence-readiness",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "backend": "sqlite",
                "databasePath": "/var/lib/portmanager/controller.sqlite",
                "status": "healthy",
                "migrationTarget": "postgresql",
                "summary": "consumer boundary surface is alive",
                "recommendedAction": "keep the current controller store",
                "metrics": {
                    "operationRows": {
                        "current": 12,
                        "monitor": 500,
                        "migrationReady": 2000,
                        "status": "healthy"
                    },
                    "diagnosticRows": {
                        "current": 3,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "backupRows": {
                        "current": 2,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "rollbackPointRows": {
                        "current": 2,
                        "monitor": 200,
                        "migrationReady": 750,
                        "status": "healthy"
                    },
                    "hostRows": {
                        "current": 1,
                        "monitor": 25,
                        "migrationReady": 100,
                        "status": "healthy"
                    }
                }
            }),
        }],
    )]);

    let consumer_base_url = format!("{}/api/controller", server.base_url());
    let output = run_portmanager_with_env(
        &["operations", "persistence-readiness", "--json"],
        &[("PORTMANAGER_CONSUMER_BASE_URL", consumer_base_url.as_str())],
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());
    assert_eq!(server.hits_for("/api/controller/persistence-readiness"), 1);
}

#[test]
fn operations_persistence_decision_pack_text_surfaces_review_state_and_triggers() {
    let server = MockHttpServer::start(vec![(
        "/persistence-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "backend": "sqlite",
                "migrationTarget": "postgresql",
                "decisionState": "review_required",
                "reviewRequired": true,
                "summary": "SQLite stays active, but PostgreSQL cutover review must begin now.",
                "nextActions": [
                    "Open PostgreSQL cutover review before widening orchestration breadth.",
                    "Keep SQLite active until review approves migration."
                ],
                "triggerMetrics": [
                    {
                        "key": "operationRows",
                        "label": "Operations",
                        "current": 2200,
                        "monitor": 500,
                        "migrationReady": 2000,
                        "status": "migration_ready",
                        "reason": "Operations crossed migration-ready threshold; PostgreSQL review required."
                    }
                ],
                "readiness": {
                    "backend": "sqlite",
                    "databasePath": "/var/lib/portmanager/controller.sqlite",
                    "status": "migration_ready",
                    "migrationTarget": "postgresql",
                    "summary": "raw readiness summary",
                    "recommendedAction": "open review",
                    "metrics": {
                        "operationRows": {
                            "current": 2200,
                            "monitor": 500,
                            "migrationReady": 2000,
                            "status": "migration_ready"
                        },
                        "diagnosticRows": {
                            "current": 12,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "backupRows": {
                            "current": 8,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "rollbackPointRows": {
                            "current": 4,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "hostRows": {
                            "current": 3,
                            "monitor": 25,
                            "migrationReady": 100,
                            "status": "healthy"
                        }
                    }
                }
            }),
        }],
    )]);

    let output = run_portmanager(
        &["operations", "persistence-decision-pack"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("Decision State: review_required"));
    assert!(stdout.contains("Review Required: yes"));
    assert!(stdout.contains("operationRows"));
    assert!(stdout.contains("Open PostgreSQL cutover review"));
}

#[test]
fn operations_persistence_decision_pack_json_supports_consumer_boundary_env_and_prefix() {
    let server = MockHttpServer::start(vec![(
        "/api/controller/persistence-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "backend": "sqlite",
                "migrationTarget": "postgresql",
                "decisionState": "hold",
                "reviewRequired": false,
                "summary": "SQLite stays active and no review is required yet.",
                "nextActions": ["Keep SQLite active."],
                "triggerMetrics": [],
                "readiness": {
                    "backend": "sqlite",
                    "databasePath": "/var/lib/portmanager/controller.sqlite",
                    "status": "healthy",
                    "migrationTarget": "postgresql",
                    "summary": "consumer boundary surface is alive",
                    "recommendedAction": "keep the current controller store",
                    "metrics": {
                        "operationRows": {
                            "current": 12,
                            "monitor": 500,
                            "migrationReady": 2000,
                            "status": "healthy"
                        },
                        "diagnosticRows": {
                            "current": 3,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "backupRows": {
                            "current": 2,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "rollbackPointRows": {
                            "current": 2,
                            "monitor": 200,
                            "migrationReady": 750,
                            "status": "healthy"
                        },
                        "hostRows": {
                            "current": 1,
                            "monitor": 25,
                            "migrationReady": 100,
                            "status": "healthy"
                        }
                    }
                }
            }),
        }],
    )]);

    let consumer_base_url = format!("{}/api/controller", server.base_url());
    let output = run_portmanager_with_env(
        &["operations", "persistence-decision-pack", "--json"],
        &[("PORTMANAGER_CONSUMER_BASE_URL", consumer_base_url.as_str())],
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());
    assert_eq!(server.hits_for("/api/controller/persistence-decision-pack"), 1);
}

#[test]
fn operations_consumer_boundary_decision_pack_text_surfaces_split_criteria() {
    let server = MockHttpServer::start(vec![(
        "/consumer-boundary-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "boundaryPath": "/api/controller",
                "hostingMode": "controller_embedded",
                "reviewOwner": "controller",
                "decisionState": "hold",
                "splitReviewRequired": false,
                "summary": "/api/controller should remain inside controller because standalone split criteria are still missing.",
                "nextActions": [
                    "Keep /api/controller embedded while standalone deployment ownership is absent.",
                    "Define dedicated edge policy and ownership split before reopening gateway review."
                ],
                "satisfiedCriteria": [
                    {
                        "id": "shared_contract_parity",
                        "label": "Shared contract parity",
                        "reason": "CLI, Web, and automation already share one generated consumer contract."
                    }
                ],
                "blockingCriteria": [
                    {
                        "id": "standalone_deployment_boundary",
                        "label": "Standalone deployment boundary",
                        "reason": "Consumer transport still ships inside controller with no independent deployment boundary."
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &["operations", "consumer-boundary-decision-pack"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("Boundary Path: /api/controller"));
    assert!(stdout.contains("Decision State: hold"));
    assert!(stdout.contains("Split Review Required: no"));
    assert!(stdout.contains("standalone_deployment_boundary"));
}

#[test]
fn operations_consumer_boundary_decision_pack_json_supports_consumer_boundary_env_and_prefix() {
    let server = MockHttpServer::start(vec![(
        "/api/controller/consumer-boundary-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "boundaryPath": "/api/controller",
                "hostingMode": "controller_embedded",
                "reviewOwner": "controller",
                "decisionState": "hold",
                "splitReviewRequired": false,
                "summary": "consumer boundary pack is alive",
                "nextActions": ["keep /api/controller embedded"],
                "satisfiedCriteria": [],
                "blockingCriteria": [
                    {
                        "id": "standalone_deployment_boundary",
                        "label": "Standalone deployment boundary",
                        "reason": "still missing"
                    }
                ]
            }),
        }],
    )]);

    let consumer_base_url = format!("{}/api/controller", server.base_url());
    let output = run_portmanager_with_env(
        &["operations", "consumer-boundary-decision-pack", "--json"],
        &[("PORTMANAGER_CONSUMER_BASE_URL", consumer_base_url.as_str())],
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());
    assert_eq!(server.hits_for("/api/controller/consumer-boundary-decision-pack"), 1);
}

#[test]
fn operations_deployment_boundary_decision_pack_text_surfaces_standalone_review_criteria() {
    let server = MockHttpServer::start(vec![(
        "/deployment-boundary-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "boundaryTarget": "/api/controller",
                "deploymentMode": "controller_embedded",
                "reviewOwner": "controller",
                "decisionState": "hold",
                "standaloneReviewRequired": false,
                "summary": "/api/controller should remain controller-embedded because standalone deployment evidence is still missing.",
                "nextActions": [
                    "Keep /api/controller controller-embedded while independent deployable artifact evidence is absent.",
                    "Prove edge runtime controls, standalone replay parity, and observability before reopening deployment review."
                ],
                "satisfiedCriteria": [
                    {
                        "id": "shared_consumer_contract",
                        "label": "Shared consumer contract",
                        "reason": "CLI, Web, and automation already share one consumer contract."
                    }
                ],
                "blockingCriteria": [
                    {
                        "id": "independent_deployable_artifact",
                        "label": "Independent deployable artifact",
                        "reason": "No separately deployable controller-adjacent artifact exists yet."
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &["operations", "deployment-boundary-decision-pack"],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("Boundary Target: /api/controller"));
    assert!(stdout.contains("Decision State: hold"));
    assert!(stdout.contains("Standalone Review Required: no"));
    assert!(stdout.contains("independent_deployable_artifact"));
}

#[test]
fn operations_deployment_boundary_decision_pack_json_supports_consumer_boundary_env_and_prefix() {
    let server = MockHttpServer::start(vec![(
        "/api/controller/deployment-boundary-decision-pack",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "boundaryTarget": "/api/controller",
                "deploymentMode": "controller_embedded",
                "reviewOwner": "controller",
                "decisionState": "hold",
                "standaloneReviewRequired": false,
                "summary": "deployment boundary pack is alive",
                "nextActions": ["keep /api/controller controller-embedded"],
                "satisfiedCriteria": [],
                "blockingCriteria": [
                    {
                        "id": "independent_deployable_artifact",
                        "label": "Independent deployable artifact",
                        "reason": "still missing"
                    }
                ]
            }),
        }],
    )]);

    let consumer_base_url = format!("{}/api/controller", server.base_url());
    let output = run_portmanager_with_env(
        &["operations", "deployment-boundary-decision-pack", "--json"],
        &[("PORTMANAGER_CONSUMER_BASE_URL", consumer_base_url.as_str())],
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());
    assert_eq!(server.hits_for("/api/controller/deployment-boundary-decision-pack"), 1);
}

#[test]
fn operations_audit_index_text_surfaces_linked_evidence() {
    let server = MockHttpServer::start(vec![(
        "/event-audit-index?limit=2&hostId=host_alpha&ruleId=rule_alpha_https",
        vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "operation": {
                            "id": "op_backup_required_001",
                            "type": "backup",
                            "state": "degraded",
                            "hostId": "host_alpha",
                            "ruleId": "rule_alpha_https",
                            "startedAt": "2026-04-21T10:10:00.000Z",
                            "finishedAt": "2026-04-21T10:11:00.000Z",
                            "resultSummary": "required GitHub backup is not configured",
                            "backupId": "backup_alpha_002",
                            "rollbackPointId": "rp_alpha_002"
                        },
                        "latestEvent": {
                            "id": "evt_002",
                            "kind": "operation_state_changed",
                            "operationId": "op_backup_required_001",
                            "operationType": "backup",
                            "state": "degraded",
                            "level": "warn",
                            "summary": "required GitHub backup is not configured",
                            "hostId": "host_alpha",
                            "ruleId": "rule_alpha_https",
                            "emittedAt": "2026-04-21T10:11:00.000Z"
                        },
                        "eventCount": 2,
                        "backup": {
                            "id": "backup_alpha_002"
                        },
                        "rollbackPoint": {
                            "id": "rp_alpha_002"
                        },
                        "linkedArtifacts": [
                            "/var/lib/portmanager/backups/backup_alpha_002/manifest.json"
                        ]
                    }
                ]
            }),
        }],
    )]);

    let output = run_portmanager(
        &[
            "operations",
            "audit-index",
            "--limit",
            "2",
            "--host-id",
            "host_alpha",
            "--rule-id",
            "rule_alpha_https",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("op_backup_required_001"));
    assert!(stdout.contains("required GitHub backup is not configured"));
    assert!(stdout.contains("backup_alpha_002"));
    assert!(stdout.contains("rp_alpha_002"));
    assert!(stdout.contains("/var/lib/portmanager/backups/backup_alpha_002/manifest.json"));
}
