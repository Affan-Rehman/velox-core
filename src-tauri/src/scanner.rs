// VELOX CORE - High-Performance Directory Scanner
// Async recursive scanning with real-time progress streaming

use std::path::Path;
use std::sync::Arc;
use std::time::Instant;

use chrono::Utc;
use human_bytes::human_bytes;
use tauri::Window;
use tokio::sync::mpsc;
use walkdir::WalkDir;

use crate::error::{VeloxError, VeloxResult};
use crate::types::{FileEntry, ScanProgress, ScanResult, ScanSession, ScanStatus};

/// Scanner configuration
#[derive(Debug, Clone)]
pub struct ScanConfig {
    pub max_depth: usize,
    pub include_hidden: bool,
    pub follow_symlinks: bool,
    pub progress_interval_ms: u64,
}

impl Default for ScanConfig {
    fn default() -> Self {
        Self {
            max_depth: 100,
            include_hidden: false,
            follow_symlinks: false,
            progress_interval_ms: 50,
        }
    }
}

/// High-performance directory scanner
pub struct DirectoryScanner {
    config: ScanConfig,
    session: Arc<ScanSession>,
    window: Window,
}

impl DirectoryScanner {
    pub fn new(session: Arc<ScanSession>, window: Window, config: ScanConfig) -> Self {
        Self {
            config,
            session,
            window,
        }
    }

    /// Execute the scan with real-time progress streaming
    pub async fn scan(&self) -> VeloxResult<ScanResult> {
        let start_time = Instant::now();
        let root_path = &self.session.root_path;
        let scan_id = self.session.id.to_string();

        tracing::info!("🔍 Starting scan: {} for path: {}", scan_id, root_path);

        // Validate path
        let path = Path::new(root_path);
        if !path.exists() {
            return Err(VeloxError::InvalidPath(root_path.clone()));
        }

        if !path.is_dir() {
            return Err(VeloxError::InvalidPath(format!(
                "{} is not a directory",
                root_path
            )));
        }

        // Channel for progress updates
        let (tx, mut rx) = mpsc::channel::<ScanProgress>(100);
        let window_clone = self.window.clone();
        let scan_id_clone = scan_id.clone();

        // Spawn progress emitter task
        let progress_handle = tokio::spawn(async move {
            let mut last_emit = Instant::now();
            while let Some(progress) = rx.recv().await {
                // Throttle emissions to prevent UI flooding
                if last_emit.elapsed().as_millis() >= 50 || progress.status != ScanStatus::Scanning {
                    window_clone
                        .emit("velox:scan:progress", &progress)
                        .ok();
                    last_emit = Instant::now();
                }
            }
            tracing::debug!("Progress emitter completed for scan: {}", scan_id_clone);
        });

        // Perform the actual scan
        let result = self.execute_scan(&scan_id, root_path, tx, start_time).await;

        // Wait for progress emitter to finish
        progress_handle.await.ok();

        // Emit final result
        match &result {
            Ok(scan_result) => {
                self.window
                    .emit("velox:scan:complete", scan_result)
                    .ok();
                tracing::info!(
                    "✅ Scan complete: {} files, {} dirs, {} in {}ms",
                    scan_result.total_files,
                    scan_result.total_directories,
                    scan_result.total_size_formatted,
                    scan_result.duration_ms
                );
            }
            Err(e) => {
                self.window
                    .emit("velox:scan:error", serde_json::json!({
                        "scanId": scan_id,
                        "error": e.to_string()
                    }))
                    .ok();
                tracing::error!("❌ Scan failed: {}", e);
            }
        }

        result
    }

