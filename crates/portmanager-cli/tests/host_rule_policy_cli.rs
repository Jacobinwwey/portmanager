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
}

struct MockRoute {
    method: &'static str,
    path: &'static str,
    outcomes: Vec<MockOutcome>,
}

#[derive(Clone, Debug)]
struct RecordedRequest {
    method: String,
    path: String,
    body: String,
}

struct MockHttpServer {
    address: SocketAddr,
    hits: Arc<Mutex<HashMap<String, usize>>>,
    requests: Arc<Mutex<Vec<RecordedRequest>>>,
    shutdown: Arc<AtomicBool>,
    thread: Option<JoinHandle<()>>,
}

impl MockHttpServer {
    fn start(routes: Vec<MockRoute>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind mock server");
        listener
            .set_nonblocking(true)
            .expect("set listener nonblocking");

        let address = listener.local_addr().expect("read local addr");
        let shutdown = Arc::new(AtomicBool::new(false));
        let shutdown_flag = Arc::clone(&shutdown);

        let hits = Arc::new(Mutex::new(HashMap::<String, usize>::new()));
        let hits_for_thread = Arc::clone(&hits);

        let requests = Arc::new(Mutex::new(Vec::<RecordedRequest>::new()));
        let requests_for_thread = Arc::clone(&requests);

        let responses = Arc::new(Mutex::new(
            routes
                .into_iter()
                .map(|route| {
                    (
                        format!("{} {}", route.method, route.path),
                        VecDeque::from(route.outcomes),
                    )
                })
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

                        let request_bytes = read_full_request(&mut stream);
                        if request_bytes.is_empty() {
                            continue;
                        }

                        let request = String::from_utf8(request_bytes).expect("request utf8");
                        let (request_line, body) = request.split_once("\r\n\r\n").unwrap_or((&request, ""));
                        let mut request_line_parts = request_line.lines().next().expect("request line").split_whitespace();
                        let method = request_line_parts.next().expect("request method").to_string();
                        let path = request_line_parts.next().expect("request path").to_string();
                        let key = format!("{} {}", method, path);

                        let mut hits = hits_for_thread.lock().expect("lock hits");
                        *hits.entry(key.clone()).or_default() += 1;
                        drop(hits);

                        requests_for_thread
                            .lock()
                            .expect("lock requests")
                            .push(RecordedRequest {
                                method,
                                path: path.clone(),
                                body: body.to_string(),
                            });

                        let outcome = {
                            let mut responses =
                                responses_for_thread.lock().expect("lock response queue");
                            let queue = responses.get_mut(&key).expect("path registered");
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
                                    202 => "Accepted",
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
            requests,
            shutdown,
            thread: Some(thread),
        }
    }

    fn base_url(&self) -> String {
        format!("http://{}", self.address)
    }

    fn hits_for(&self, method: &str, path: &str) -> usize {
        self.hits
            .lock()
            .expect("lock hits")
            .get(&format!("{} {}", method, path))
            .copied()
            .unwrap_or_default()
    }

    fn last_request_json(&self, method: &str, path: &str) -> Value {
        let request = self
            .requests
            .lock()
            .expect("lock requests")
            .iter()
            .rev()
            .find(|request| request.method == method && request.path == path)
            .cloned()
            .expect("recorded request");

        serde_json::from_str(&request.body).expect("request json")
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

fn read_full_request(stream: &mut std::net::TcpStream) -> Vec<u8> {
    let mut buffer = Vec::new();
    let mut scratch = [0_u8; 4096];
    let mut header_end = None;
    let mut expected_length = None;

    loop {
        let read = stream.read(&mut scratch).expect("read request");
        if read == 0 {
            break;
        }

        buffer.extend_from_slice(&scratch[..read]);

        if header_end.is_none() {
            header_end = find_header_end(&buffer);
            if let Some(end) = header_end {
                expected_length = Some(parse_content_length(&buffer[..end]));
            }
        }

        if let Some(end) = header_end {
            let content_length = expected_length.unwrap_or(0);
            if buffer.len() >= end + content_length {
                break;
            }
        }
    }

    buffer
}

fn find_header_end(bytes: &[u8]) -> Option<usize> {
    bytes.windows(4).position(|window| window == b"\r\n\r\n").map(|index| index + 4)
}

fn parse_content_length(headers: &[u8]) -> usize {
    let text = String::from_utf8_lossy(headers);
    text.lines()
        .find_map(|line| {
            let (name, value) = line.split_once(':')?;
            if name.eq_ignore_ascii_case("content-length") {
                value.trim().parse::<usize>().ok()
            } else {
                None
            }
        })
        .unwrap_or(0)
}

fn queued_operation(operation_id: &str) -> Value {
    json!({
        "operationId": operation_id,
        "state": "queued"
    })
}

fn terminal_operation(
    operation_id: &str,
    operation_type: &str,
    state: &str,
    host_id: &str,
    rule_id: Option<&str>,
) -> Value {
    json!({
        "id": operation_id,
        "type": operation_type,
        "state": state,
        "initiator": "cli",
        "hostId": host_id,
        "ruleId": rule_id,
        "startedAt": "2026-04-17T13:30:00.000Z",
        "finishedAt": "2026-04-17T13:30:02.000Z",
        "resultSummary": format!("{operation_type} completed"),
        "backupId": if operation_type == "update_rule" { json!("backup_alpha_001") } else { Value::Null },
        "rollbackPointId": if matches!(operation_type, "update_rule" | "remove_rule") {
            json!("rp_alpha_001")
        } else {
            Value::Null
        },
        "eventStreamUrl": format!("/operations/events?operationId={operation_id}")
    })
}

fn run_portmanager(args: &[&str], base_url: &str) -> std::process::Output {
    Command::new(env!("CARGO_BIN_EXE_portmanager"))
        .args(args)
        .env("PORTMANAGER_CONTROLLER_BASE_URL", base_url)
        .output()
        .expect("run portmanager")
}

#[test]
fn hosts_list_json_reads_controller_host_inventory() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/hosts",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "host_alpha",
                        "name": "Alpha Relay",
                        "lifecycleState": "ready",
                        "agentState": "ready",
                        "tailscaleAddress": "100.64.0.10"
                    }
                ]
            }),
        }],
    }]);

    let output = run_portmanager(&["hosts", "list", "--json"], &server.base_url());

    assert!(output.status.success());
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["items"][0]["id"], "host_alpha");
    assert_eq!(parsed["items"][0]["name"], "Alpha Relay");
    assert_eq!(parsed["items"][0]["lifecycleState"], "ready");
}

