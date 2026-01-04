// VELOX CORE - Main Entry Point
// Performance-First Hybrid Desktop Engine

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod error;
mod scanner;
mod state;
mod types;

use state::VeloxState;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    // Initialize tracing for structured logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "velox_core=debug,info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🚀 VELOX CORE Engine Starting...");

    tauri::Builder::default()
        .manage(VeloxState::new())
        .invoke_handler(tauri::generate_handler![
            commands::scan_directory,
            commands::cancel_scan,
            commands::get_scan_status,
            commands::get_system_info,
            commands::heartbeat,
            commands::open_folder_dialog,
        ])
        .setup(|app| {
            tracing::info!("✅ VELOX CORE Initialized Successfully");
            
            // Emit ready event to frontend
            let window = app.get_window("main").unwrap();
            window.emit("velox:ready", serde_json::json!({
                "version": env!("CARGO_PKG_VERSION"),
                "timestamp": chrono::Utc::now().to_rfc3339(),
            })).ok();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Failed to run VELOX CORE");
}