    async fn execute_scan(
        &self,
        scan_id: &str,
        root_path: &str,
        tx: mpsc::Sender<ScanProgress>,
        start_time: Instant,
    ) -> VeloxResult<ScanResult> {
        let mut entries: Vec<FileEntry> = Vec::new();
        let mut total_files: u64 = 0;
        let mut total_directories: u64 = 0;
        let mut total_size: u64 = 0;

        let walker = WalkDir::new(root_path)
            .max_depth(self.config.max_depth)
            .follow_links(self.config.follow_symlinks)
            .into_iter()
            .filter_entry(|e| {
                if !self.config.include_hidden {
                    !e.file_name()
                        .to_str()
                        .map(|s| s.starts_with('.'))
                        .unwrap_or(false)
                } else {
                    true
                }
            });

        let mut last_progress = Instant::now();

        for entry_result in walker {
            // Check for cancellation
            if self.session.is_cancelled() {
                tracing::info!("🛑 Scan cancelled: {}", scan_id);
                
                // Send cancellation progress
                tx.send(ScanProgress {
                    scan_id: scan_id.to_string(),
                    current_path: String::new(),
                    files_scanned: total_files,
                    directories_scanned: total_directories,
                    bytes_scanned: total_size,
                    bytes_scanned_formatted: human_bytes(total_size as f64),
                    progress_percent: 0.0,
                    estimated_total: None,
                    elapsed_ms: start_time.elapsed().as_millis() as u64,
                    status: ScanStatus::Cancelled,
                }).await.ok();

                return Err(VeloxError::ScanCancelled);
            }

            match entry_result {
                Ok(entry) => {
                    let path = entry.path();
                    let metadata = entry.metadata().ok();

                    let is_dir = entry.file_type().is_dir();
                    let is_file = entry.file_type().is_file();
                    let is_symlink = entry.file_type().is_symlink();

                    let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);

                    if is_dir {
                        total_directories += 1;
                    } else if is_file {
                        total_files += 1;
                        total_size += size;
                    }

                    // Create file entry
                    let file_entry = FileEntry {
                        id: uuid::Uuid::new_v4().to_string(),
                        name: entry.file_name().to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        size,
                        size_formatted: human_bytes(size as f64),
                        is_directory: is_dir,
                        is_file,
                        is_symlink,
                        extension: path
                            .extension()
                            .map(|e| e.to_string_lossy().to_string()),
                        modified: metadata.as_ref().and_then(|m| {
                            m.modified().ok().map(|t| {
                                chrono::DateTime::<Utc>::from(t).to_rfc3339()
                            })
                        }),
                        created: metadata.as_ref().and_then(|m| {
                            m.created().ok().map(|t| {
                                chrono::DateTime::<Utc>::from(t).to_rfc3339()
                            })
                        }),
                        depth: entry.depth(),
                        children_count: None,
                    };

                    entries.push(file_entry);

                    // Send progress update (throttled)
                    if last_progress.elapsed().as_millis() >= self.config.progress_interval_ms as u128 {
                        tx.send(ScanProgress {
                            scan_id: scan_id.to_string(),
                            current_path: path.to_string_lossy().to_string(),
                            files_scanned: total_files,
                            directories_scanned: total_directories,
                            bytes_scanned: total_size,
                            bytes_scanned_formatted: human_bytes(total_size as f64),
                            progress_percent: 0.0, // Unknown total, so percentage not applicable
                            estimated_total: None,
                            elapsed_ms: start_time.elapsed().as_millis() as u64,
                            status: ScanStatus::Scanning,
                        }).await.ok();
                        
                        last_progress = Instant::now();
                    }
                }
                Err(e) => {
                    tracing::warn!("⚠️ Error accessing entry: {}", e);
                    // Continue scanning despite individual entry errors
                }
            }
        }

        let duration_ms = start_time.elapsed().as_millis() as u64;

        // Send final progress
        tx.send(ScanProgress {
            scan_id: scan_id.to_string(),
            current_path: String::new(),
            files_scanned: total_files,
            directories_scanned: total_directories,
            bytes_scanned: total_size,
            bytes_scanned_formatted: human_bytes(total_size as f64),
            progress_percent: 100.0,
            estimated_total: Some(total_files + total_directories),
            elapsed_ms: duration_ms,
            status: ScanStatus::Completed,
        }).await.ok();

        Ok(ScanResult {
            scan_id: scan_id.to_string(),
            root_path: root_path.to_string(),
            total_files,
            total_directories,
            total_size,
            total_size_formatted: human_bytes(total_size as f64),
            entries,
            duration_ms,
            completed_at: Utc::now().to_rfc3339(),
            status: ScanStatus::Completed,
        })
    }
}

