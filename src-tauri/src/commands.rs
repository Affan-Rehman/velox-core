// VELOX CORE - Tauri Command Registry
// Every frontend action has a corresponding async command

use std::sync::Arc;

use chrono::Utc;
use human_bytes::human_bytes;
use tauri::{api::dialog::FileDialogBuilder, State, Window};

use crate::error::VeloxError;
use crate::scanner::{DirectoryScanner, ScanConfig};
use crate::state::VeloxState;
use crate::types::{
    HeartbeatResponse, ScanRequest, ScanResult, ScanSession, ScanStatus, SystemInfo,
};

/// Scan a directory recursively with progress streaming
#[tauri::command]
pub async fn scan_directory(
    window: Window,
    state: State<'_, VeloxState>,
    request: ScanRequest,
) -> Result<ScanResult, VeloxError> {
    tracing::info!("📂 Scan requested for: {}", request.path);

    // Create a new scan session
    let session = ScanSession::new(request.path.clone());
    let scan_id = state.register_scan(session.clone());

    tracing::debug!("Created scan session: {}", scan_id);

    // Get the session from state
    let session_arc = state
        .get_scan(&scan_id)
        .ok_or_else(|| VeloxError::NoActiveScan(scan_id.clone()))?;

    // Build scan configuration
    let config = ScanConfig {
        max_depth: request.max_depth.unwrap_or(100),
        include_hidden: request.include_hidden,
        follow_symlinks: request.follow_symlinks,
        progress_interval_ms: 50,
    };

    // Execute the scan
    let scanner = DirectoryScanner::new(session_arc, window, config);
    let result = scanner.scan().await;

    // Clean up the session
    state.remove_scan(&scan_id);

    result
}

/// Cancel an active scan
#[tauri::command]
pub async fn cancel_scan(
    state: State<'_, VeloxState>,
    scan_id: String,
) -> Result<bool, VeloxError> {
    tracing::info!("🛑 Cancel requested for scan: {}", scan_id);

    if state.cancel_scan(&scan_id) {
        Ok(true)
    } else {
        Err(VeloxError::NoActiveScan(scan_id))
    }
}

/// Get the status of an active scan
#[tauri::command]
pub async fn get_scan_status(
    state: State<'_, VeloxState>,
    scan_id: String,
) -> Result<ScanStatus, VeloxError> {
    if let Some(session) = state.get_scan(&scan_id) {
        Ok(session.status.clone())
    } else {
        Err(VeloxError::NoActiveScan(scan_id))
    }
}

/// Get system information
#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, VeloxError> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        hostname: hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string()),
        cpu_cores: num_cpus::get(),
        timestamp: Utc::now().to_rfc3339(),
    })
}

/// Heartbeat for frontend-backend sync verification
#[tauri::command]
pub async fn heartbeat(state: State<'_, VeloxState>) -> Result<HeartbeatResponse, VeloxError> {
    Ok(HeartbeatResponse {
        status: "healthy".to_string(),
        uptime_ms: state.uptime_ms(),
        active_scans: state.active_scan_count(),
        timestamp: Utc::now().to_rfc3339(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

/// Open native folder dialog and return selected path
#[tauri::command]
pub async fn open_folder_dialog(window: Window) -> Result<Option<String>, VeloxError> {
    let (tx, rx) = std::sync::mpsc::channel();

    FileDialogBuilder::new()
        .set_title("Select Folder to Scan")
        .pick_folder(move |path| {
            tx.send(path.map(|p| p.to_string_lossy().to_string())).ok();
        });

    rx.recv()
        .map_err(|e| VeloxError::Unknown(format!("Dialog error: {}", e)))
}

