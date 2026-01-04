// VELOX CORE - IPC Bridge
// Type-safe communication layer with the Rust backend

import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type {
  ScanRequest,
  ScanResult,
  ScanProgress,
  ScanStatus,
  SystemInfo,
  HeartbeatResponse,
  ReadyEvent,
  ScanErrorEvent,
} from '@/types';

// ============================================================================
// COMMAND INVOCATIONS
// ============================================================================

/**
 * Scan a directory recursively with progress streaming
 */
export async function scanDirectory(request: ScanRequest): Promise<ScanResult> {
  return invoke<ScanResult>('scan_directory', { request });
}

/**
 * Cancel an active scan
 */
export async function cancelScan(scanId: string): Promise<boolean> {
  return invoke<boolean>('cancel_scan', { scanId });
}

/**
 * Get the status of an active scan
 */
export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  return invoke<ScanStatus>('get_scan_status', { scanId });
}

/**
 * Get system information
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>('get_system_info');
}

/**
 * Heartbeat for frontend-backend sync verification
 */
export async function heartbeat(): Promise<HeartbeatResponse> {
  return invoke<HeartbeatResponse>('heartbeat');
}

/**
 * Open native folder dialog and return selected path
 */
export async function openFolderDialog(): Promise<string | null> {
  return invoke<string | null>('open_folder_dialog');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Listen for Velox ready event
 */
export async function onReady(callback: (event: ReadyEvent) => void): Promise<UnlistenFn> {
  return listen<ReadyEvent>('velox:ready', (event) => callback(event.payload));
}

/**
 * Listen for scan progress events
 */
export async function onScanProgress(callback: (progress: ScanProgress) => void): Promise<UnlistenFn> {
  return listen<ScanProgress>('velox:scan:progress', (event) => callback(event.payload));
}

/**
 * Listen for scan completion events
 */
export async function onScanComplete(callback: (result: ScanResult) => void): Promise<UnlistenFn> {
  return listen<ScanResult>('velox:scan:complete', (event) => callback(event.payload));
}

/**
 * Listen for scan error events
 */
export async function onScanError(callback: (error: ScanErrorEvent) => void): Promise<UnlistenFn> {
  return listen<ScanErrorEvent>('velox:scan:error', (event) => callback(event.payload));
}

// ============================================================================
// HEARTBEAT MONITOR
// ============================================================================

export class HeartbeatMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected = true;
  private onStatusChange: (connected: boolean) => void;

  constructor(onStatusChange: (connected: boolean) => void) {
    this.onStatusChange = onStatusChange;
  }

  start(intervalMs = 5000): void {
    this.stop();
    this.intervalId = setInterval(async () => {
      try {
        await heartbeat();
        if (!this.isConnected) {
          this.isConnected = true;
          this.onStatusChange(true);
        }
      } catch {
        if (this.isConnected) {
          this.isConnected = false;
          this.onStatusChange(false);
        }
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

