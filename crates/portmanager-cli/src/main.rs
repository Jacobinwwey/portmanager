use std::{
    env,
    process::ExitCode,
    time::{Duration, Instant},
};

use clap::{Args, Parser, Subcommand, ValueEnum};
use reqwest::{Client, Method, RequestBuilder, StatusCode};
use serde::Serialize;
use serde_json::{json, Map, Value};
use thiserror::Error;

#[derive(Parser)]
#[command(name = "portmanager")]
#[command(about = "PortManager CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Backups(BackupsCommand),
    BridgeRules(BridgeRulesCommand),
    Diagnostics(DiagnosticsCommand),
    Events(EventsCommand),
    ExposurePolicies(ExposurePoliciesCommand),
    HealthChecks(HealthChecksCommand),
    Hosts(HostsCommand),
    Operation(OperationCommand),
    Operations(OperationsCommand),
    RollbackPoints(RollbackPointsCommand),
}

#[derive(Args)]
struct BackupsCommand {
    #[command(subcommand)]
    command: BackupsSubcommand,
}

#[derive(Subcommand)]
enum BackupsSubcommand {
    List(BackupsListArgs),
}

#[derive(Args)]
struct BridgeRulesCommand {
    #[command(subcommand)]
    command: BridgeRulesSubcommand,
}

#[derive(Subcommand)]
enum BridgeRulesSubcommand {
    Create(BridgeRulesCreateArgs),
    Delete(BridgeRulesDeleteArgs),
    Get(BridgeRulesGetArgs),
    List(BridgeRulesListArgs),
    Update(BridgeRulesUpdateArgs),
}

#[derive(Args)]
struct DiagnosticsCommand {
    #[command(subcommand)]
    command: DiagnosticsSubcommand,
}

#[derive(Subcommand)]
enum DiagnosticsSubcommand {
    List(DiagnosticsListArgs),
}

#[derive(Args)]
struct EventsCommand {
    #[command(subcommand)]
    command: EventsSubcommand,
}

#[derive(Subcommand)]
enum EventsSubcommand {
    List(EventsListArgs),
}

#[derive(Args)]
struct ExposurePoliciesCommand {
    #[command(subcommand)]
    command: ExposurePoliciesSubcommand,
}

#[derive(Subcommand)]
enum ExposurePoliciesSubcommand {
    Get(ExposurePoliciesGetArgs),
    Set(ExposurePoliciesSetArgs),
}

#[derive(Args)]
struct HealthChecksCommand {
    #[command(subcommand)]
    command: HealthChecksSubcommand,
}

#[derive(Subcommand)]
enum HealthChecksSubcommand {
    List(HealthChecksListArgs),
}

#[derive(Args)]
struct HostsCommand {
    #[command(subcommand)]
    command: HostsSubcommand,
}

#[derive(Subcommand)]
enum HostsSubcommand {
    Bootstrap(HostsBootstrapArgs),
    Create(HostsCreateArgs),
    Get(HostsGetArgs),
    List(HostsListArgs),
    Probe(HostsProbeArgs),
}

#[derive(Args)]
struct OperationCommand {
    #[command(subcommand)]
    command: OperationSubcommand,
}

#[derive(Args)]
struct OperationsCommand {
    #[command(subcommand)]
    command: OperationsSubcommand,
}

#[derive(Subcommand)]
enum OperationSubcommand {
    Get(OperationGetArgs),
}

#[derive(Subcommand)]
enum OperationsSubcommand {
    AuditIndex(OperationsAuditIndexArgs),
    BatchApplyPolicy(OperationsBatchApplyPolicyArgs),
    ConsumerBoundaryDecisionPack(OperationsConsumerBoundaryDecisionPackArgs),
    DeploymentBoundaryDecisionPack(OperationsDeploymentBoundaryDecisionPackArgs),
    List(OperationsListArgs),
    PersistenceDecisionPack(OperationsPersistenceDecisionPackArgs),
    PersistenceReadiness(OperationsPersistenceReadinessArgs),
    SecondTargetPolicyPack(OperationsSecondTargetPolicyPackArgs),
}

#[derive(Args)]
struct RollbackPointsCommand {
    #[command(subcommand)]
    command: RollbackPointsSubcommand,
}

#[derive(Subcommand)]
enum RollbackPointsSubcommand {
    Apply(RollbackPointsApplyArgs),
    List(RollbackPointsListArgs),
}

#[derive(Clone, Copy, ValueEnum)]
enum BackupPolicyArg {
    #[value(name = "best_effort")]
    BestEffort,
    #[value(name = "required")]
    Required,
}

impl BackupPolicyArg {
    fn as_controller_value(self) -> &'static str {
        match self {
            Self::BestEffort => "best_effort",
            Self::Required => "required",
        }
    }
}

#[derive(Clone, Copy, ValueEnum)]
enum ConflictPolicyArg {
    #[value(name = "reject")]
    Reject,
    #[value(name = "replace_existing")]
    ReplaceExisting,
}

impl ConflictPolicyArg {
    fn as_controller_value(self) -> &'static str {
        match self {
            Self::Reject => "reject",
            Self::ReplaceExisting => "replace_existing",
        }
    }
}

#[derive(Clone, Copy, ValueEnum)]
enum ProbeModeArg {
    #[value(name = "read_only")]
    ReadOnly,
}

impl ProbeModeArg {
    fn as_controller_value(self) -> &'static str {
        match self {
            Self::ReadOnly => "read_only",
        }
    }
}

#[derive(Clone, Copy, ValueEnum)]
enum RuleProtocolArg {
    #[value(name = "tcp")]
    Tcp,
}

impl RuleProtocolArg {
    fn as_controller_value(self) -> &'static str {
        match self {
            Self::Tcp => "tcp",
        }
    }
}

