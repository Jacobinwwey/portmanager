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
                        let (request_line, body) =
                            request.split_once("\r\n\r\n").unwrap_or((&request, ""));
                        let mut request_line_parts = request_line
                            .lines()
                            .next()
                            .expect("request line")
                            .split_whitespace();
                        let method = request_line_parts
                            .next()
                            .expect("request method")
                            .to_string();
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
    bytes.windows(4)
        .position(|window| window == b"\r\n\r\n")
        .map(|index| index + 4)
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

fn batch_operation_detail(state: &str) -> Value {
    json!({
        "id": "op_batch_123",
        "type": "batch_apply_policy",
        "state": state,
        "initiator": "web",
        "startedAt": "2026-04-21T12:00:00.000Z",
        "finishedAt": if matches!(state, "queued" | "running") { Value::Null } else { json!("2026-04-21T12:00:02.000Z") },
        "resultSummary": "batch policy applied for 2 hosts; 1 succeeded, 1 degraded, 0 failed",
        "eventStreamUrl": "/operations/events?operationId=op_batch_123",
        "batchSummary": {
            "totalTargets": 2,
            "succeededTargets": 1,
            "degradedTargets": 1,
            "failedTargets": 0,
            "targetHostIds": ["host_alpha", "host_beta"]
        },
        "childOperations": [
            {
                "id": "op_apply_policy_host_alpha",
                "type": "apply_policy",
                "state": "succeeded",
                "hostId": "host_alpha",
                "parentOperationId": "op_batch_123",
                "startedAt": "2026-04-21T12:00:00.100Z",
                "finishedAt": "2026-04-21T12:00:01.000Z",
                "resultSummary": "policy applied for host_alpha"
            },
            {
                "id": "op_apply_policy_host_beta",
                "type": "apply_policy",
                "state": "degraded",
                "hostId": "host_beta",
                "parentOperationId": "op_batch_123",
                "startedAt": "2026-04-21T12:00:01.100Z",
                "finishedAt": "2026-04-21T12:00:02.000Z",
                "resultSummary": "policy applied for host_beta with degradation"
            }
        ]
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
fn operations_batch_apply_policy_wait_posts_batch_request_and_returns_parent_detail() {
    let server = MockHttpServer::start(vec![
        MockRoute {
            method: "POST",
            path: "/batch-operations/exposure-policies/apply",
            outcomes: vec![MockOutcome::Json {
                status: 202,
                body: queued_operation("op_batch_123"),
            }],
        },
        MockRoute {
            method: "GET",
            path: "/operations/op_batch_123",
            outcomes: vec![
                MockOutcome::Json {
                    status: 200,
                    body: batch_operation_detail("queued"),
                },
                MockOutcome::Json {
                    status: 200,
                    body: batch_operation_detail("succeeded"),
                },
            ],
        },
    ]);

    let output = run_portmanager(
        &[
            "operations",
            "batch-apply-policy",
            "--host-id",
            "host_alpha",
            "--host-id",
            "host_beta",
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
            "--wait",
            "--poll-interval-ms",
            "5",
            "--timeout-ms",
            "200",
            "--json",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");
    assert_eq!(parsed["type"], "batch_apply_policy");
    assert_eq!(parsed["batchSummary"]["totalTargets"], 2);
    assert_eq!(parsed["childOperations"].as_array().map(Vec::len), Some(2));

    let request = server.last_request_json("POST", "/batch-operations/exposure-policies/apply");
    assert_eq!(
        request,
        json!({
            "hostIds": ["host_alpha", "host_beta"],
            "allowedSources": ["tailscale", "admin"],
            "excludedPorts": [22, 8443],
            "samePortMirror": true,
            "conflictPolicy": "replace_existing",
            "backupPolicy": "required"
        })
    );
}

#[test]
fn operations_list_supports_parent_operation_id_filter() {
    let server = MockHttpServer::start(vec![MockRoute {
        method: "GET",
        path: "/operations?parentOperationId=op_batch_123",
        outcomes: vec![MockOutcome::Json {
            status: 200,
            body: json!({
                "items": [
                    {
                        "id": "op_apply_policy_host_alpha",
                        "type": "apply_policy",
                        "state": "succeeded",
                        "hostId": "host_alpha",
                        "parentOperationId": "op_batch_123",
                        "startedAt": "2026-04-21T12:00:00.100Z",
                        "finishedAt": "2026-04-21T12:00:01.000Z",
                        "resultSummary": "policy applied for host_alpha"
                    }
                ]
            }),
        }],
    }]);

    let output = run_portmanager(
        &[
            "operations",
            "list",
            "--json",
            "--parent-operation-id",
            "op_batch_123",
        ],
        &server.base_url(),
    );

    assert!(output.status.success());
    assert!(output.stderr.is_empty());
    assert_eq!(server.hits_for("GET", "/operations?parentOperationId=op_batch_123"), 1);

    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    let parsed: Value = serde_json::from_str(&stdout).expect("json stdout");
    assert_eq!(parsed["items"][0]["parentOperationId"], "op_batch_123");
}
