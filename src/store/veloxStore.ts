// VELOX CORE - Zustand State Management
// Atomic state management for the Velox frontend

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ScanResult,
  ScanProgress,
  ScanStatus,
  SystemInfo,
  HeartbeatResponse,
  FileEntry,
} from '@/types';
import * as ipc from '@/lib/ipc';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface VeloxState {
  // Connection state
  isConnected: boolean;
  backendVersion: string | null;
  systemInfo: SystemInfo | null;

  // Scan state
  scanStatus: ScanStatus;
  currentScanId: string | null;
  scanProgress: ScanProgress | null;
  scanResult: ScanResult | null;
  selectedPath: string | null;

  // UI state
  isDialogOpen: boolean;
  error: string | null;

  // View state
  viewMode: 'grid' | 'list' | 'tree';
  sortBy: 'name' | 'size' | 'modified' | 'type';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  filteredEntries: FileEntry[];

  // Actions
  setConnected: (connected: boolean) => void;
  setBackendVersion: (version: string) => void;
  setSystemInfo: (info: SystemInfo) => void;
  
  // Scan actions
  startScan: (path: string) => Promise<void>;
  cancelScan: () => Promise<void>;
  updateProgress: (progress: ScanProgress) => void;
  completeScan: (result: ScanResult) => void;
  setError: (error: string | null) => void;
  
  // Selection actions
  selectFolder: () => Promise<void>;
  setSelectedPath: (path: string | null) => void;
  
  // View actions
  setViewMode: (mode: 'grid' | 'list' | 'tree') => void;
  setSortBy: (sortBy: 'name' | 'size' | 'modified' | 'type') => void;
  toggleSortOrder: () => void;
  setSearchQuery: (query: string) => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  isConnected: false,
  backendVersion: null,
  systemInfo: null,
  scanStatus: 'idle' as ScanStatus,
  currentScanId: null,
  scanProgress: null,
  scanResult: null,
  selectedPath: null,
  isDialogOpen: false,
  error: null,
  viewMode: 'list' as const,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  searchQuery: '',
  filteredEntries: [] as FileEntry[],
};

// ============================================================================
// STORE
// ============================================================================

export const useVeloxStore = create<VeloxState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setConnected: (connected) => set({ isConnected: connected }),
    
    setBackendVersion: (version) => set({ backendVersion: version }),
    
    setSystemInfo: (info) => set({ systemInfo: info }),

    startScan: async (path) => {
      const state = get();
      if (state.scanStatus === 'scanning') {
        console.warn('Scan already in progress');
        return;
      }

      set({
        scanStatus: 'scanning',
        scanProgress: null,
        scanResult: null,
        error: null,
      });

      try {
        const result = await ipc.scanDirectory({
          path,
          includeHidden: false,
          followSymlinks: false,
        });

        set({
          scanResult: result,
          currentScanId: result.scanId,
          scanStatus: 'completed',
          filteredEntries: result.entries,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        set({
          error: message,
          scanStatus: 'error',
        });
      }
    },

    cancelScan: async () => {
      const { currentScanId } = get();
      if (!currentScanId) return;

      try {
        await ipc.cancelScan(currentScanId);
        set({ scanStatus: 'cancelled' });
      } catch (error) {
        console.error('Failed to cancel scan:', error);
      }
    },

    updateProgress: (progress) => {
      set({
        scanProgress: progress,
        currentScanId: progress.scanId,
        scanStatus: progress.status,
      });
    },

    completeScan: (result) => {
      set({
        scanResult: result,
        scanStatus: 'completed',
        filteredEntries: result.entries,
      });
    },

    setError: (error) => set({ error }),

    selectFolder: async () => {
      try {
        set({ isDialogOpen: true });
        const path = await ipc.openFolderDialog();
        set({ isDialogOpen: false });
        
        if (path) {
          set({ selectedPath: path });
          // Auto-start scan when folder is selected
          get().startScan(path);
        }
      } catch (error) {
        set({ isDialogOpen: false });
        const message = error instanceof Error ? error.message : String(error);
        set({ error: message });
      }
    },

    setSelectedPath: (path) => set({ selectedPath: path }),

    setViewMode: (viewMode) => set({ viewMode }),

    setSortBy: (sortBy) => {
      const { scanResult, sortOrder } = get();
      if (!scanResult) return;

      const sorted = sortEntries(scanResult.entries, sortBy, sortOrder);
      set({ sortBy, filteredEntries: sorted });
    },

    toggleSortOrder: () => {
      const { scanResult, sortBy, sortOrder } = get();
      if (!scanResult) return;

      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const sorted = sortEntries(scanResult.entries, sortBy, newOrder);
      set({ sortOrder: newOrder, filteredEntries: sorted });
    },

    setSearchQuery: (query) => {
      const { scanResult, sortBy, sortOrder } = get();
      if (!scanResult) {
        set({ searchQuery: query, filteredEntries: [] });
        return;
      }

      const filtered = scanResult.entries.filter((entry) =>
        entry.name.toLowerCase().includes(query.toLowerCase())
      );
      const sorted = sortEntries(filtered, sortBy, sortOrder);
      set({ searchQuery: query, filteredEntries: sorted });
    },

    reset: () => set(initialState),
  }))
);

// ============================================================================
// HELPERS
// ============================================================================

function sortEntries(
  entries: FileEntry[],
  sortBy: 'name' | 'size' | 'modified' | 'type',
  order: 'asc' | 'desc'
): FileEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let comparison = 0;

    // Directories always first
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'modified':
        const aTime = a.modified ? new Date(a.modified).getTime() : 0;
        const bTime = b.modified ? new Date(b.modified).getTime() : 0;
        comparison = aTime - bTime;
        break;
      case 'type':
        const aExt = a.extension || '';
        const bExt = b.extension || '';
        comparison = aExt.localeCompare(bExt);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIsScanning = (state: VeloxState) => state.scanStatus === 'scanning';
export const selectHasResult = (state: VeloxState) => state.scanResult !== null;
export const selectProgress = (state: VeloxState) => state.scanProgress;
export const selectStats = (state: VeloxState) => {
  const { scanResult, scanProgress } = state;
  
  if (scanResult) {
    return {
      files: scanResult.totalFiles,
      directories: scanResult.totalDirectories,
      size: scanResult.totalSizeFormatted,
      duration: scanResult.durationMs,
    };
  }
  
  if (scanProgress) {
    return {
      files: scanProgress.filesScanned,
      directories: scanProgress.directoriesScanned,
      size: scanProgress.bytesScannedFormatted,
      duration: scanProgress.elapsedMs,
    };
  }
  
  return null;
};

