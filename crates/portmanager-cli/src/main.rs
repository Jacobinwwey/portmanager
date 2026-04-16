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
    Operation(OperationCommand),
}

#[derive(Args)]
struct OperationCommand {
    #[command(subcommand)]
    command: OperationSubcommand,
}

#[derive(Subcommand)]
enum OperationSubcommand {
    Get(OperationGetArgs),
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
        Commands::Operation(command) => match command.command {
            OperationSubcommand::Get(args) => run_operation_get(args).await,
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
                            "{} {} {}",
                            operation["id"].as_str().unwrap_or(&args.operation_id),
                            operation["type"].as_str().unwrap_or("unknown"),
                            state
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
    if args.json {
        ExecutionResult::error_json(json_error)
    } else {
        ExecutionResult {
            body: text_error,
            exit_code: ExitCode::from(1),
        }
    }
}
