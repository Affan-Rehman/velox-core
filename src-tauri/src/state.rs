// VELOX CORE - Global State Management
// Thread-safe state using parking_lot for maximum performance

use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

use crate::types::{ScanSession, ScanStatus};

/// Global managed state for VELOX CORE
pub struct VeloxState {
    /// Application start time for uptime tracking
    pub started_at: DateTime<Utc>,
    
    /// Active scan sessions
    pub active_scans: RwLock<HashMap<String, Arc<ScanSession>>>,
    
    /// Configuration
    pub config: RwLock<VeloxConfig>,
}

/// Application configuration
#[derive(Debug, Clone)]
pub struct VeloxConfig {
    pub max_concurrent_scans: usize,
    pub default_max_depth: usize,
    pub include_hidden_default: bool,
    pub follow_symlinks_default: bool,
    pub progress_emit_interval_ms: u64,
}

impl Default for VeloxConfig {
    fn default() -> Self {
        Self {
            max_concurrent_scans: 4,
            default_max_depth: 100,
            include_hidden_default: false,
            follow_symlinks_default: false,
            progress_emit_interval_ms: 50, // 20 updates per second max
        }
    }
}

impl VeloxState {
    pub fn new() -> Self {
        Self {
            started_at: Utc::now(),
            active_scans: RwLock::new(HashMap::new()),
            config: RwLock::new(VeloxConfig::default()),
        }
    }

    /// Get uptime in milliseconds
    pub fn uptime_ms(&self) -> u64 {
        Utc::now()
            .signed_duration_since(self.started_at)
            .num_milliseconds() as u64
    }

    /// Register a new scan session
    pub fn register_scan(&self, session: ScanSession) -> String {
        let id = session.id.to_string();
        let mut scans = self.active_scans.write();
        scans.insert(id.clone(), Arc::new(session));
        id
    }

    /// Get a scan session by ID
    pub fn get_scan(&self, scan_id: &str) -> Option<Arc<ScanSession>> {
        let scans = self.active_scans.read();
        scans.get(scan_id).cloned()
    }

    /// Remove a completed scan session
    pub fn remove_scan(&self, scan_id: &str) {
        let mut scans = self.active_scans.write();
        scans.remove(scan_id);
    }

    /// Get count of active scans
    pub fn active_scan_count(&self) -> usize {
        let scans = self.active_scans.read();
        scans.values().filter(|s| s.status == ScanStatus::Scanning).count()
    }

    /// Cancel a scan by ID
    pub fn cancel_scan(&self, scan_id: &str) -> bool {
        if let Some(session) = self.get_scan(scan_id) {
            session.cancel();
            true
        } else {
            false
        }
    }
}

impl Default for VeloxState {
    fn default() -> Self {
        Self::new()
    }
}