#[test]
fn hosts_get_text_surfaces_detail_context() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/hosts/host_alpha",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "id": "host_alpha",
                "name": "Alpha Relay",
                "labels": ["edge", "prod"],
                "lifecycleState": "ready",
                "agentState": "ready",
                "tailscaleAddress": "100.64.0.10",
                "sshPort": 22,
                "effectivePolicy": {
                    "allowedSources": ["tailscale", "admin"],
                    "excludedPorts": [22, 8443],
                    "samePortMirror": true,
                    "conflictPolicy": "replace_existing",
                    "backupPolicy": "required"
                },
                "recentRules": [
                    {
                        "id": "rule_alpha_https",
                        "name": "HTTPS Relay",
                        "lifecycleState": "desired"
                    }
                ],
                "recentOperations": [
                    {
                        "id": "op_bootstrap_host_001",
                        "type": "bootstrap_host",
                        "state": "succeeded"
                    }
                ]
            }),
        }],
    }]);

    let output = run_portmanager(&["hosts", "get", "host_alpha"], &server.base_url());

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("Alpha Relay"));
    assert!(stdout.contains("required"));
    assert!(stdout.contains("HTTPS Relay"));
    assert!(stdout.contains("bootstrap_host"));
}

#[test]
fn hosts_get_json_reports_not_found_structurally() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/hosts/host_missing",
        outcomes: vec![MockOutcome::Json {
            status: 404,
            body: json!({ "error": "host_not_found" }),
        }],
    }]);

    let output = run_portmanager(&["hosts", "get", "host_missing", "--json"], &server.base_url());

    assert!(!output.status.success());
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["error"], "not_found");
    assert_eq!(parsed["status"], 404);
}