#[derive(Args, Clone)]
struct OperationGetArgs {
    operation_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct EventsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, default_value_t = 20)]
    limit: u16,
    #[arg(long)]
    operation_id: Option<String>,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    rule_id: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HostsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HostsGetArgs {
    host_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HostsCreateArgs {
    #[arg(long)]
    name: String,
    #[arg(long = "label")]
    labels: Vec<String>,
    #[arg(long)]
    target_profile_id: Option<String>,
    #[arg(long)]
    ssh_host: String,
    #[arg(long)]
    ssh_port: u16,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HostsProbeArgs {
    host_id: String,
    #[arg(long)]
    mode: Option<ProbeModeArg>,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HostsBootstrapArgs {
    host_id: String,
    #[arg(long)]
    ssh_user: String,
    #[arg(long)]
    desired_agent_port: u16,
    #[arg(long)]
    backup_policy: Option<BackupPolicyArg>,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BridgeRulesListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BridgeRulesGetArgs {
    rule_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BridgeRulesCreateArgs {
    #[arg(long)]
    host_id: String,
    #[arg(long)]
    name: Option<String>,
    #[arg(long)]
    protocol: RuleProtocolArg,
    #[arg(long)]
    listen_port: u16,
    #[arg(long)]
    target_host: String,
    #[arg(long)]
    target_port: u16,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BridgeRulesUpdateArgs {
    rule_id: String,
    #[arg(long)]
    name: Option<String>,
    #[arg(long)]
    listen_port: Option<u16>,
    #[arg(long)]
    target_host: Option<String>,
    #[arg(long)]
    target_port: Option<u16>,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BridgeRulesDeleteArgs {
    rule_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct ExposurePoliciesGetArgs {
    host_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct ExposurePoliciesSetArgs {
    host_id: String,
    #[arg(long = "allowed-source")]
    allowed_sources: Vec<String>,
    #[arg(long = "excluded-port")]
    excluded_ports: Vec<u16>,
    #[arg(long, default_value_t = false)]
    same_port_mirror: bool,
    #[arg(long)]
    conflict_policy: ConflictPolicyArg,
    #[arg(long)]
    backup_policy: BackupPolicyArg,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct BackupsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    operation_id: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct DiagnosticsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    rule_id: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct HealthChecksListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    rule_id: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    parent_operation_id: Option<String>,
    #[arg(long)]
    rule_id: Option<String>,
    #[arg(long)]
    state: Option<String>,
    #[arg(long)]
    r#type: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsAuditIndexArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, default_value_t = 20)]
    limit: u16,
    #[arg(long)]
    operation_id: Option<String>,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    parent_operation_id: Option<String>,
    #[arg(long)]
    rule_id: Option<String>,
    #[arg(long)]
    state: Option<String>,
    #[arg(long)]
    r#type: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsPersistenceReadinessArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsPersistenceDecisionPackArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsConsumerBoundaryDecisionPackArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsDeploymentBoundaryDecisionPackArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsSecondTargetPolicyPackArgs {
    #[arg(long)]
    json: bool,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct OperationsBatchApplyPolicyArgs {
    #[arg(long = "host-id")]
    host_ids: Vec<String>,
    #[arg(long = "allowed-source")]
    allowed_sources: Vec<String>,
    #[arg(long = "excluded-port")]
    excluded_ports: Vec<u16>,
    #[arg(long, default_value_t = false)]
    same_port_mirror: bool,
    #[arg(long)]
    conflict_policy: ConflictPolicyArg,
    #[arg(long)]
    backup_policy: BackupPolicyArg,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct RollbackPointsApplyArgs {
    rollback_point_id: String,
    #[arg(long)]
    json: bool,
    #[arg(long)]
    wait: bool,
    #[arg(long, default_value_t = 30_000)]
    timeout_ms: u64,
    #[arg(long, default_value_t = 250)]
    poll_interval_ms: u64,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Args, Clone)]
struct RollbackPointsListArgs {
    #[arg(long)]
    json: bool,
    #[arg(long)]
    host_id: Option<String>,
    #[arg(long)]
    state: Option<String>,
    #[arg(long, env = "PORTMANAGER_CONTROLLER_BASE_URL")]
    controller_base_url: String,
}

#[derive(Debug, Error)]
enum CliError {
    #[error("operation payload missing state")]
    InvalidOperationPayload,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonErrorOutput {
    error: &'static str,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    operation_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    timeout_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    status: Option<u16>,
}

struct ExecutionResult {
    body: String,
    exit_code: ExitCode,
}

impl ExecutionResult {
    fn success_json(value: &Value) -> Self {
        Self {
            body: serde_json::to_string(value).expect("serialize json success"),
            exit_code: ExitCode::SUCCESS,
        }
    }

    fn success_text(body: String) -> Self {
        Self {
            body,
            exit_code: ExitCode::SUCCESS,
        }
    }

    fn error_json(error: JsonErrorOutput) -> Self {
        Self {
            body: serde_json::to_string(&error).expect("serialize json error"),
            exit_code: ExitCode::from(1),
        }
    }
}

#[derive(Clone)]
struct WaitOptions {
    json: bool,
    wait: bool,
    timeout_ms: u64,
    poll_interval_ms: u64,
    controller_base_url: String,
}

fn hydrate_consumer_base_url_env() {
    if env::var_os("PORTMANAGER_CONTROLLER_BASE_URL").is_none() {
        if let Some(consumer_base_url) = env::var_os("PORTMANAGER_CONSUMER_BASE_URL") {
            unsafe {
                env::set_var("PORTMANAGER_CONTROLLER_BASE_URL", consumer_base_url);
            }
        }
    }
}

#[tokio::main]
async fn main() -> ExitCode {
    hydrate_consumer_base_url_env();
    let cli = Cli::parse();
    let result = execute(cli).await;
    println!("{}", result.body);
    result.exit_code
}

async fn execute(cli: Cli) -> ExecutionResult {
    match cli.command {
        Commands::Backups(command) => match command.command {
            BackupsSubcommand::List(args) => run_backups_list(args).await,
        },
        Commands::BridgeRules(command) => match command.command {
            BridgeRulesSubcommand::Create(args) => run_bridge_rules_create(args).await,
            BridgeRulesSubcommand::Delete(args) => run_bridge_rules_delete(args).await,
            BridgeRulesSubcommand::Get(args) => run_bridge_rules_get(args).await,
            BridgeRulesSubcommand::List(args) => run_bridge_rules_list(args).await,
            BridgeRulesSubcommand::Update(args) => run_bridge_rules_update(args).await,
        },
        Commands::Diagnostics(command) => match command.command {
            DiagnosticsSubcommand::List(args) => run_diagnostics_list(args).await,
        },
        Commands::Events(command) => match command.command {
            EventsSubcommand::List(args) => run_events_list(args).await,
        },
        Commands::ExposurePolicies(command) => match command.command {
            ExposurePoliciesSubcommand::Get(args) => run_exposure_policies_get(args).await,
            ExposurePoliciesSubcommand::Set(args) => run_exposure_policies_set(args).await,
        },
        Commands::HealthChecks(command) => match command.command {
            HealthChecksSubcommand::List(args) => run_health_checks_list(args).await,
        },
        Commands::Hosts(command) => match command.command {
            HostsSubcommand::Bootstrap(args) => run_hosts_bootstrap(args).await,
            HostsSubcommand::Create(args) => run_hosts_create(args).await,
            HostsSubcommand::Get(args) => run_hosts_get(args).await,
            HostsSubcommand::List(args) => run_hosts_list(args).await,
            HostsSubcommand::Probe(args) => run_hosts_probe(args).await,
        },
        Commands::Operation(command) => match command.command {
            OperationSubcommand::Get(args) => run_operation_get(args).await,
        },
        Commands::Operations(command) => match command.command {
            OperationsSubcommand::AuditIndex(args) => run_operations_audit_index(args).await,
            OperationsSubcommand::BatchApplyPolicy(args) => {
                run_operations_batch_apply_policy(args).await
            }
            OperationsSubcommand::ConsumerBoundaryDecisionPack(args) => {
                run_operations_consumer_boundary_decision_pack(args).await
            }
            OperationsSubcommand::DeploymentBoundaryDecisionPack(args) => {
                run_operations_deployment_boundary_decision_pack(args).await
            }
            OperationsSubcommand::List(args) => run_operations_list(args).await,
            OperationsSubcommand::PersistenceDecisionPack(args) => {
                run_operations_persistence_decision_pack(args).await
            }
            OperationsSubcommand::PersistenceReadiness(args) => {
                run_operations_persistence_readiness(args).await
            }
            OperationsSubcommand::SecondTargetPolicyPack(args) => {
                run_operations_second_target_policy_pack(args).await
            }
        },
        Commands::RollbackPoints(command) => match command.command {
            RollbackPointsSubcommand::Apply(args) => run_rollback_points_apply(args).await,
            RollbackPointsSubcommand::List(args) => run_rollback_points_list(args).await,
        },
    }
}

async fn run_operation_get(args: OperationGetArgs) -> ExecutionResult {
    let client = Client::new();
    let deadline = Instant::now() + Duration::from_millis(args.timeout_ms);

    loop {
        match fetch_operation(&client, &args.controller_base_url, &args.operation_id).await {
            Ok(operation) => {
                let state = match operation_state(&operation) {
                    Ok(state) => state.to_string(),
                    Err(error) => {
                        return json_or_text_error(
                            &args,
                            JsonErrorOutput {
                                error: "protocol",
                                message: error.to_string(),
                                operation_id: Some(args.operation_id.clone()),
                                last_state: None,
                                timeout_ms: None,
                                status: None,
                            },
                            error.to_string(),
                        );
                    }
                };

                if !args.wait || is_terminal_state(&state) {
                    return if args.json {
                        ExecutionResult::success_json(&operation)
                    } else {
                        ExecutionResult::success_text(format_operation_detail_text(
                            &operation,
                            &args.operation_id,
                        ))
                    };
                }

                if Instant::now() >= deadline {
                    return json_or_text_error(
                        &args,
                        JsonErrorOutput {
                            error: "timeout",
                            message: format!(
                                "operation {} did not reach a terminal state before timeout",
                                args.operation_id
                            ),
                            operation_id: Some(args.operation_id.clone()),
                            last_state: Some(state.clone()),
                            timeout_ms: Some(args.timeout_ms),
                            status: None,
                        },
                        format!(
                            "operation {} timed out while waiting in state {}",
                            args.operation_id, state
                        ),
                    );
                }

                tokio::time::sleep(Duration::from_millis(args.poll_interval_ms)).await;
            }
            Err(error) => {
                return json_or_text_error(&args, error, "operation fetch failed".to_string());
            }
        }
    }
}

async fn run_events_list(args: EventsListArgs) -> ExecutionResult {
    match fetch_events(
        &Client::new(),
        &args.controller_base_url,
        args.limit,
        args.operation_id.as_deref(),
        args.host_id.as_deref(),
        args.rule_id.as_deref(),
    )
    .await
    {
        Ok(events) => {
            if args.json {
                ExecutionResult::success_json(&events)
            } else {
                let lines = events["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|event| {
                        format!(
                            "{} {} {} {}",
                            event["emittedAt"].as_str().unwrap_or("unknown"),
                            event["operationId"].as_str().unwrap_or("unknown"),
                            event["state"].as_str().unwrap_or("unknown"),
                            event["summary"].as_str().unwrap_or("missing summary")
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => json_or_text_error_flag(args.json, error, "event fetch failed".to_string()),
    }
}

async fn run_hosts_list(args: HostsListArgs) -> ExecutionResult {
    match fetch_hosts(&Client::new(), &args.controller_base_url).await {
        Ok(hosts) => {
            if args.json {
                ExecutionResult::success_json(&hosts)
            } else {
                let lines = hosts["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(format_host_summary_text)
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => json_or_text_error_flag(args.json, error, "host fetch failed".to_string()),
    }
}

async fn run_hosts_get(args: HostsGetArgs) -> ExecutionResult {
    match fetch_host_detail(&Client::new(), &args.controller_base_url, &args.host_id).await {
        Ok(host) => {
            if args.json {
                ExecutionResult::success_json(&host)
            } else {
                ExecutionResult::success_text(format_host_detail_text(&host, &args.host_id))
            }
        }
        Err(error) => json_or_text_error_flag(args.json, error, "host fetch failed".to_string()),
    }
}

async fn run_hosts_create(args: HostsCreateArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match create_host(
        &client,
        &args.controller_base_url,
        &args.name,
        &args.labels,
        args.target_profile_id.as_deref(),
        &args.ssh_host,
        args.ssh_port,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "host create").await
        }
        Err(error) => json_or_text_error_flag(args.json, error, "host create failed".to_string()),
    }
}

async fn run_hosts_probe(args: HostsProbeArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match probe_host(&client, &args.controller_base_url, &args.host_id, args.mode).await {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "host probe").await
        }
        Err(error) => json_or_text_error_flag(args.json, error, "host probe failed".to_string()),
    }
}

async fn run_hosts_bootstrap(args: HostsBootstrapArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match bootstrap_host(
        &client,
        &args.controller_base_url,
        &args.host_id,
        &args.ssh_user,
        args.desired_agent_port,
        args.backup_policy,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "host bootstrap").await
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "host bootstrap failed".to_string())
        }
    }
}

async fn run_bridge_rules_list(args: BridgeRulesListArgs) -> ExecutionResult {
    match fetch_bridge_rules(&Client::new(), &args.controller_base_url).await {
        Ok(rules) => {
            if args.json {
                ExecutionResult::success_json(&rules)
            } else {
                let lines = rules["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(format_bridge_rule_summary_text)
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "bridge rule fetch failed".to_string())
        }
    }
}

async fn run_bridge_rules_get(args: BridgeRulesGetArgs) -> ExecutionResult {
    match fetch_bridge_rule_detail(&Client::new(), &args.controller_base_url, &args.rule_id).await {
        Ok(rule) => {
            if args.json {
                ExecutionResult::success_json(&rule)
            } else {
                ExecutionResult::success_text(format_bridge_rule_detail_text(&rule, &args.rule_id))
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "bridge rule fetch failed".to_string())
        }
    }
}

async fn run_bridge_rules_create(args: BridgeRulesCreateArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match create_bridge_rule(
        &client,
        &args.controller_base_url,
        &args.host_id,
        args.name.as_deref(),
        args.protocol,
        args.listen_port,
        &args.target_host,
        args.target_port,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "bridge rule create")
                .await
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "bridge rule create failed".to_string())
        }
    }
}

async fn run_bridge_rules_update(args: BridgeRulesUpdateArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match update_bridge_rule(
        &client,
        &args.controller_base_url,
        &args.rule_id,
        args.name.as_deref(),
        args.listen_port,
        args.target_host.as_deref(),
        args.target_port,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "bridge rule update")
                .await
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "bridge rule update failed".to_string())
        }
    }
}

async fn run_bridge_rules_delete(args: BridgeRulesDeleteArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match delete_bridge_rule(&client, &args.controller_base_url, &args.rule_id).await {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "bridge rule delete")
                .await
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "bridge rule delete failed".to_string())
        }
    }
}

async fn run_exposure_policies_get(args: ExposurePoliciesGetArgs) -> ExecutionResult {
    match fetch_exposure_policy(&Client::new(), &args.controller_base_url, &args.host_id).await {
        Ok(policy) => {
            if args.json {
                ExecutionResult::success_json(&policy)
            } else {
                ExecutionResult::success_text(format_exposure_policy_text(&policy, &args.host_id))
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "exposure policy fetch failed".to_string())
        }
    }
}

async fn run_exposure_policies_set(args: ExposurePoliciesSetArgs) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match set_exposure_policy(
        &client,
        &args.controller_base_url,
        &args.host_id,
        &args.allowed_sources,
        &args.excluded_ports,
        args.same_port_mirror,
        args.conflict_policy,
        args.backup_policy,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(&client, &wait_options, accepted, "exposure policy apply")
                .await
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "exposure policy apply failed".to_string())
        }
    }
}

