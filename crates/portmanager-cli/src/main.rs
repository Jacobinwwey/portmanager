use std::{
    process::ExitCode,
    time::{Duration, Instant},
};

use clap::{Args, Parser, Subcommand};
use reqwest::{Client, StatusCode};
use serde::Serialize;
use serde_json::Value;
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
    Diagnostics(DiagnosticsCommand),
    Events(EventsCommand),
    HealthChecks(HealthChecksCommand),
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
struct HealthChecksCommand {
    #[command(subcommand)]
    command: HealthChecksSubcommand,
}

#[derive(Subcommand)]
enum HealthChecksSubcommand {
    List(HealthChecksListArgs),
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
    List(OperationsListArgs),
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
    rule_id: Option<String>,
    #[arg(long)]
    state: Option<String>,
    #[arg(long)]
    r#type: Option<String>,
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

#[tokio::main]
async fn main() -> ExitCode {
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
        Commands::Diagnostics(command) => match command.command {
            DiagnosticsSubcommand::List(args) => run_diagnostics_list(args).await,
        },
        Commands::Events(command) => match command.command {
            EventsSubcommand::List(args) => run_events_list(args).await,
        },
        Commands::HealthChecks(command) => match command.command {
            HealthChecksSubcommand::List(args) => run_health_checks_list(args).await,
        },
        Commands::Operation(command) => match command.command {
            OperationSubcommand::Get(args) => run_operation_get(args).await,
        },
        Commands::Operations(command) => match command.command {
            OperationsSubcommand::List(args) => run_operations_list(args).await,
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
                        ExecutionResult::success_text(format!(
                            "{} {} {} {} {} {} {}",
                            operation["id"].as_str().unwrap_or(&args.operation_id),
                            operation["type"].as_str().unwrap_or("unknown"),
                            state,
                            operation["resultSummary"]
                                .as_str()
                                .unwrap_or("missing-summary"),
                            operation["backupId"].as_str().unwrap_or("backup-n/a"),
                            operation["rollbackPointId"]
                                .as_str()
                                .unwrap_or("rollback-n/a"),
                            operation["eventStreamUrl"]
                                .as_str()
                                .unwrap_or("/operations/events")
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
                            "{} {} {} {} {}",
                            backup["createdAt"].as_str().unwrap_or("unknown"),
                            backup["hostId"].as_str().unwrap_or("unknown"),
                            backup["backupMode"].as_str().unwrap_or("unknown"),
                            backup["localStatus"].as_str().unwrap_or("unknown"),
                            backup["githubStatus"].as_str().unwrap_or("unknown"),
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
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "health check fetch failed".to_string(),
        ),
    }
}

async fn run_operations_list(args: OperationsListArgs) -> ExecutionResult {
    match fetch_operations(
        &Client::new(),
        &args.controller_base_url,
        args.host_id.as_deref(),
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
                            "{} {} {} {} {} {} {}",
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

async fn run_rollback_points_apply(args: RollbackPointsApplyArgs) -> ExecutionResult {
    let client = Client::new();

    match apply_rollback_point(&client, &args.controller_base_url, &args.rollback_point_id).await {
        Ok(accepted) => {
            if !args.wait {
                return if args.json {
                    ExecutionResult::success_json(&accepted)
                } else {
                    ExecutionResult::success_text(format!(
                        "{} {}",
                        accepted["operationId"].as_str().unwrap_or("unknown"),
                        accepted["state"].as_str().unwrap_or("queued")
                    ))
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
                                ExecutionResult::success_text(format!(
                                    "{} {} {}",
                                    operation["id"].as_str().unwrap_or("unknown"),
                                    operation["type"].as_str().unwrap_or("rollback"),
                                    state
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
        Err(error) => json_or_text_error_flag(args.json, error, "rollback apply failed".to_string()),
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
        Err(error) => json_or_text_error_flag(
            args.json,
            error,
            "rollback point fetch failed".to_string(),
        ),
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

    let response = client.get(url).send().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: Some(operation_id.to_string()),
        last_state: None,
        timeout_ms: None,
        status: None,
    })?;

    let status = response.status();
    if status == StatusCode::NOT_FOUND {
        return Err(JsonErrorOutput {
            error: "not_found",
            message: format!("operation {} not found", operation_id),
            operation_id: Some(operation_id.to_string()),
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    if !status.is_success() {
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: Some(operation_id.to_string()),
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: Some(operation_id.to_string()),
        last_state: None,
        timeout_ms: None,
        status: Some(status.as_u16()),
    })
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: None,
        last_state: None,
        timeout_ms: None,
        status: Some(status.as_u16()),
    })
}

async fn fetch_health_checks(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    rule_id: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/health-checks", controller_base_url.trim_end_matches('/'));
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
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
    rule_id: Option<&str>,
    state: Option<&str>,
    operation_type: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/operations", controller_base_url.trim_end_matches('/'));
    let mut query: Vec<(&str, &str)> = Vec::new();
    if let Some(host_id) = host_id {
        query.push(("hostId", host_id));
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: None,
        last_state: None,
        timeout_ms: None,
        status: Some(status.as_u16()),
    })
}

async fn fetch_rollback_points(
    client: &Client,
    controller_base_url: &str,
    host_id: Option<&str>,
    state: Option<&str>,
) -> Result<Value, JsonErrorOutput> {
    let url = format!("{}/rollback-points", controller_base_url.trim_end_matches('/'));
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
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

    let response = client.post(url).send().await.map_err(|error| JsonErrorOutput {
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
        return Err(JsonErrorOutput {
            error: "controller_error",
            message: format!("controller returned unexpected status {}", status.as_u16()),
            operation_id: None,
            last_state: None,
            timeout_ms: None,
            status: Some(status.as_u16()),
        });
    }

    response.json::<Value>().await.map_err(|error| JsonErrorOutput {
        error: "transport",
        message: error.to_string(),
        operation_id: None,
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