#[test]
fn hosts_create_wait_json_submits_contract_body_and_returns_terminal_operation() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "POST",
            path: "/hosts",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_create_host_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_create_host_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation("op_create_host_001", "create_host", "succeeded", "host_alpha", None),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "hosts",
            "create",
            "--name",
            "Alpha Relay",
            "--label",
            "edge",
            "--label",
            "prod",
            "--ssh-host",
            "100.64.0.10",
            "--ssh-port",
            "22",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["id"], "op_create_host_001");
    assert_eq!(parsed["type"], "create_host");
    assert_eq!(parsed["state"], "succeeded");

    let request = server.last_request_json("POST", "/hosts");
    assert_eq!(
        request,
        json!({
            "name": "Alpha Relay",
            "labels": ["edge", "prod"],
            "ssh": {
                "host": "100.64.0.10",
                "port": 22
            }
        })
    );
}

#[test]
fn hosts_probe_wait_json_submits_mode_and_returns_terminal_operation() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "POST",
            path: "/hosts/host_alpha/probe",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_probe_host_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_probe_host_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation("op_probe_host_001", "probe_host", "succeeded", "host_alpha", None),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "hosts",
            "probe",
            "host_alpha",
            "--mode",
            "read_only",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["type"], "probe_host");

    let request = server.last_request_json("POST", "/hosts/host_alpha/probe");
    assert_eq!(request, json!({ "mode": "read_only" }));
}

#[test]
fn hosts_bootstrap_wait_json_submits_bootstrap_contract_body() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "POST",
            path: "/hosts/host_alpha/bootstrap",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_bootstrap_host_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_bootstrap_host_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation(
                    "op_bootstrap_host_001",
                    "bootstrap_host",
                    "succeeded",
                    "host_alpha",
                    None,
                ),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "hosts",
            "bootstrap",
            "host_alpha",
            "--ssh-user",
            "ubuntu",
            "--desired-agent-port",
            "8711",
            "--backup-policy",
            "best_effort",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["type"], "bootstrap_host");

    let request = server.last_request_json("POST", "/hosts/host_alpha/bootstrap");
    assert_eq!(
        request,
        json!({
            "sshUser": "ubuntu",
            "desiredAgentPort": 8711,
            "backupPolicy": "best_effort"
        })
    );
}

#[test]
fn bridge_rules_list_json_reads_controller_rule_inventory() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/bridge-rules",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "rule_alpha_https",
                        "hostId": "host_alpha",
                        "name": "HTTPS Relay",
                        "protocol": "tcp",
                        "listenPort": 443,
                        "targetHost": "127.0.0.1",
                        "targetPort": 3000,
                        "lifecycleState": "desired"
                    }
                ]
            }),
        }],
    }]);

    let output = run_portmanager(&["bridge-rules", "list", "--json"], &server.base_url());

    assert!(output.status.success());
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["items"][0]["id"], "rule_alpha_https");
    assert_eq!(parsed["items"][0]["listenPort"], 443);
}

#[test]
fn bridge_rules_get_text_surfaces_target_and_lifecycle() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/bridge-rules/rule_alpha_https",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "id": "rule_alpha_https",
                "hostId": "host_alpha",
                "name": "HTTPS Relay",
                "protocol": "tcp",
                "listenPort": 443,
                "targetHost": "127.0.0.1",
                "targetPort": 3000,
                "lifecycleState": "degraded",
                "lastRollbackPointId": "rp_alpha_001"
            }),
        }],
    }]);

    let output = run_portmanager(&["bridge-rules", "get", "rule_alpha_https"], &server.base_url());

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("HTTPS Relay"));
    assert!(stdout.contains("443"));
    assert!(stdout.contains("127.0.0.1"));
    assert!(stdout.contains("degraded"));
    assert!(stdout.contains("rp_alpha_001"));
}

