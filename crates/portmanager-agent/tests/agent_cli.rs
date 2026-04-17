use std::{
    fs,
    net::TcpListener,
    path::Path,
    process::{Child, Command, Stdio},
    thread,
    time::{Duration, Instant},
};

use serde_json::{json, Value};
use tempfile::TempDir;

fn run_agent(args: &[&str]) -> std::process::Output {
    Command::new(env!("CARGO_BIN_EXE_portmanager-agent"))
        .args(args)
        .output()
        .expect("run portmanager-agent")
}

fn bootstrap_agent(
    config_dir: &Path,
    state_dir: &Path,
    operation_id: &str,
) -> std::process::Output {
    run_agent(&[
        "bootstrap",
        "--operation-id",
        operation_id,
        "--host-id",
        "host_alpha",
        "--hostname",
        "alpha",
        "--tailscale-address",
        "100.64.0.10",
        "--config-dir",
        &config_dir.display().to_string(),
        "--state-dir",
        &state_dir.display().to_string(),
        "--json",
    ])
}

fn parse_json(output: &std::process::Output) -> Value {
    let stdout = String::from_utf8(output.stdout.clone()).expect("utf8 stdout");
    serde_json::from_str(&stdout).expect("json stdout")
}

fn reserve_port() -> u16 {
    TcpListener::bind(("127.0.0.1", 0))
        .expect("bind ephemeral port")
        .local_addr()
        .expect("port address")
        .port()
}

fn wait_for_agent(base_url: &str) {
    let start = Instant::now();
    while start.elapsed() < Duration::from_secs(5) {
        match ureq::get(&format!("{base_url}/health")).call() {
            Ok(response) if response.status() == 200 => return,
            _ => thread::sleep(Duration::from_millis(25)),
        }
    }

    panic!("agent service did not become healthy: {base_url}");
}

