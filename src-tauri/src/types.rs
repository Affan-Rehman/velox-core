// VELOX CORE - Type Definitions
// Strict type contracts between Rust and TypeScript

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Unique identifier for scan sessions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ScanId(pub Uuid);

impl ScanId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl Default for ScanId {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Display for ScanId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// File entry metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub size_formatted: String,
    pub is_directory: bool,
    pub is_file: bool,
    pub is_symlink: bool,
    pub extension: Option<String>,
    pub modified: Option<String>,
    pub created: Option<String>,
    pub depth: usize,
    pub children_count: Option<u64>,
}

/// Directory scan result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub scan_id: String,
    pub root_path: String,
    pub total_files: u64,
    pub total_directories: u64,
    pub total_size: u64,
    pub total_size_formatted: String,
    pub entries: Vec<FileEntry>,
    pub duration_ms: u64,
    pub completed_at: String,
    pub status: ScanStatus,
}

/// Scan progress event payload
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgress {
    pub scan_id: String,
    pub current_path: String,
    pub files_scanned: u64,
    pub directories_scanned: u64,
    pub bytes_scanned: u64,
    pub bytes_scanned_formatted: String,
    pub progress_percent: f64,
    pub estimated_total: Option<u64>,
    pub elapsed_ms: u64,
    pub status: ScanStatus,
}

/// Scan status enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ScanStatus {
    Idle,
    Scanning,
    Completed,
    Cancelled,
    Error,
}

/// System information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
    pub hostname: String,
    pub cpu_cores: usize,
    pub timestamp: String,
}

/// Heartbeat response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatResponse {
    pub status: String,
    pub uptime_ms: u64,
    pub active_scans: usize,
    pub timestamp: String,
    pub version: String,
}

/// Scan request from frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanRequest {
    pub path: String,
    pub max_depth: Option<usize>,
    pub include_hidden: bool,
    pub follow_symlinks: bool,
}

/// Active scan session
#[derive(Debug, Clone)]
pub struct ScanSession {
    pub id: ScanId,
    pub root_path: String,
    pub started_at: DateTime<Utc>,
    pub status: ScanStatus,
    pub cancelled: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

impl ScanSession {
    pub fn new(root_path: String) -> Self {
        Self {
            id: ScanId::new(),
            root_path,
            started_at: Utc::now(),
            status: ScanStatus::Idle,
            cancelled: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
        }
    }

    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(std::sync::atomic::Ordering::Relaxed)
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, std::sync::atomic::Ordering::Relaxed);
    }
}

