use std::{
    fs,
    path::{Path, PathBuf},
    process::ExitCode,
    time::SystemTime,
};

use clap::{Args, Parser, Subcommand};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use thiserror::Error;
use time::format_description::well_known::Rfc3339;
use time::OffsetDateTime;

const SCHEMA_VERSION: &str = "0.1.0";

#[derive(Parser)]
#[command(name = "portmanager-agent")]
#[command(about = "PortManager agent skeleton")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Bootstrap(BootstrapArgs),
    Apply(ApplyArgs),
    Collect(CollectArgs),
    Snapshot(SnapshotArgs),
    Rollback(RollbackArgs),
}

#[derive(Args)]
struct BootstrapArgs {
    #[arg(long)]
    operation_id: String,
    #[arg(long)]
    host_id: String,
    #[arg(long)]
    hostname: String,
    #[arg(long)]
    tailscale_address: String,
    #[arg(long, default_value = "/etc/portmanager")]
    config_dir: PathBuf,
    #[arg(long, default_value = "/var/lib/portmanager")]
    state_dir: PathBuf,
    #[arg(long)]
    json: bool,
}

#[derive(Args)]
struct ApplyArgs {
    #[arg(long)]
    operation_id: String,
    #[arg(long)]
    desired_state_file: PathBuf,
    #[arg(long, default_value = "/var/lib/portmanager")]
    state_dir: PathBuf,
    #[arg(long)]
    json: bool,
}

#[derive(Args)]
struct CollectArgs {
    #[arg(long, default_value = "/var/lib/portmanager")]
    state_dir: PathBuf,
    #[arg(long)]
    json: bool,
}

#[derive(Args)]
struct SnapshotArgs {
    #[arg(long)]
    operation_id: String,
    #[arg(long)]
    host_id: String,
    #[arg(long)]
    backup_mode: String,
    #[arg(long = "bundle-file", required = true)]
    bundle_files: Vec<PathBuf>,
    #[arg(long = "diagnostic-artifact")]
    diagnostic_artifacts: Vec<PathBuf>,
    #[arg(long, default_value = "/var/lib/portmanager")]
    state_dir: PathBuf,
    #[arg(long)]
    json: bool,
}

#[derive(Args)]
struct RollbackArgs {
    #[arg(long)]
    operation_id: String,
    #[arg(long)]
    rollback_point_id: String,
    #[arg(long = "restore-file")]
    restore_files: Vec<PathBuf>,
    #[arg(long)]
    notes: Option<String>,
    #[arg(long, default_value = "/var/lib/portmanager")]
    state_dir: PathBuf,
    #[arg(long)]
    json: bool,
}