async fn run_backups_list(args: BackupsListArgs) -> ExecutionResult {
    match fetch_backups(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
        args.operation_id.as_deref(),
    )
    .await
    {
        Ok(backups) => {
            if args.json {
                ExecutionResult::success_json(&backups)
            } else {
                let lines = backups["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|backup| {
                        format!(
                            "{} {} {} {} {} | {} | action: {}",
                            backup["createdAt"].as_str().unwrap_or("unknown"),
                            backup["hostId"].as_str().unwrap_or("unknown"),
                            backup["backupMode"].as_str().unwrap_or("unknown"),
                            backup["localStatus"].as_str().unwrap_or("unknown"),
                            backup["githubStatus"].as_str().unwrap_or("unknown"),
                            backup["remoteStatusSummary"]
                                .as_str()
                                .unwrap_or("remote backup guidance unavailable"),
                            backup["remoteAction"]
                                .as_str()
                                .unwrap_or("no remote action guidance"),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => json_or_text_error_flag(args.json, error, "backup fetch failed".to_string()),
    }
}

async fn run_diagnostics_list(args: DiagnosticsListArgs) -> ExecutionResult {
    match fetch_diagnostics(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
        args.rule_id.as_deref(),
    )
    .await
    {
        Ok(diagnostics) => {
            if args.json {
                ExecutionResult::success_json(&diagnostics)
            } else {
                let lines = diagnostics["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|diagnostic| {
                        format!(
                            "{} {} {}",
                            diagnostic["finishedAt"].as_str().unwrap_or("unknown"),
                            diagnostic["ruleId"].as_str().unwrap_or("n/a"),
                            diagnostic["state"].as_str().unwrap_or("unknown"),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "diagnostics fetch failed".to_string())
        }
    }
}

async fn run_health_checks_list(args: HealthChecksListArgs) -> ExecutionResult {
    match fetch_health_checks(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
        args.rule_id.as_deref(),
    )
    .await
    {
        Ok(health_checks) => {
            if args.json {
                ExecutionResult::success_json(&health_checks)
            } else {
                let lines = health_checks["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|check| {
                        format!(
                            "{} {} {}",
                            check["checkedAt"].as_str().unwrap_or("unknown"),
                            check["status"].as_str().unwrap_or("unknown"),
                            check["summary"].as_str().unwrap_or("missing summary")
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "health check fetch failed".to_string())
        }
    }
}

async fn run_operations_list(args: OperationsListArgs) -> ExecutionResult {
    match fetch_operations(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
        args.parent_operation_id.as_deref(),
        args.rule_id.as_deref(),
        args.state.as_deref(),
        args.r#type.as_deref(),
    )
    .await
    {
        Ok(operations) => {
            if args.json {
                ExecutionResult::success_json(&operations)
            } else {
                let lines = operations["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|operation| {
                        format!(
                            "{} {} {} {} {} {} {} {}",
                            operation["finishedAt"]
                                .as_str()
                                .or_else(|| operation["startedAt"].as_str())
                                .unwrap_or("unknown"),
                            operation["id"].as_str().unwrap_or("unknown"),
                            operation["type"].as_str().unwrap_or("unknown"),
                            operation["state"].as_str().unwrap_or("unknown"),
                            operation["resultSummary"]
                                .as_str()
                                .unwrap_or("missing summary"),
                            operation["backupId"].as_str().unwrap_or("backup n/a"),
                            operation["parentOperationId"]
                                .as_str()
                                .unwrap_or("parent n/a"),
                            operation["rollbackPointId"]
                                .as_str()
                                .unwrap_or("rollback n/a"),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "operation fetch failed".to_string())
        }
    }
}

async fn run_operations_audit_index(args: OperationsAuditIndexArgs) -> ExecutionResult {
    match fetch_operations_audit_index(
        &Client::new(),
        &args.controller_base_url,
        args.limit,
        args.operation_id.as_deref(),
        args.host_id.as_deref(),
        args.parent_operation_id.as_deref(),
        args.rule_id.as_deref(),
        args.state.as_deref(),
        args.r#type.as_deref(),
    )
    .await
    {
        Ok(entries) => {
            if args.json {
                ExecutionResult::success_json(&entries)
            } else {
                let lines = entries["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(format_audit_index_entry_text)
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "audit index fetch failed".to_string())
        }
    }
}

async fn run_operations_persistence_readiness(
    args: OperationsPersistenceReadinessArgs,
) -> ExecutionResult {
    match fetch_persistence_readiness(&Client::new(), &args.controller_base_url).await {
        Ok(readiness) => {
            if args.json {
                ExecutionResult::success_json(&readiness)
            } else {
                ExecutionResult::success_text(format_persistence_readiness_text(&readiness))
            }
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "persistence readiness fetch failed".to_string(),
        ),
    }
}

async fn run_operations_persistence_decision_pack(
    args: OperationsPersistenceDecisionPackArgs,
) -> ExecutionResult {
    match fetch_persistence_decision_pack(&Client::new(), &args.controller_base_url).await {
        Ok(pack) => {
            if args.json {
                ExecutionResult::success_json(&pack)
            } else {
                ExecutionResult::success_text(format_persistence_decision_pack_text(&pack))
            }
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "persistence decision pack fetch failed".to_string(),
        ),
    }
}

async fn run_operations_consumer_boundary_decision_pack(
    args: OperationsConsumerBoundaryDecisionPackArgs,
) -> ExecutionResult {
    match fetch_consumer_boundary_decision_pack(&Client::new(), &args.controller_base_url).await {
        Ok(pack) => {
            if args.json {
                ExecutionResult::success_json(&pack)
            } else {
                ExecutionResult::success_text(format_consumer_boundary_decision_pack_text(&pack))
            }
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "consumer boundary decision pack fetch failed".to_string(),
        ),
    }
}

async fn run_operations_deployment_boundary_decision_pack(
    args: OperationsDeploymentBoundaryDecisionPackArgs,
) -> ExecutionResult {
    match fetch_deployment_boundary_decision_pack(&Client::new(), &args.controller_base_url).await
    {
        Ok(pack) => {
            if args.json {
                ExecutionResult::success_json(&pack)
            } else {
                ExecutionResult::success_text(format_deployment_boundary_decision_pack_text(&pack))
            }
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "deployment boundary decision pack fetch failed".to_string(),
        ),
    }
}

async fn run_operations_second_target_policy_pack(
    args: OperationsSecondTargetPolicyPackArgs,
) -> ExecutionResult {
    match fetch_second_target_policy_pack(&Client::new(), &args.controller_base_url).await {
        Ok(pack) => {
            if args.json {
                ExecutionResult::success_json(&pack)
            } else {
                ExecutionResult::success_text(format_second_target_policy_pack_text(&pack))
            }
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "second target policy pack fetch failed".to_string(),
        ),
    }
}

async fn run_operations_batch_apply_policy(
    args: OperationsBatchApplyPolicyArgs,
) -> ExecutionResult {
    let client = Client::new();
    let wait_options = WaitOptions {
        json: args.json,
        wait: args.wait,
        timeout_ms: args.timeout_ms,
        poll_interval_ms: args.poll_interval_ms,
        controller_base_url: args.controller_base_url.clone(),
    };

    match apply_batch_exposure_policy(
        &client,
        &args.controller_base_url,
        &args.host_ids,
        &args.allowed_sources,
        &args.excluded_ports,
        args.same_port_mirror,
        args.conflict_policy,
        args.backup_policy,
    )
    .await
    {
        Ok(accepted) => {
            complete_enqueued_operation(
                &client,
                &wait_options,
                accepted,
                "batch exposure policy apply",
            )
            .await
        }
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "batch exposure policy apply failed".to_string(),
        ),
    }
}

async fn run_rollback_points_apply(args: RollbackPointsApplyArgs) -> ExecutionResult {
    let client = Client::new();

    match apply_rollback_point(&client, &args.controller_base_url, &args.rollback_point_id).await {
        Ok(accepted) => {
            if !args.wait {
                return if args.json {
                    ExecutionResult::success_json(&accepted)
                } else {
                    ExecutionResult::success_text(format_accepted_operation_text(&accepted))
                };
            }

            let operation_id = accepted["operationId"]
                .as_str()
                .unwrap_or_default()
                .to_string();
            let deadline = Instant::now() + Duration::from_millis(args.timeout_ms);

            loop {
                match fetch_operation(&client, &args.controller_base_url, &operation_id).await {
                    Ok(operation) => {
                        let state = match operation_state(&operation) {
                            Ok(state) => state.to_string(),
                            Err(error) => {
                                return json_or_text_error_flag(
                                    args.json,
                                    JsonErrorOutput {
                                        error: "protocol",
                                        message: error.to_string(),
                                        operation_id: Some(operation_id.clone()),
                                        last_state: None,
                                        timeout_ms: None,
                                        status: None,
                                    },
                                    error.to_string(),
                                );
                            }
                        };

                        if is_terminal_state(&state) {
                            return if args.json {
                                ExecutionResult::success_json(&operation)
                            } else {
                                ExecutionResult::success_text(format_operation_detail_text(
                                    &operation,
                                    &operation_id,
                                ))
                            };
                        }

                        if Instant::now() >= deadline {
                            return json_or_text_error_flag(
                                args.json,
                                JsonErrorOutput {
                                    error: "timeout",
                                    message: format!(
                                        "rollback operation {} did not reach a terminal state before timeout",
                                        operation_id
                                    ),
                                    operation_id: Some(operation_id.clone()),
                                    last_state: Some(state.clone()),
                                    timeout_ms: Some(args.timeout_ms),
                                    status: None,
                                },
                                format!(
                                    "rollback operation {} timed out while waiting in state {}",
                                    operation_id, state
                                ),
                            );
                        }

                        tokio::time::sleep(Duration::from_millis(args.poll_interval_ms)).await;
                    }
                    Err(error) => {
                        return json_or_text_error_flag(
                            args.json,
                            error,
                            "rollback apply failed".to_string(),
                        );
                    }
                }
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "rollback apply failed".to_string())
        }
    }
}

async fn run_rollback_points_list(args: RollbackPointsListArgs) -> ExecutionResult {
    match fetch_rollback_points(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
        args.state.as_deref(),
    )
    .await
    {
        Ok(rollback_points) => {
            if args.json {
                ExecutionResult::success_json(&rollback_points)
            } else {
                let lines = rollback_points["items"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|rollback_point| {
                        format!(
                            "{} {} {}",
                            rollback_point["createdAt"].as_str().unwrap_or("unknown"),
                            rollback_point["id"].as_str().unwrap_or("unknown"),
                            rollback_point["state"].as_str().unwrap_or("unknown"),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                ExecutionResult::success_text(lines)
            }
        }
        Err(error) => {
            json_or_text_error_flag(args.json, error, "rollback point fetch failed".to_string())
        }
    }
}

async fn complete_enqueued_operation(
    client: &Client,
    wait_options: &WaitOptions,
    accepted: Value,
    action_label: &str,
) -> ExecutionResult {
    if !wait_options.wait {
        return if wait_options.json {
            ExecutionResult::success_json(&accepted)
        } else {
            ExecutionResult::success_text(format_accepted_operation_text(&accepted))
        };
    }

    let Some(operation_id) = accepted.get("operationId").and_then(Value::as_str) else {
        return json_or_text_error_flag(
            wait_options.json,
            JsonErrorOutput {
                error: "protocol",
                message: format!("{action_label} response missing operationId"),
                operation_id: None,
                last_state: None,
                timeout_ms: None,
                status: None,
            },
            format!("{action_label} response missing operationId"),
        );
    };

    let operation_id = operation_id.to_string();
    let deadline = Instant::now() + Duration::from_millis(wait_options.timeout_ms);

    loop {
        match fetch_operation(client, &wait_options.controller_base_url, &operation_id).await {
            Ok(operation) => {
                let state = match operation_state(&operation) {
                    Ok(state) => state.to_string(),
                    Err(error) => {
                        return json_or_text_error_flag(
                            wait_options.json,
                            JsonErrorOutput {
                                error: "protocol",
                                message: error.to_string(),
                                operation_id: Some(operation_id.clone()),
                                last_state: None,
                                timeout_ms: None,
                                status: None,
                            },
                            error.to_string(),
                        );
                    }
                };

                if is_terminal_state(&state) {
                    return if wait_options.json {
                        ExecutionResult::success_json(&operation)
                    } else {
                        ExecutionResult::success_text(format_operation_detail_text(
                            &operation,
                            &operation_id,
                        ))
                    };
                }

                if Instant::now() >= deadline {
                    return json_or_text_error_flag(
                        wait_options.json,
                        JsonErrorOutput {
                            error: "timeout",
                            message: format!(
                                "{action_label} operation {} did not reach a terminal state before timeout",
                                operation_id
                            ),
                            operation_id: Some(operation_id.clone()),
                            last_state: Some(state.clone()),
                            timeout_ms: Some(wait_options.timeout_ms),
                            status: None,
                        },
                        format!(
                            "{action_label} operation {} timed out while waiting in state {}",
                            operation_id, state
                        ),
                    );
                }

                tokio::time::sleep(Duration::from_millis(wait_options.poll_interval_ms)).await;
            }
            Err(error) => {
                let text_error = error.message.clone();
                return json_or_text_error_flag(wait_options.json, error, text_error);
            }
        }
    }
}

fn format_operation_detail_text(operation: &Value, default_id: &str) -> String {
    let batch_summary = operation
        .get("batchSummary")
        .map(|summary| {
            format!(
                " targets={}/{} degraded={} failed={}",
                summary["succeededTargets"].as_u64().unwrap_or_default(),
                summary["totalTargets"].as_u64().unwrap_or_default(),
                summary["degradedTargets"].as_u64().unwrap_or_default(),
                summary["failedTargets"].as_u64().unwrap_or_default()
            )
        })
        .unwrap_or_default();

    format!(
        "{} {} {} {} {} {} {}{}",
        operation["id"].as_str().unwrap_or(default_id),
        operation["type"].as_str().unwrap_or("unknown"),
        operation["state"].as_str().unwrap_or("unknown"),
        operation["resultSummary"]
            .as_str()
            .unwrap_or("missing-summary"),
        operation["backupId"].as_str().unwrap_or("backup-n/a"),
        operation["rollbackPointId"]
            .as_str()
            .unwrap_or("rollback-n/a"),
        operation["eventStreamUrl"]
            .as_str()
            .unwrap_or("/operations/events"),
        batch_summary
    )
}

fn format_accepted_operation_text(accepted: &Value) -> String {
    format!(
        "{} {}",
        accepted["operationId"].as_str().unwrap_or("unknown"),
        accepted["state"].as_str().unwrap_or("queued")
    )
}

fn format_host_summary_text(host: &Value) -> String {
    let heartbeat_state = host["agentHeartbeatState"].as_str().unwrap_or("unknown");
    let agent_version = host["agentVersion"].as_str().unwrap_or("unknown");
    let target_profile_id = host["targetProfileId"].as_str().unwrap_or("profile-n/a");
    let target_profile_status = host["targetProfileStatus"].as_str().unwrap_or("unknown");
    format!(
        "{} {} {} {} {} {} {} {} {}",
        host["id"].as_str().unwrap_or("unknown"),
        host["lifecycleState"].as_str().unwrap_or("unknown"),
        host["agentState"].as_str().unwrap_or("unknown"),
        heartbeat_state,
        agent_version,
        host["name"].as_str().unwrap_or("unknown"),
        host["tailscaleAddress"].as_str().unwrap_or("n/a"),
        target_profile_id,
        target_profile_status,
    )
}

fn format_host_detail_text(host: &Value, default_host_id: &str) -> String {
    let agent_version = host["agentVersion"].as_str().unwrap_or("unknown");
    let heartbeat_state = host["agentHeartbeatState"].as_str().unwrap_or("unknown");
    let heartbeat_at = host["agentHeartbeatAt"].as_str().unwrap_or("n/a");
    let labels = join_scalar_values(host["labels"].as_array());
    let target_profile = &host["targetProfile"];
    let target_profile_capabilities = join_scalar_values(target_profile["capabilities"].as_array());
    let recent_rules = host["recentRules"]
        .as_array()
        .map(|rules| {
            rules
                .iter()
                .map(|rule| {
                    format!(
                        "{}:{}",
                        rule["id"].as_str().unwrap_or("unknown"),
                        rule["name"].as_str().unwrap_or("unnamed")
                    )
                })
                .collect::<Vec<_>>()
                .join(",")
        })
        .unwrap_or_else(|| "none".to_string());
    let recent_operations = host["recentOperations"]
        .as_array()
        .map(|operations| {
            operations
                .iter()
                .map(|operation| operation["type"].as_str().unwrap_or("unknown").to_string())
                .collect::<Vec<_>>()
                .join(",")
        })
        .unwrap_or_else(|| "none".to_string());

    format!(
        "{} {} {} {}\nheartbeat {} version {} at {}\nlabels {}\ntarget-profile {} {} {} steady={} bootstrap={} capabilities {}\npolicy allowed={} excluded={} mirror={} conflict={} backup={}\nrules {}\noperations {}",
        host["id"].as_str().unwrap_or(default_host_id),
        host["name"].as_str().unwrap_or("unknown"),
        host["lifecycleState"].as_str().unwrap_or("unknown"),
        host["agentState"].as_str().unwrap_or("unknown"),
        heartbeat_state,
        agent_version,
        heartbeat_at,
        labels,
        host["targetProfileId"].as_str().unwrap_or("profile-n/a"),
        host["targetProfileLabel"].as_str().unwrap_or("Unsupported target profile"),
        host["targetProfileStatus"].as_str().unwrap_or("unknown"),
        target_profile["steadyStateTransport"].as_str().unwrap_or("unsupported"),
        target_profile["bootstrapTransport"].as_str().unwrap_or("unsupported"),
        target_profile_capabilities,
        join_scalar_values(host["effectivePolicy"]["allowedSources"].as_array()),
        join_scalar_values(host["effectivePolicy"]["excludedPorts"].as_array()),
        host["effectivePolicy"]["samePortMirror"]
            .as_bool()
            .map(|value| value.to_string())
            .unwrap_or_else(|| "false".to_string()),
        host["effectivePolicy"]["conflictPolicy"]
            .as_str()
            .unwrap_or("unknown"),
        host["effectivePolicy"]["backupPolicy"]
            .as_str()
            .unwrap_or("unknown"),
        recent_rules,
        recent_operations
    )
}

fn format_bridge_rule_summary_text(rule: &Value) -> String {
    format!(
        "{} {} {} {} {}:{} {}",
        rule["id"].as_str().unwrap_or("unknown"),
        rule["hostId"].as_str().unwrap_or("unknown"),
        rule["lifecycleState"].as_str().unwrap_or("unknown"),
        rule["listenPort"].as_u64().unwrap_or_default(),
        rule["targetHost"].as_str().unwrap_or("unknown"),
        rule["targetPort"].as_u64().unwrap_or_default(),
        rule["name"].as_str().unwrap_or("unnamed"),
    )
}

fn format_bridge_rule_detail_text(rule: &Value, default_rule_id: &str) -> String {
    format!(
        "{} {} {} {} {}:{} {} {} {}",
        rule["id"].as_str().unwrap_or(default_rule_id),
        rule["hostId"].as_str().unwrap_or("unknown"),
        rule["name"].as_str().unwrap_or("unnamed"),
        rule["protocol"].as_str().unwrap_or("unknown"),
        rule["listenPort"].as_u64().unwrap_or_default(),
        rule["targetHost"].as_str().unwrap_or("unknown"),
        rule["targetPort"].as_u64().unwrap_or_default(),
        rule["lifecycleState"].as_str().unwrap_or("unknown"),
        rule["lastRollbackPointId"]
            .as_str()
            .unwrap_or("rollback-n/a"),
    )
}

fn format_exposure_policy_text(policy: &Value, default_host_id: &str) -> String {
    format!(
        "{} allowed={} excluded={} mirror={} conflict={} backup={}",
        policy["hostId"].as_str().unwrap_or(default_host_id),
        join_scalar_values(policy["allowedSources"].as_array()),
        join_scalar_values(policy["excludedPorts"].as_array()),
        policy["samePortMirror"]
            .as_bool()
            .map(|value| value.to_string())
            .unwrap_or_else(|| "false".to_string()),
        policy["conflictPolicy"].as_str().unwrap_or("unknown"),
        policy["backupPolicy"].as_str().unwrap_or("unknown"),
    )
}

fn format_audit_index_entry_text(entry: &Value) -> String {
    let operation = &entry["operation"];

    format!(
        "{} {} {} events={} summary={} backup={} rollback={} artifacts={}",
        operation["id"].as_str().unwrap_or("unknown"),
        operation["type"].as_str().unwrap_or("unknown"),
        operation["state"].as_str().unwrap_or("unknown"),
        entry["eventCount"].as_u64().unwrap_or_default(),
        entry["latestEvent"]["summary"]
            .as_str()
            .unwrap_or("no-indexed-event"),
        entry["backup"]["id"].as_str().unwrap_or("backup-n/a"),
        entry["rollbackPoint"]["id"]
            .as_str()
            .unwrap_or("rollback-n/a"),
        join_scalar_values(entry["linkedArtifacts"].as_array()),
    )
}

fn format_persistence_readiness_text(readiness: &Value) -> String {
    let metrics = &readiness["metrics"];

    format!(
        "{} {} {} {}\noperations {} monitor {} migration {}\ndiagnostics {} monitor {} migration {}\nbackups {} monitor {} migration {}\nrollback_points {} monitor {} migration {}\nhosts {} monitor {} migration {}\naction {}",
        readiness["backend"].as_str().unwrap_or("unknown"),
        readiness["status"].as_str().unwrap_or("unknown"),
        readiness["migrationTarget"].as_str().unwrap_or("unknown"),
        readiness["databasePath"].as_str().unwrap_or("unknown"),
        metrics["operationRows"]["current"].as_u64().unwrap_or_default(),
        metrics["operationRows"]["monitor"].as_u64().unwrap_or_default(),
        metrics["operationRows"]["migrationReady"]
            .as_u64()
            .unwrap_or_default(),
        metrics["diagnosticRows"]["current"].as_u64().unwrap_or_default(),
        metrics["diagnosticRows"]["monitor"].as_u64().unwrap_or_default(),
        metrics["diagnosticRows"]["migrationReady"]
            .as_u64()
            .unwrap_or_default(),
        metrics["backupRows"]["current"].as_u64().unwrap_or_default(),
        metrics["backupRows"]["monitor"].as_u64().unwrap_or_default(),
        metrics["backupRows"]["migrationReady"].as_u64().unwrap_or_default(),
        metrics["rollbackPointRows"]["current"]
            .as_u64()
            .unwrap_or_default(),
        metrics["rollbackPointRows"]["monitor"].as_u64().unwrap_or_default(),
        metrics["rollbackPointRows"]["migrationReady"]
            .as_u64()
            .unwrap_or_default(),
        metrics["hostRows"]["current"].as_u64().unwrap_or_default(),
        metrics["hostRows"]["monitor"].as_u64().unwrap_or_default(),
        metrics["hostRows"]["migrationReady"].as_u64().unwrap_or_default(),
        readiness["recommendedAction"].as_str().unwrap_or("no action guidance"),
    )
}

fn format_persistence_decision_pack_text(pack: &Value) -> String {
    let trigger_lines = pack["triggerMetrics"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|trigger| {
            format!(
                "- {} ({}) current {} monitor {} migration {} status {} :: {}",
                trigger["key"].as_str().unwrap_or("unknown"),
                trigger["label"].as_str().unwrap_or("unknown"),
                trigger["current"].as_u64().unwrap_or_default(),
                trigger["monitor"].as_u64().unwrap_or_default(),
                trigger["migrationReady"].as_u64().unwrap_or_default(),
                trigger["status"].as_str().unwrap_or("unknown"),
                trigger["reason"].as_str().unwrap_or("no reason")
            )
        })
        .collect::<Vec<_>>();

    let action_lines = pack["nextActions"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|action| format!("- {}", action.as_str().unwrap_or("unknown")))
        .collect::<Vec<_>>();

    let trigger_block = if trigger_lines.is_empty() {
        "Trigger Metrics:\n- none".to_string()
    } else {
        format!("Trigger Metrics:\n{}", trigger_lines.join("\n"))
    };

    let action_block = if action_lines.is_empty() {
        "Next Actions:\n- none".to_string()
    } else {
        format!("Next Actions:\n{}", action_lines.join("\n"))
    };

    format!(
        "Backend: {}\nMigration Target: {}\nDecision State: {}\nReview Required: {}\nSummary: {}\nReadiness Status: {}\nDatabase: {}\n{}\n{}",
        pack["backend"].as_str().unwrap_or("unknown"),
        pack["migrationTarget"].as_str().unwrap_or("unknown"),
        pack["decisionState"].as_str().unwrap_or("unknown"),
        if pack["reviewRequired"].as_bool().unwrap_or(false) {
            "yes"
        } else {
            "no"
        },
        pack["summary"].as_str().unwrap_or("no summary"),
        pack["readiness"]["status"].as_str().unwrap_or("unknown"),
        pack["readiness"]["databasePath"].as_str().unwrap_or("unknown"),
        action_block,
        trigger_block
    )
}

fn format_decision_criteria_block(title: &str, criteria: &Value) -> String {
    let lines = criteria
        .as_array()
        .into_iter()
        .flatten()
        .map(|criterion| {
            format!(
                "- {} ({}) :: {}",
                criterion["id"].as_str().unwrap_or("unknown"),
                criterion["label"].as_str().unwrap_or("unknown"),
                criterion["reason"].as_str().unwrap_or("no reason")
            )
        })
        .collect::<Vec<_>>();

    if lines.is_empty() {
        format!("{}:\n- none", title)
    } else {
        format!("{}:\n{}", title, lines.join("\n"))
    }
}

fn format_target_profile_summaries(title: &str, profiles: &Value) -> String {
    let lines = profiles
        .as_array()
        .into_iter()
        .flatten()
        .map(|profile| {
            format!(
                "- {} ({}) :: {}",
                profile["id"].as_str().unwrap_or("unknown"),
                profile["status"].as_str().unwrap_or("unknown"),
                profile["label"].as_str().unwrap_or("unknown")
            )
        })
        .collect::<Vec<_>>();

    if lines.is_empty() {
        format!("{}:\n- none", title)
    } else {
        format!("{}:\n{}", title, lines.join("\n"))
    }
}

fn format_consumer_boundary_decision_pack_text(pack: &Value) -> String {
    let action_lines = pack["nextActions"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|action| format!("- {}", action.as_str().unwrap_or("unknown")))
        .collect::<Vec<_>>();

    let action_block = if action_lines.is_empty() {
        "Next Actions:\n- none".to_string()
    } else {
        format!("Next Actions:\n{}", action_lines.join("\n"))
    };

    format!(
        "Boundary Path: {}\nHosting Mode: {}\nReview Owner: {}\nDecision State: {}\nSplit Review Required: {}\nSummary: {}\n{}\n{}\n{}",
        pack["boundaryPath"].as_str().unwrap_or("unknown"),
        pack["hostingMode"].as_str().unwrap_or("unknown"),
        pack["reviewOwner"].as_str().unwrap_or("unknown"),
        pack["decisionState"].as_str().unwrap_or("unknown"),
        if pack["splitReviewRequired"].as_bool().unwrap_or(false) {
            "yes"
        } else {
            "no"
        },
        pack["summary"].as_str().unwrap_or("no summary"),
        action_block,
        format_decision_criteria_block("Satisfied Criteria", &pack["satisfiedCriteria"]),
        format_decision_criteria_block("Blocking Criteria", &pack["blockingCriteria"])
    )
}

fn format_second_target_policy_pack_text(pack: &Value) -> String {
    let action_lines = pack["nextActions"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|action| format!("- {}", action.as_str().unwrap_or("unknown")))
        .collect::<Vec<_>>();

    let action_block = if action_lines.is_empty() {
        "Next Actions:\n- none".to_string()
    } else {
        format!("Next Actions:\n{}", action_lines.join("\n"))
    };

    format!(
        "Locked Target Profile: {}\nReview Owner: {}\nDecision State: {}\nExpansion Review Required: {}\nSummary: {}\n{}\n{}\n{}\n{}\n{}",
        pack["lockedTargetProfileId"].as_str().unwrap_or("unknown"),
        pack["reviewOwner"].as_str().unwrap_or("unknown"),
        pack["decisionState"].as_str().unwrap_or("unknown"),
        if pack["expansionReviewRequired"].as_bool().unwrap_or(false) {
            "yes"
        } else {
            "no"
        },
        pack["summary"].as_str().unwrap_or("no summary"),
        action_block,
        format_target_profile_summaries("Supported Targets", &pack["supportedTargetProfiles"]),
        format_target_profile_summaries("Candidate Targets", &pack["candidateTargetProfiles"]),
        format_decision_criteria_block("Satisfied Criteria", &pack["satisfiedCriteria"]),
        format_decision_criteria_block("Blocking Criteria", &pack["blockingCriteria"])
    )
}

fn format_deployment_boundary_decision_pack_text(pack: &Value) -> String {
    let action_lines = pack["nextActions"]
        .as_array()
        .into_iter()
        .flatten()
        .map(|action| format!("- {}", action.as_str().unwrap_or("unknown")))
        .collect::<Vec<_>>();

    let action_block = if action_lines.is_empty() {
        "Next Actions:\n- none".to_string()
    } else {
        format!("Next Actions:\n{}", action_lines.join("\n"))
    };

    format!(
        "Boundary Target: {}\nDeployment Mode: {}\nReview Owner: {}\nDecision State: {}\nStandalone Review Required: {}\nSummary: {}\n{}\n{}\n{}",
        pack["boundaryTarget"].as_str().unwrap_or("unknown"),
        pack["deploymentMode"].as_str().unwrap_or("unknown"),
        pack["reviewOwner"].as_str().unwrap_or("unknown"),
        pack["decisionState"].as_str().unwrap_or("unknown"),
        if pack["standaloneReviewRequired"].as_bool().unwrap_or(false) {
            "yes"
        } else {
            "no"
        },
        pack["summary"].as_str().unwrap_or("no summary"),
        action_block,
        format_decision_criteria_block("Satisfied Criteria", &pack["satisfiedCriteria"]),
        format_decision_criteria_block("Blocking Criteria", &pack["blockingCriteria"])
    )
}

fn join_scalar_values(values: Option<&Vec<Value>>) -> String {
    let joined = values
        .into_iter()
        .flatten()
        .map(|value| {
            value
                .as_str()
                .map(str::to_string)
                .unwrap_or_else(|| value.to_string())
        })
        .collect::<Vec<_>>()
        .join(",");

    if joined.is_empty() {
        "none".to_string()
    } else {
        joined
    }
}

async fn fetch_operation(
    client: &Client,
    controller_base_url: &str,
    operation_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/operations/{}",
        controller_base_url.trim_end_matches('/'),
        operation_id
    );

    request_json(
        client.get(url),
        Some(format!("operation {} not found", operation_id)),
        Some(operation_id.to_string()),
    )
    .await
}

async fn fetch_events(
    client: &Client,
    controller_base_url: &str,
    limit: u16,
    operation_id: Option<&str>,
    host_id: Option<&str>,
    rule_id: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/events", controller_base_url.trim_end_matches('/'));
    let mut query = vec![("limit".to_string(), limit.to_string())];
    if let Some(operation_id) = operation_id {
        query.push(("operationId".to_string(), operation_id.to_string()));
    }
    if let Some(host_id) = host_id {
        query.push(("hostId".to_string(), host_id.to_string()));
    }
    if let Some(rule_id) = rule_id {
        query.push(("ruleId".to_string(), rule_id.to_string()));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_hosts(client: &Client, controller_base_url: &str) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/hosts", controller_base_url.trim_end_matches('/'));
    request_json(client.get(url), None, None).await
}

async fn fetch_host_detail(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/hosts/{}",
        controller_base_url.trim_end_matches('/'),
        host_id
    );
    request_json(
        client.get(url),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn create_host(
    client: &Client,
    controller_base_url: &str,
    name: &str,
    labels: &[String],
    target_profile_id: Option<&str>,
    ssh_host: &str,
    ssh_port: u16,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/hosts", controller_base_url.trim_end_matches('/'));
    let mut payload = Map::new();
    payload.insert("name".to_string(), Value::String(name.to_string()));
    payload.insert("labels".to_string(), json!(labels));
    payload.insert(
        "ssh".to_string(),
        json!({
            "host": ssh_host,
            "port": ssh_port
        }),
    );
    if let Some(target_profile_id) = target_profile_id {
        payload.insert(
            "targetProfileId".to_string(),
            Value::String(target_profile_id.to_string()),
        );
    }

    request_json(client.post(url).json(&Value::Object(payload)), None, None).await
}

async fn probe_host(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
    mode: Option<ProbeModeArg>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/hosts/{}/probe",
        controller_base_url.trim_end_matches('/'),
        host_id
    );
    let mut payload = Map::new();
    if let Some(mode) = mode {
        payload.insert(
            "mode".to_string(),
            Value::String(mode.as_controller_value().to_string()),
        );
    }

    request_json(
        client.post(url).json(&payload),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn bootstrap_host(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
    ssh_user: &str,
    desired_agent_port: u16,
    backup_policy: Option<BackupPolicyArg>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/hosts/{}/bootstrap",
        controller_base_url.trim_end_matches('/'),
        host_id
    );
    let mut payload = Map::new();
    payload.insert("sshUser".to_string(), Value::String(ssh_user.to_string()));
    payload.insert(
        "desiredAgentPort".to_string(),
        Value::Number(desired_agent_port.into()),
    );
    if let Some(backup_policy) = backup_policy {
        payload.insert(
            "backupPolicy".to_string(),
            Value::String(backup_policy.as_controller_value().to_string()),
        );
    }

    request_json(
        client.post(url).json(&payload),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn fetch_bridge_rules(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/bridge-rules", controller_base_url.trim_end_matches('/'));
    request_json(client.get(url), None, None).await
}

async fn fetch_bridge_rule_detail(
    client: &Client,
    controller_base_url: &str,
    rule_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/bridge-rules/{}",
        controller_base_url.trim_end_matches('/'),
        rule_id
    );
    request_json(
        client.get(url),
        Some(format!("bridge rule {} not found", rule_id)),
        None,
    )
    .await
}

async fn create_bridge_rule(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
    name: Option<&str>,
    protocol: RuleProtocolArg,
    listen_port: u16,
    target_host: &str,
    target_port: u16,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/bridge-rules", controller_base_url.trim_end_matches('/'));
    let mut payload = Map::new();
    payload.insert("hostId".to_string(), Value::String(host_id.to_string()));
    if let Some(name) = name {
        payload.insert("name".to_string(), Value::String(name.to_string()));
    }
    payload.insert(
        "protocol".to_string(),
        Value::String(protocol.as_controller_value().to_string()),
    );
    payload.insert("listenPort".to_string(), Value::Number(listen_port.into()));
    payload.insert(
        "targetHost".to_string(),
        Value::String(target_host.to_string()),
    );
    payload.insert("targetPort".to_string(), Value::Number(target_port.into()));

    request_json(
        client.post(url).json(&payload),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn update_bridge_rule(
    client: &Client,
    controller_base_url: &str,
    rule_id: &str,
    name: Option<&str>,
    listen_port: Option<u16>,
    target_host: Option<&str>,
    target_port: Option<u16>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/bridge-rules/{}",
        controller_base_url.trim_end_matches('/'),
        rule_id
    );
    let mut payload = Map::new();
    if let Some(name) = name {
        payload.insert("name".to_string(), Value::String(name.to_string()));
    }
    if let Some(listen_port) = listen_port {
        payload.insert("listenPort".to_string(), Value::Number(listen_port.into()));
    }
    if let Some(target_host) = target_host {
        payload.insert(
            "targetHost".to_string(),
            Value::String(target_host.to_string()),
        );
    }
    if let Some(target_port) = target_port {
        payload.insert("targetPort".to_string(), Value::Number(target_port.into()));
    }

    request_json(
        client.patch(url).json(&payload),
        Some(format!("bridge rule {} not found", rule_id)),
        None,
    )
    .await
}

async fn delete_bridge_rule(
    client: &Client,
    controller_base_url: &str,
    rule_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/bridge-rules/{}",
        controller_base_url.trim_end_matches('/'),
        rule_id
    );
    request_json(
        client.request(Method::DELETE, url),
        Some(format!("bridge rule {} not found", rule_id)),
        None,
    )
    .await
}

async fn fetch_exposure_policy(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/exposure-policies/{}",
        controller_base_url.trim_end_matches('/'),
        host_id
    );
    request_json(
        client.get(url),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn set_exposure_policy(
    client: &Client,
    controller_base_url: &str,
    host_id: &str,
    allowed_sources: &[String],
    excluded_ports: &[u16],
    same_port_mirror: bool,
    conflict_policy: ConflictPolicyArg,
    backup_policy: BackupPolicyArg,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/exposure-policies/{}",
        controller_base_url.trim_end_matches('/'),
        host_id
    );
    request_json(
        client.put(url).json(&json!({
            "hostId": host_id,
            "allowedSources": allowed_sources,
            "excludedPorts": excluded_ports,
            "samePortMirror": same_port_mirror,
            "conflictPolicy": conflict_policy.as_controller_value(),
            "backupPolicy": backup_policy.as_controller_value()
        })),
        Some(format!("host {} not found", host_id)),
        None,
    )
    .await
}

async fn apply_batch_exposure_policy(
    client: &Client,
    controller_base_url: &str,
    host_ids: &[String],
    allowed_sources: &[String],
    excluded_ports: &[u16],
    same_port_mirror: bool,
    conflict_policy: ConflictPolicyArg,
    backup_policy: BackupPolicyArg,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/batch-operations/exposure-policies/apply",
        controller_base_url.trim_end_matches('/')
    );
    request_json(
        client.post(url).json(&json!({
            "hostIds": host_ids,
            "allowedSources": allowed_sources,
            "excludedPorts": excluded_ports,
            "samePortMirror": same_port_mirror,
            "conflictPolicy": conflict_policy.as_controller_value(),
            "backupPolicy": backup_policy.as_controller_value()
        })),
        None,
        None,
    )
    .await
}

async fn fetch_health_checks(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    rule_id: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/health-checks",
        controller_base_url.trim_end_matches('/')
    );
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
    }
    if let Some(rule_id) = rule_id {
        query.push(("ruleId", rule_id));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_backups(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    operation_id: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/backups", controller_base_url.trim_end_matches('/'));
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
    }
    if let Some(operation_id) = operation_id {
        query.push(("operationId", operation_id));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_diagnostics(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    rule_id: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/diagnostics", controller_base_url.trim_end_matches('/'));
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
    }
    if let Some(rule_id) = rule_id {
        query.push(("ruleId", rule_id));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_operations(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    parent_operation_id: Option<&str>,
    rule_id: Option<&str>,
    state: Option<&str>,
    operation_type: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/operations", controller_base_url.trim_end_matches('/'));
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
    }
    if let Some(parent_operation_id) = parent_operation_id {
        query.push(("parentOperationId", parent_operation_id));
    }
    if let Some(rule_id) = rule_id {
        query.push(("ruleId", rule_id));
    }
    if let Some(state) = state {
        query.push(("state", state));
    }
    if let Some(operation_type) = operation_type {
        query.push(("type", operation_type));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_operations_audit_index(
    client: &Client,
    controller_base_url: &str,
    limit: u16,
    operation_id: Option<&str>,
    host_id: Option<&str>,
    parent_operation_id: Option<&str>,
    rule_id: Option<&str>,
    state: Option<&str>,
    operation_type: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/event-audit-index",
        controller_base_url.trim_end_matches('/')
    );
    let mut query = vec![("limit".to_string(), limit.to_string())];

    if let Some(operation_id) = operation_id {
        query.push(("operationId".to_string(), operation_id.to_string()));
    }
    if let Some(host_id) = host_id {
        query.push(("hostId".to_string(), host_id.to_string()));
    }
    if let Some(parent_operation_id) = parent_operation_id {
        query.push((
            "parentOperationId".to_string(),
            parent_operation_id.to_string(),
        ));
    }
    if let Some(rule_id) = rule_id {
        query.push(("ruleId".to_string(), rule_id.to_string()));
    }
    if let Some(state) = state {
        query.push(("state".to_string(), state.to_string()));
    }
    if let Some(operation_type) = operation_type {
        query.push(("type".to_string(), operation_type.to_string()));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn fetch_persistence_readiness(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/persistence-readiness",
        controller_base_url.trim_end_matches('/')
    );
    request_json(client.get(url), None, None).await
}

async fn fetch_persistence_decision_pack(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/persistence-decision-pack",
        controller_base_url.trim_end_matches('/')
    );
    request_json(client.get(url), None, None).await
}

async fn fetch_consumer_boundary_decision_pack(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/consumer-boundary-decision-pack",
        controller_base_url.trim_end_matches('/')
    );
    request_json(client.get(url), None, None).await
}

async fn fetch_deployment_boundary_decision_pack(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/deployment-boundary-decision-pack",
        controller_base_url.trim_end_matches('/')
    );
    request_json(client.get(url), None, None).await
}

async fn fetch_second_target_policy_pack(
    client: &Client,
    controller_base_url: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/second-target-policy-pack",
        controller_base_url.trim_end_matches('/')
    );
    request_json(client.get(url), None, None).await
}

async fn fetch_rollback_points(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    state: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/rollback-points",
        controller_base_url.trim_end_matches('/')
    );
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
    }
    if let Some(state) = state {
        query.push(("state", state));
    }

    let response = client
        .get(url)
        .query(&query)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn apply_rollback_point(
    client: &Client,
    controller_base_url: &str,
    rollback_point_id: &str,
) -> Result<Value, JsonErrorOutput> {
    let url = format!(
        "{}/rollback-points/{}/apply",
        controller_base_url.trim_end_matches('/'),
        rollback_point_id
    );

    let response = client
        .post(url)
        .send()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: None,
        })?;

    let status = response.status();
    if status == StatusCode::NOT_FOUND {
        return Err(JsonErrorOutput {
            error: "not_found",
            message: format!("rollback point {} not found", rollback_point_id),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    if !status.is_success() {
        return Err(unexpected_status_error(status, None));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

async fn request_json(
    request: RequestBuilder,
    not_found_message: Option<String>,
    operation_id: Option<String>,
) -> Result<Value, JsonErrorOutput> {
    let response = request.send().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: operation_id.clone(),
        last_state: None,
        timeout_ms: None,
        status: None,
    })?;

    let status = response.status();
    if status == StatusCode::NOT_FOUND {
        return Err(JsonErrorOutput {
            error: "not_found",
            message: not_found_message
                .unwrap_or_else(|| "requested resource not found".to_string()),
            operation_id,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    if !status.is_success() {
        return Err(unexpected_status_error(status, operation_id.as_deref()));
    }

    response
        .json::<Value>()
        .await
        .map_err(|error| JsonErrorOutput {
            error: "transport",
            message: error.to_string(),
            operation_id,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        })
}

fn operation_state(operation: &Value) -> Result<&str, CliError> {
    operation
        .get("state")
        .and_then(Value::as_str)
        .ok_or(CliError::InvalidOperationPayload)
}

fn is_terminal_state(state: &str) -> bool {
    matches!(state, "succeeded" | "failed" | "degraded" | "cancelled")
}

fn json_or_text_error(
    args: &OperationGetArgs,
    json_error: JsonErrorOutput,
    text_error: String,
) -> ExecutionResult {
    json_or_text_error_flag(args.json, json_error, text_error)
}

fn json_or_text_error_flag(
    json: bool,
    json_error: JsonErrorOutput,
    text_error: String,
) -> ExecutionResult {
    if json {
        ExecutionResult::error_json(json_error)
    } else {
        ExecutionResult {
            body: text_error,
            exit_code: ExitCode::from(1),
        }
    }
}

fn is_transport_status(status: StatusCode) -> bool {
    matches!(
        status,
        StatusCode::BAD_GATEWAY | StatusCode::SERVICE_UNAVAILABLE | StatusCode::GATEWAY_TIMEOUT
    )
}

fn unexpected_status_error(status: StatusCode, operation_id: Option<&str>) -> JsonErrorOutput {
    let is_transport = is_transport_status(status);

    JsonErrorOutput {
        error: if is_transport {
            "transport"
        } else {
            "controller_error"
        },
        message: if is_transport {
            format!(
                "controller transport failed with upstream status {}",
                status.as_u16()
            )
        } else {
            format!("controller returned unexpected status {}", status.as_u16())
        },
        operation_id: operation_id.map(str::to_string),
        last_state: None,
        timeout_ms: None,
        status: Some(status.as_u16()),
    }
}
