// VELOX CORE - TypeScript Type Definitions
// Strict contracts that mirror Rust structs exactly

/** File entry metadata - mirrors Rust FileEntry */
export interface FileEntry {
  id: string;
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  extension: string | null;
  modified: string | null;
  created: string | null;
  depth: number;
  childrenCount: number | null;
}

/** Directory scan result - mirrors Rust ScanResult */
export interface ScanResult {
  scanId: string;
  rootPath: string;
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  totalSizeFormatted: string;
  entries: FileEntry[];
  durationMs: number;
  completedAt: string;
  status: ScanStatus;
}

/** Scan progress event payload - mirrors Rust ScanProgress */
export interface ScanProgress {
  scanId: string;
  currentPath: string;
  filesScanned: number;
  directoriesScanned: number;
  bytesScanned: number;
  bytesScannedFormatted: string;
  progressPercent: number;
  estimatedTotal: number | null;
  elapsedMs: number;
  status: ScanStatus;
}

/** Scan status enum - mirrors Rust ScanStatus */
export type ScanStatus = 'idle' | 'scanning' | 'completed' | 'cancelled' | 'error';

/** System information - mirrors Rust SystemInfo */
export interface SystemInfo {
  os: string;
  arch: string;
  version: string;
  hostname: string;
  cpuCores: number;
  timestamp: string;
}

/** Heartbeat response - mirrors Rust HeartbeatResponse */
export interface HeartbeatResponse {
  status: string;
  uptimeMs: number;
  activeScans: number;
  timestamp: string;
  version: string;
}

/** Scan request - mirrors Rust ScanRequest */
export interface ScanRequest {
  path: string;
  maxDepth?: number;
  includeHidden: boolean;
  followSymlinks: boolean;
}

/** Error response from Rust backend */
export interface ErrorResponse {
  code: string;
  message: string;
  details: string | null;
  timestamp: string;
}

/** Ready event payload */
export interface ReadyEvent {
  version: string;
  timestamp: string;
}

/** Scan error event payload */
export interface ScanErrorEvent {
  scanId: string;
  error: string;
}

// Type guards for runtime safety
export function isScanProgress(obj: unknown): obj is ScanProgress {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'scanId' in obj &&
    'filesScanned' in obj &&
    'status' in obj
  );
}

export function isScanResult(obj: unknown): obj is ScanResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'scanId' in obj &&
    'entries' in obj &&
    'totalFiles' in obj
  );
}

export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj
  );
}