fn spawn_agent_service(config_dir: &Path, state_dir: &Path, port: u16) -> Child {
    let child = Command::new(env!("CARGO_BIN_EXE_portmanager-agent"))
        .args([
            "serve",
            "--bind-address",
            "127.0.0.1",
            "--port",
            &port.to_string(),
            "--config-dir",
            &config_dir.display().to_string(),
            "--state-dir",
            &state_dir.display().to_string(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn portmanager-agent serve");

    wait_for_agent(&format!("http://127.0.0.1:{port}"));
    child
}

#[test]
fn bootstrap_writes_agent_config_and_runtime_state() {
    let sandbox = TempDir::new().expect("tempdir");
    let config_dir = sandbox.path().join("config");
    let state_dir = sandbox.path().join("state");

    let output = bootstrap_agent(&config_dir, &state_dir, "op_bootstrap_001");

    assert!(output.status.success());
    assert!(output.stderr.is_empty());

    let parsed = parse_json(&output);
    let config_path = config_dir.join("agent.toml");
    let runtime_path = state_dir.join("runtime-state.json");
    let desired_state_path = state_dir.join("desired-state.toml");

    assert_eq!(parsed["schemaVersion"], "0.1.0");
    assert_eq!(parsed["operationId"], "op_bootstrap_001");
    assert_eq!(parsed["type"], "bootstrap");
    assert_eq!(parsed["state"], "succeeded");
    assert_eq!(parsed["hostId"], "host_alpha");
    assert_eq!(
        parsed["linkedArtifacts"],
        json!([
            config_path.display().to_string(),
            desired_state_path.display().to_string(),
            runtime_path.display().to_string()
        ])
    );

    let config_text = fs::read_to_string(&config_path).expect("agent config");
    assert!(config_text.contains("host_id = \"host_alpha\""));
    assert!(config_text.contains("tailscale_address = \"100.64.0.10\""));

    let runtime_state: Value =
        serde_json::from_str(&fs::read_to_string(&runtime_path).expect("runtime state file"))
            .expect("runtime state json");
    assert_eq!(runtime_state["hostId"], "host_alpha");
    assert_eq!(runtime_state["agentState"], "ready");
    assert_eq!(runtime_state["appliedRules"], json!([]));
}

#[test]
fn apply_then_collect_reports_runtime_state_from_desired_state() {
    let sandbox = TempDir::new().expect("tempdir");
    let config_dir = sandbox.path().join("config");
    let state_dir = sandbox.path().join("state");

    let bootstrap_output = bootstrap_agent(&config_dir, &state_dir, "op_bootstrap_001");
    assert!(bootstrap_output.status.success());

    let desired_state_path = sandbox.path().join("apply-desired-state.json");
    fs::write(
        &desired_state_path,
        serde_json::to_vec_pretty(&json!({
            "schemaVersion": "0.1.0",
            "hostId": "host_alpha",
            "policy": {
                "allowedSources": ["tailscale"],
                "excludedPorts": [22],
                "samePortMirror": false,
                "conflictPolicy": "reject",
                "backupPolicy": "required"
            },
            "bridgeRules": [
                {
                    "id": "rule_demo",
                    "name": "demo",
                    "protocol": "tcp",
                    "listenPort": 443,
                    "targetHost": "127.0.0.1",
                    "targetPort": 3000
                }
            ]
        }))
        .expect("serialize desired state"),
    )
    .expect("write desired state");

    let apply_output = run_agent(&[
        "apply",
        "--operation-id",
        "op_apply_001",
        "--desired-state-file",
        &desired_state_path.display().to_string(),
        "--state-dir",
        &state_dir.display().to_string(),
        "--json",
    ]);

    assert!(apply_output.status.success());
    let apply_result = parse_json(&apply_output);
    assert_eq!(apply_result["type"], "apply_desired_state");
    assert_eq!(apply_result["state"], "succeeded");
    assert_eq!(apply_result["ruleId"], "rule_demo");

    let collect_output = run_agent(&[
        "collect",
        "--state-dir",
        &state_dir.display().to_string(),
        "--json",
    ]);

    assert!(collect_output.status.success());
    let runtime_state = parse_json(&collect_output);
    assert_eq!(runtime_state["hostId"], "host_alpha");
    assert_eq!(runtime_state["agentState"], "ready");
    assert_eq!(runtime_state["appliedRules"][0]["id"], "rule_demo");
    assert_eq!(runtime_state["appliedRules"][0]["listenPort"], 443);
    assert_eq!(runtime_state["appliedRules"][0]["targetPort"], 3000);
    assert_eq!(runtime_state["appliedRules"][0]["status"], "applied_unverified");
    assert_eq!(
        runtime_state["effectiveStateHash"]
            .as_str()
            .expect("state hash")
            .len(),
        64
    );
}

#[test]
fn snapshot_creates_manifest_with_bundle_checksums() {
    let sandbox = TempDir::new().expect("tempdir");
    let state_dir = sandbox.path().join("state");
    let bundle_a = sandbox.path().join("desired-state.toml");
    let bundle_b = sandbox.path().join("nftables.rules");

    fs::create_dir_all(&state_dir).expect("create state dir");
    fs::write(&bundle_a, b"listen = 443\n").expect("write bundle a");
    fs::write(&bundle_b, b"tcp dport 443 redirect to :3000\n").expect("write bundle b");

    let output = run_agent(&[
        "snapshot",
        "--operation-id",
        "op_snapshot_001",
        "--host-id",
        "host_alpha",
        "--backup-mode",
        "required",
        "--bundle-file",
        &bundle_a.display().to_string(),
        "--bundle-file",
        &bundle_b.display().to_string(),
        "--state-dir",
        &state_dir.display().to_string(),
        "--json",
    ]);

    assert!(output.status.success());
    let manifest = parse_json(&output);
    let manifest_path = state_dir.join("snapshots").join("op_snapshot_001-manifest.json");

    assert_eq!(manifest["operationId"], "op_snapshot_001");
    assert_eq!(manifest["hostId"], "host_alpha");
    assert_eq!(manifest["backupMode"], "required");
    assert_eq!(
        manifest["bundleFiles"],
        json!([
            bundle_a.display().to_string(),
            bundle_b.display().to_string()
        ])
    );
    assert_eq!(manifest["checksums"].as_array().expect("checksums").len(), 2);

    let persisted: Value =
        serde_json::from_str(&fs::read_to_string(&manifest_path).expect("snapshot manifest"))
            .expect("snapshot manifest json");
    assert_eq!(persisted, manifest);
}

#[test]
fn rollback_writes_result_artifact() {
    let sandbox = TempDir::new().expect("tempdir");
    let state_dir = sandbox.path().join("state");
    let restore_a = sandbox.path().join("desired-state.toml");
    let restore_b = sandbox.path().join("runtime-state.json");

    fs::create_dir_all(&state_dir).expect("create state dir");
    fs::write(&restore_a, b"listen = 443\n").expect("write restore a");
    fs::write(&restore_b, b"{\"state\":\"ready\"}\n").expect("write restore b");

    let output = run_agent(&[
        "rollback",
        "--operation-id",
        "op_rollback_001",
        "--rollback-point-id",
        "rp_001",
        "--restore-file",
        &restore_a.display().to_string(),
        "--restore-file",
        &restore_b.display().to_string(),
        "--state-dir",
        &state_dir.display().to_string(),
        "--notes",
        "manual verify",
        "--json",
    ]);

    assert!(output.status.success());
    let rollback_result = parse_json(&output);
    let result_path = state_dir.join("rollback").join("rp_001-result.json");

    assert_eq!(rollback_result["rollbackPointId"], "rp_001");
    assert_eq!(rollback_result["operationId"], "op_rollback_001");
    assert_eq!(rollback_result["status"], "rolled_back");
    assert_eq!(rollback_result["notes"], "manual verify");
    assert_eq!(
        rollback_result["restoredArtifacts"],
        json!([
            restore_a.display().to_string(),
            restore_b.display().to_string()
        ])
    );

    let persisted: Value =
        serde_json::from_str(&fs::read_to_string(&result_path).expect("rollback result"))
            .expect("rollback result json");
    assert_eq!(persisted, rollback_result);
}

#[test]
fn serve_exposes_collect_apply_snapshot_and_rollback_over_http() {
    let sandbox = TempDir::new().expect("tempdir");
    let config_dir = sandbox.path().join("config");
    let state_dir = sandbox.path().join("state");

    let bootstrap_output = bootstrap_agent(&config_dir, &state_dir, "op_bootstrap_serve_001");
    assert!(bootstrap_output.status.success());

    let bundle_a = sandbox.path().join("desired-state.toml");
    let bundle_b = sandbox.path().join("nftables.rules");
    let diagnostic_artifact = sandbox.path().join("snapshot-op_diag_001.html");
    fs::write(&bundle_a, b"listen = 443\n").expect("write bundle a");
    fs::write(&bundle_b, b"tcp dport 443 redirect to :3000\n").expect("write bundle b");
    fs::write(&diagnostic_artifact, b"<html><title>Alpha Relay Healthy</title></html>")
        .expect("write diagnostic artifact");

    let port = reserve_port();
    let mut child = spawn_agent_service(&config_dir, &state_dir, port);
    let base_url = format!("http://127.0.0.1:{port}");

    let health: Value = ureq::get(&format!("{base_url}/health"))
        .call()
        .expect("health response")
        .into_json()
        .expect("health json");
    assert_eq!(health["status"], "ok");
    assert_eq!(health["agentVersion"], "0.1.0");

    let runtime_state: Value = ureq::get(&format!("{base_url}/runtime-state"))
        .call()
        .expect("runtime-state response")
        .into_json()
        .expect("runtime-state json");
    assert_eq!(runtime_state["hostId"], "host_alpha");
    assert_eq!(runtime_state["agentState"], "ready");
    assert_eq!(runtime_state["agentVersion"], "0.1.0");

    let apply_result: Value = ureq::post(&format!("{base_url}/apply"))
        .send_json(json!({
            "operationId": "op_apply_http_001",
            "desiredState": {
                "schemaVersion": "0.1.0",
                "hostId": "host_alpha",
                "policy": {
                    "allowedSources": ["tailscale"],
                    "excludedPorts": [22],
                    "samePortMirror": false,
                    "conflictPolicy": "reject",
                    "backupPolicy": "required"
                },
                "bridgeRules": [
                    {
                        "id": "rule_http_demo",
                        "name": "demo",
                        "protocol": "tcp",
                        "listenPort": 443,
                        "targetHost": "127.0.0.1",
                        "targetPort": 3000
                    }
                ]
            }
        }))
        .expect("apply response")
        .into_json()
        .expect("apply json");
    assert_eq!(apply_result["type"], "apply_desired_state");
    assert_eq!(apply_result["state"], "succeeded");

    let updated_runtime_state: Value = ureq::get(&format!("{base_url}/runtime-state"))
        .call()
        .expect("runtime-state after apply")
        .into_json()
        .expect("runtime-state after apply json");
    assert_eq!(updated_runtime_state["agentVersion"], "0.1.0");
    assert_eq!(updated_runtime_state["appliedRules"][0]["id"], "rule_http_demo");
    assert_eq!(updated_runtime_state["appliedRules"][0]["status"], "applied_unverified");

    let snapshot_manifest: Value = ureq::post(&format!("{base_url}/snapshot"))
        .send_json(json!({
            "operationId": "op_snapshot_http_001",
            "hostId": "host_alpha",
            "backupMode": "required",
            "bundleFiles": [
                bundle_a.display().to_string(),
                bundle_b.display().to_string()
            ],
            "diagnosticArtifacts": [diagnostic_artifact.display().to_string()]
        }))
        .expect("snapshot response")
        .into_json()
        .expect("snapshot json");
    assert_eq!(snapshot_manifest["operationId"], "op_snapshot_http_001");
    assert_eq!(snapshot_manifest["checksums"].as_array().expect("checksums").len(), 2);

    let rollback_result: Value = ureq::post(&format!("{base_url}/rollback"))
        .send_json(json!({
            "operationId": "op_rollback_http_001",
            "rollbackPointId": "rp_http_001",
            "restoreFiles": [
                bundle_a.display().to_string(),
                bundle_b.display().to_string()
            ],
            "notes": "http rollback verify"
        }))
        .expect("rollback response")
        .into_json()
        .expect("rollback json");
    assert_eq!(rollback_result["rollbackPointId"], "rp_http_001");
    assert_eq!(rollback_result["status"], "rolled_back");

    let _ = child.kill();
    let _ = child.wait();
}