#[test]
fn bridge_rules_create_wait_json_submits_contract_body() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "POST",
            path: "/bridge-rules",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_create_rule_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_create_rule_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation("op_create_rule_001", "create_rule", "succeeded", "host_alpha", None),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "bridge-rules",
            "create",
            "--host-id",
            "host_alpha",
            "--name",
            "HTTPS Relay",
            "--protocol",
            "tcp",
            "--listen-port",
            "443",
            "--target-host",
            "127.0.0.1",
            "--target-port",
            "3000",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["type"], "create_rule");

    let request = server.last_request_json("POST", "/bridge-rules");
    assert_eq!(
        request,
        json!({
            "hostId": "host_alpha",
            "name": "HTTPS Relay",
            "protocol": "tcp",
            "listenPort": 443,
            "targetHost": "127.0.0.1",
            "targetPort": 3000
        })
    );
}

#[test]
fn bridge_rules_update_wait_json_surfaces_backup_and_rollback_evidence() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "PATCH",
            path: "/bridge-rules/rule_alpha_https",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_update_rule_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_update_rule_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation(
                    "op_update_rule_001",
                    "update_rule",
                    "degraded",
                    "host_alpha",
                    Some("rule_alpha_https"),
                ),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "bridge-rules",
            "update",
            "rule_alpha_https",
            "--name",
            "Updated Relay",
            "--target-port",
            "4000",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["type"], "update_rule");
    assert_eq!(parsed["state"], "degraded");
    assert_eq!(parsed["backupId"], "backup_alpha_001");
    assert_eq!(parsed["rollbackPointId"], "rp_alpha_001");

    let request = server.last_request_json("PATCH", "/bridge-rules/rule_alpha_https");
    assert_eq!(
        request,
        json!({
            "name": "Updated Relay",
            "targetPort": 4000
        })
    );
}

#[test]
fn bridge_rules_delete_wait_text_surfaces_terminal_state() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "DELETE",
            path: "/bridge-rules/rule_alpha_https",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_remove_rule_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_remove_rule_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation(
                    "op_remove_rule_001",
                    "remove_rule",
                    "degraded",
                    "host_alpha",
                    Some("rule_alpha_https"),
                ),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "bridge-rules",
            "delete",
            "rule_alpha_https",
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
    assert!(stdout.contains("op_remove_rule_001"));
    assert!(stdout.contains("remove_rule"));
    assert!(stdout.contains("degraded"));
}

#[test]
fn exposure_policies_get_json_reads_host_policy() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/exposure-policies/host_alpha",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "hostId": "host_alpha",
                "allowedSources": ["tailscale", "admin"],
                "excludedPorts": [22, 8443],
                "samePortMirror": true,
                "conflictPolicy": "replace_existing",
                "backupPolicy": "required"
            }),
        }],
    }]);

    let output = run_portmanager(
        &["exposure-policies", "get", "host_alpha", "--json"],
        &server.base_url(),
    );

    assert!(output.status.success());
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["hostId"], "host_alpha");
    assert_eq!(parsed["backupPolicy"], "required");
}

#[test]
fn exposure_policies_set_wait_json_submits_policy_contract_body() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "PUT",
            path: "/exposure-policies/host_alpha",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_apply_policy_001"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_apply_policy_001",
            outcomes: vec![MockOutcome::Json {
                status: 200,
                body: terminal_operation(
                    "op_apply_policy_001",
                    "apply_policy",
                    "succeeded",
                    "host_alpha",
                    None,
                ),
            }],
        },
    ]);

    let output = run_portmanager(
        &[
            "exposure-policies",
            "set",
            "host_alpha",
            "--allowed-source",
            "tailscale",
            "--allowed-source",
            "admin",
            "--excluded-port",
            "22",
            "--excluded-port",
            "8443",
            "--same-port-mirror",
            "--conflict-policy",
            "replace_existing",
            "--backup-policy",
            "required",
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
    let parsed: Value = serde_json::from_slice(&output.stdout).expect("json stdout");
    assert_eq!(parsed["type"], "apply_policy");
    assert_eq!(parsed["state"], "succeeded");

    let request = server.last_request_json("PUT", "/exposure-policies/host_alpha");
    assert_eq!(
        request,
        json!({
            "hostId": "host_alpha",
            "allowedSources": ["tailscale", "admin"],
            "excludedPorts": [22, 8443],
            "samePortMirror": true,
            "conflictPolicy": "replace_existing",
            "backupPolicy": "required"
        })
    );
    assert_eq!(server.hits_for("GET", "/operations/op_apply_policy_001"), 1);
}
