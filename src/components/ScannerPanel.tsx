// VELOX CORE - Scanner Panel
// Folder selection and scan controls

import { motion } from 'framer-motion';
import { FolderOpen, Play, Square, RefreshCw } from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';
import clsx from 'clsx';

export function ScannerPanel() {
  const {
    selectedPath,
    scanStatus,
    selectFolder,
    startScan,
    cancelScan,
    reset,
  } = useVeloxStore();

  const isScanning = scanStatus === 'scanning';
  const hasPath = selectedPath !== null;

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-velox-white font-display">
              Directory Scanner
            </h2>
            <p className="text-sm text-velox-steel mt-0.5">
              Select a folder to analyze its contents
            </p>
          </div>
          
          {/* Status Badge */}
          <StatusBadge status={scanStatus} />
        </div>

        {/* Path Display */}
        <div className="relative">
          <button
            onClick={selectFolder}
            disabled={isScanning}
            className={clsx(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-left group',
              hasPath
                ? 'bg-velox-slate/30 border-velox-graphite hover:border-accent-primary/50'
                : 'bg-velox-slate/20 border-velox-graphite/50 hover:border-accent-primary/50 hover:bg-velox-slate/30',
              isScanning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              hasPath 
                ? 'bg-accent-primary/20 text-accent-primary' 
                : 'bg-velox-graphite text-velox-steel group-hover:bg-accent-primary/20 group-hover:text-accent-primary'
            )}>
              <FolderOpen className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              {hasPath ? (
                <>
                  <p className="text-sm font-medium text-velox-ivory truncate font-mono">
                    {selectedPath}
                  </p>
                  <p className="text-xs text-velox-steel mt-0.5">
                    Click to change folder
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-velox-silver">
                    No folder selected
                  </p>
                  <p className="text-xs text-velox-steel mt-0.5">
                    Click to browse for a directory
                  </p>
                </>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="text-velox-steel group-hover:text-accent-primary transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isScanning ? (
            <motion.button
              onClick={cancelScan}
              className="btn-danger flex items-center gap-2 flex-1"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Square className="w-4 h-4" />
              Cancel Scan
            </motion.button>
          ) : (
            <motion.button
              onClick={() => hasPath && startScan(selectedPath!)}
              disabled={!hasPath}
              className="btn-primary flex items-center gap-2 flex-1"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Play className="w-4 h-4" />
              Start Scan
            </motion.button>
          )}

          <motion.button
            onClick={reset}
            disabled={isScanning}
            className="btn-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    idle: { label: 'Ready', color: 'bg-velox-steel/20 text-velox-steel' },
    scanning: { label: 'Scanning', color: 'bg-accent-primary/20 text-accent-primary' },
    completed: { label: 'Completed', color: 'bg-accent-success/20 text-accent-success' },
    cancelled: { label: 'Cancelled', color: 'bg-accent-warning/20 text-accent-warning' },
    error: { label: 'Error', color: 'bg-accent-danger/20 text-accent-danger' },
  }[status] || { label: status, color: 'bg-velox-steel/20 text-velox-steel' };

  return (
    <div className={clsx(
      'px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2',
      config.color
    )}>
      {status === 'scanning' && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {config.label}
    </div>
  );
}

