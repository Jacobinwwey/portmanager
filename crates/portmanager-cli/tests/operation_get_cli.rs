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

fn run_portmanager(args: &[&str], base_url: &str) -> std::process::Output {
    Command::new(env!("CARGO_BIN_EXE_portmanager"))
        .args(args)
        .env("PORTMANAGER_CONTROLLER_BASE_URL", base_url)
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
