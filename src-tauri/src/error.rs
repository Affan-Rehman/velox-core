// VELOX CORE - Error Handling Module
// Strict error types for robust IPC communication

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Core error types for VELOX operations
#[derive(Error, Debug)]
pub enum VeloxError {
    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Scan operation cancelled by user")]
    ScanCancelled,

    #[error("Invalid path: {0}")]
    InvalidPath(String),

    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("Scan already in progress for session: {0}")]
    ScanInProgress(String),

    #[error("No active scan found for session: {0}")]
    NoActiveScan(String),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("State lock error: {0}")]
    StateLock(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

/// Serializable error response for frontend consumption
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
    pub timestamp: String,
}

impl From<VeloxError> for ErrorResponse {
    fn from(error: VeloxError) -> Self {
        let (code, message) = match &error {
            VeloxError::Io(e) => ("IO_ERROR".to_string(), e.to_string()),
            VeloxError::ScanCancelled => ("SCAN_CANCELLED".to_string(), error.to_string()),
            VeloxError::InvalidPath(p) => ("INVALID_PATH".to_string(), format!("Invalid path: {}", p)),
            VeloxError::AccessDenied(p) => ("ACCESS_DENIED".to_string(), format!("Access denied: {}", p)),
            VeloxError::ScanInProgress(s) => ("SCAN_IN_PROGRESS".to_string(), format!("Scan already running: {}", s)),
            VeloxError::NoActiveScan(s) => ("NO_ACTIVE_SCAN".to_string(), format!("No scan found: {}", s)),
            VeloxError::Serialization(e) => ("SERIALIZATION_ERROR".to_string(), e.clone()),
            VeloxError::StateLock(e) => ("STATE_LOCK_ERROR".to_string(), e.clone()),
            VeloxError::Unknown(e) => ("UNKNOWN_ERROR".to_string(), e.clone()),
        };

        ErrorResponse {
            code,
            message,
            details: Some(format!("{:?}", error)),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

// Implement Serialize for VeloxError to allow it to be returned from commands
impl Serialize for VeloxError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let response = ErrorResponse::from(self.clone());
        response.serialize(serializer)
    }
}

impl Clone for VeloxError {
    fn clone(&self) -> Self {
        match self {
            Self::Io(e) => Self::Unknown(e.to_string()),
            Self::ScanCancelled => Self::ScanCancelled,
            Self::InvalidPath(p) => Self::InvalidPath(p.clone()),
            Self::AccessDenied(p) => Self::AccessDenied(p.clone()),
            Self::ScanInProgress(s) => Self::ScanInProgress(s.clone()),
            Self::NoActiveScan(s) => Self::NoActiveScan(s.clone()),
            Self::Serialization(e) => Self::Serialization(e.clone()),
            Self::StateLock(e) => Self::StateLock(e.clone()),
            Self::Unknown(e) => Self::Unknown(e.clone()),
        }
    }
}

pub type VeloxResult<T> = Result<T, VeloxError>;