#[derive(Debug, Error)]
enum AgentError {
    #[error("failed to read {path}: {source}")]
    ReadFile {
        path: String,
        source: std::io::Error,
    },
    #[error("failed to write {path}: {source}")]
    WriteFile {
        path: String,
        source: std::io::Error,
    },
    #[error("failed to create directory {path}: {source}")]
    CreateDir {
        path: String,
        source: std::io::Error,
    },
    #[error("failed to parse JSON from {path}: {source}")]
    ParseJson {
        path: String,
        source: serde_json::Error,
    },
    #[error("runtime state not initialized at {path}")]
    MissingRuntimeState { path: String },
    #[error("desired state host {desired_host_id} does not match initialized host {runtime_host_id}")]
    HostMismatch {
        desired_host_id: String,
        runtime_host_id: String,
    },
    #[error("failed to format timestamp: {0}")]
    TimeFormat(#[from] time::error::Format),
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorOutput {
    error: &'static str,
    message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OperationResult {
    schema_version: &'static str,
    operation_id: String,
    #[serde(rename = "type")]
    operation_type: String,
    state: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    host_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    rule_id: Option<String>,
    started_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    finished_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    result_summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    linked_artifacts: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeState {
    schema_version: String,
    host_id: String,
    agent_state: String,
    effective_state_hash: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    health: Option<HealthState>,
    applied_rules: Vec<AppliedRule>,
    updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HealthState {
    summary: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    signals: Option<Vec<HealthSignal>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HealthSignal {
    code: String,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AppliedRule {
    id: String,
    listen_port: u16,
    target_host: String,
    target_port: u16,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_verified_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesiredState {
    _schema_version: String,
    host_id: String,
    policy: DesiredPolicy,
    bridge_rules: Vec<DesiredBridgeRule>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesiredPolicy {
    allowed_sources: Vec<String>,
    excluded_ports: Vec<u16>,
    same_port_mirror: bool,
    conflict_policy: String,
    backup_policy: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesiredBridgeRule {
    id: String,
    #[allow(dead_code)]
    name: Option<String>,
    #[allow(dead_code)]
    protocol: String,
    listen_port: u16,
    target_host: String,
    target_port: u16,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SnapshotManifest {
    schema_version: &'static str,
    operation_id: String,
    host_id: String,
    created_at: String,
    artifact_version: &'static str,
    backup_mode: String,
    bundle_files: Vec<String>,
    checksums: Vec<ChecksumEntry>,
    #[serde(skip_serializing_if = "Option::is_none")]
    diagnostic_artifacts: Option<Vec<String>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ChecksumEntry {
    path: String,
    sha256: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RollbackResult {
    schema_version: &'static str,
    rollback_point_id: String,
    operation_id: String,
    status: &'static str,
    verified_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    restored_artifacts: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    let result = execute(cli);
    match result {
        Ok(output) => {
            println!("{output}");
            ExitCode::SUCCESS
        }
        Err((message, json_mode)) => {
            if json_mode {
                let payload = serde_json::to_string(&ErrorOutput {
                    error: "agent_error",
                    message,
                })
                .expect("serialize error");
                println!("{payload}");
            } else {
                eprintln!("{message}");
            }
            ExitCode::from(1)
        }
    }
}

fn execute(cli: Cli) -> Result<String, (String, bool)> {
    match cli.command {
        Commands::Bootstrap(args) => render_json(run_bootstrap(&args), args.json),
        Commands::Apply(args) => render_json(run_apply(&args), args.json),
        Commands::Collect(args) => render_json(run_collect(&args), args.json),
        Commands::Snapshot(args) => render_json(run_snapshot(&args), args.json),
        Commands::Rollback(args) => render_json(run_rollback(&args), args.json),
    }
}

fn render_json<T: Serialize>(result: Result<T, AgentError>, json_mode: bool) -> Result<String, (String, bool)> {
    match result {
        Ok(value) => {
            if json_mode {
                serde_json::to_string(&value)
                    .map_err(|error| (error.to_string(), json_mode))
            } else {
                serde_json::to_string_pretty(&value)
                    .map_err(|error| (error.to_string(), json_mode))
            }
        }
        Err(error) => Err((error.to_string(), json_mode)),
    }
}

fn run_bootstrap(args: &BootstrapArgs) -> Result<OperationResult, AgentError> {
    ensure_dir(&args.config_dir)?;
    ensure_dir(&args.state_dir)?;

    let started_at = now_iso()?;
    let config_path = args.config_dir.join("agent.toml");
    let desired_state_path = args.state_dir.join("desired-state.toml");
    let runtime_state_path = args.state_dir.join("runtime-state.json");

    write_text(
        &config_path,
        format!(
            "host_id = \"{}\"\nhostname = \"{}\"\ntailscale_address = \"{}\"\n",
            args.host_id, args.hostname, args.tailscale_address
        ),
    )?;
    write_text(&desired_state_path, "# initialized by portmanager-agent bootstrap\n")?;

    let runtime_state = RuntimeState {
        schema_version: SCHEMA_VERSION.to_string(),
        host_id: args.host_id.clone(),
        agent_state: "ready".to_string(),
        effective_state_hash: compute_effective_state_hash(&args.host_id, &[]),
        health: Some(HealthState {
            summary: "bootstrap completed".to_string(),
            signals: Some(vec![HealthSignal {
                code: "bootstrap_initialized".to_string(),
                status: "healthy".to_string(),
                message: Some("agent directories and baseline runtime state created".to_string()),
            }]),
        }),
        applied_rules: Vec::new(),
        updated_at: started_at.clone(),
    };
    write_json(&runtime_state_path, &runtime_state)?;

    Ok(OperationResult {
        schema_version: SCHEMA_VERSION,
        operation_id: args.operation_id.clone(),
        operation_type: "bootstrap".to_string(),
        state: "succeeded",
        host_id: Some(args.host_id.clone()),
        rule_id: None,
        started_at: started_at.clone(),
        finished_at: Some(started_at),
        result_summary: Some("agent bootstrap skeleton completed".to_string()),
        linked_artifacts: Some(vec![
            path_string(&config_path),
            path_string(&desired_state_path),
            path_string(&runtime_state_path),
        ]),
    })
}

fn run_apply(args: &ApplyArgs) -> Result<OperationResult, AgentError> {
    let started_at = now_iso()?;
    let desired_state: DesiredState = read_json(&args.desired_state_file)?;
    let runtime_state_path = args.state_dir.join("runtime-state.json");
    let mut runtime_state = read_runtime_state(&runtime_state_path)?;

    if runtime_state.host_id != desired_state.host_id {
        return Err(AgentError::HostMismatch {
            desired_host_id: desired_state.host_id,
            runtime_host_id: runtime_state.host_id,
        });
    }

    let applied_rules = desired_state
        .bridge_rules
        .iter()
        .map(|rule| AppliedRule {
            id: rule.id.clone(),
            listen_port: rule.listen_port,
            target_host: rule.target_host.clone(),
            target_port: rule.target_port,
            status: "applied_unverified".to_string(),
            last_verified_at: None,
        })
        .collect::<Vec<_>>();

    let health_summary = format!(
        "{} rule(s) staged with backup policy {}",
        desired_state.bridge_rules.len(),
        desired_state.policy.backup_policy
    );

    runtime_state.agent_state = "ready".to_string();
    runtime_state.effective_state_hash =
        compute_effective_state_hash(&runtime_state.host_id, &applied_rules);
    runtime_state.health = Some(HealthState {
        summary: health_summary.clone(),
        signals: Some(vec![
            HealthSignal {
                code: "allowed_sources".to_string(),
                status: "healthy".to_string(),
                message: Some(desired_state.policy.allowed_sources.join(",")),
            },
            HealthSignal {
                code: "conflict_policy".to_string(),
                status: "healthy".to_string(),
                message: Some(desired_state.policy.conflict_policy.clone()),
            },
            HealthSignal {
                code: "excluded_ports".to_string(),
                status: if desired_state.policy.same_port_mirror {
                    "degraded".to_string()
                } else {
                    "healthy".to_string()
                },
                message: Some(
                    desired_state
                        .policy
                        .excluded_ports
                        .iter()
                        .map(u16::to_string)
                        .collect::<Vec<_>>()
                        .join(","),
                ),
            },
        ]),
    });
    runtime_state.applied_rules = applied_rules.clone();
    runtime_state.updated_at = started_at.clone();

    write_json(&runtime_state_path, &runtime_state)?;

    Ok(OperationResult {
        schema_version: SCHEMA_VERSION,
        operation_id: args.operation_id.clone(),
        operation_type: "apply_desired_state".to_string(),
        state: "succeeded",
        host_id: Some(runtime_state.host_id.clone()),
        rule_id: applied_rules.first().map(|rule| rule.id.clone()),
        started_at: started_at.clone(),
        finished_at: Some(started_at),
        result_summary: Some(format!("applied {} rule(s)", applied_rules.len())),
        linked_artifacts: Some(vec![path_string(&runtime_state_path)]),
    })
}

fn run_collect(args: &CollectArgs) -> Result<RuntimeState, AgentError> {
    let runtime_state_path = args.state_dir.join("runtime-state.json");
    read_runtime_state(&runtime_state_path)
}

fn run_snapshot(args: &SnapshotArgs) -> Result<SnapshotManifest, AgentError> {
    let created_at = now_iso()?;
    let snapshot_dir = args.state_dir.join("snapshots");
    ensure_dir(&snapshot_dir)?;

    let mut checksums = Vec::new();
    let mut bundle_files = Vec::new();

    for bundle_file in &args.bundle_files {
        let bytes = read_bytes(bundle_file)?;
        bundle_files.push(path_string(bundle_file));
        checksums.push(ChecksumEntry {
            path: path_string(bundle_file),
            sha256: sha256_hex(&bytes),
        });
    }

    let diagnostic_artifacts = (!args.diagnostic_artifacts.is_empty()).then(|| {
        args.diagnostic_artifacts
            .iter()
            .map(|path| path_string(path))
            .collect::<Vec<_>>()
    });

    let manifest = SnapshotManifest {
        schema_version: SCHEMA_VERSION,
        operation_id: args.operation_id.clone(),
        host_id: args.host_id.clone(),
        created_at,
        artifact_version: SCHEMA_VERSION,
        backup_mode: args.backup_mode.clone(),
        bundle_files,
        checksums,
        diagnostic_artifacts,
    };

    let manifest_path = snapshot_dir.join(format!("{}-manifest.json", args.operation_id));
    write_json(&manifest_path, &manifest)?;
    Ok(manifest)
}

fn run_rollback(args: &RollbackArgs) -> Result<RollbackResult, AgentError> {
    let rollback_dir = args.state_dir.join("rollback");
    ensure_dir(&rollback_dir)?;

    let restored_artifacts = (!args.restore_files.is_empty()).then(|| {
        args.restore_files
            .iter()
            .map(|path| path_string(path))
            .collect::<Vec<_>>()
    });

    let result = RollbackResult {
        schema_version: SCHEMA_VERSION,
        rollback_point_id: args.rollback_point_id.clone(),
        operation_id: args.operation_id.clone(),
        status: "rolled_back",
        verified_at: now_iso()?,
        restored_artifacts,
        notes: args.notes.clone(),
    };

    let result_path = rollback_dir.join(format!("{}-result.json", args.rollback_point_id));
    write_json(&result_path, &result)?;
    Ok(result)
}

fn ensure_dir(path: &Path) -> Result<(), AgentError> {
    fs::create_dir_all(path).map_err(|source| AgentError::CreateDir {
        path: path_string(path),
        source,
    })
}

fn write_text(path: &Path, contents: impl AsRef<[u8]>) -> Result<(), AgentError> {
    fs::write(path, contents).map_err(|source| AgentError::WriteFile {
        path: path_string(path),
        source,
    })
}

fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), AgentError> {
    let bytes = serde_json::to_vec_pretty(value).expect("serialize json");
    write_text(path, bytes)
}

fn read_json<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<T, AgentError> {
    let text = fs::read_to_string(path).map_err(|source| AgentError::ReadFile {
        path: path_string(path),
        source,
    })?;

    serde_json::from_str(&text).map_err(|source| AgentError::ParseJson {
        path: path_string(path),
        source,
    })
}

fn read_runtime_state(path: &Path) -> Result<RuntimeState, AgentError> {
    if !path.exists() {
        return Err(AgentError::MissingRuntimeState {
            path: path_string(path),
        });
    }
    read_json(path)
}

fn read_bytes(path: &Path) -> Result<Vec<u8>, AgentError> {
    fs::read(path).map_err(|source| AgentError::ReadFile {
        path: path_string(path),
        source,
    })
}

fn now_iso() -> Result<String, AgentError> {
    let now = OffsetDateTime::from(SystemTime::now());
    Ok(now.format(&Rfc3339)?)
}

fn compute_effective_state_hash(host_id: &str, applied_rules: &[AppliedRule]) -> String {
    let payload = serde_json::to_vec(&(host_id, applied_rules)).expect("serialize hash payload");
    sha256_hex(&payload)
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let digest = hasher.finalize();
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn path_string(path: &Path) -> String {
    path.display().to_string()
}
