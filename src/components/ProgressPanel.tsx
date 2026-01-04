// VELOX CORE - Progress Panel
// Real-time scan progress visualization

import { motion } from 'framer-motion';
import { Loader2, FileText, Folder, HardDrive, Clock } from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';

export function ProgressPanel() {
  const { scanProgress } = useVeloxStore();

  if (!scanProgress) return null;

  const {
    currentPath,
    filesScanned,
    directoriesScanned,
    bytesScannedFormatted,
    elapsedMs,
  } = scanProgress;

  // Format elapsed time
  const seconds = Math.floor(elapsedMs / 1000);
  const ms = elapsedMs % 1000;
  const timeFormatted = seconds > 0 
    ? `${seconds}.${Math.floor(ms / 100)}s` 
    : `${ms}ms`;

  return (
    <div className="card p-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-tertiary/5 to-accent-primary/5 animate-pulse" />
      
      <div className="relative">
        {/* Header with spinner */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-5 h-5 text-accent-primary" />
          </motion.div>
          <span className="text-sm font-medium text-velox-ivory">
            Scanning directory...
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-velox-graphite rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full progress-animated rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Current path */}
        <div className="mb-4 p-3 bg-velox-slate/30 rounded-lg">
          <p className="text-2xs text-velox-steel uppercase tracking-wider mb-1">
            Current Path
          </p>
          <p className="text-xs font-mono text-velox-pearl truncate selectable">
            {currentPath || 'Starting...'}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          <ProgressStat
            icon={<FileText className="w-4 h-4" />}
            value={filesScanned.toLocaleString()}
            label="Files"
            color="text-accent-info"
          />
          <ProgressStat
            icon={<Folder className="w-4 h-4" />}
            value={directoriesScanned.toLocaleString()}
            label="Directories"
            color="text-accent-warning"
          />
          <ProgressStat
            icon={<HardDrive className="w-4 h-4" />}
            value={bytesScannedFormatted}
            label="Size"
            color="text-accent-success"
          />
          <ProgressStat
            icon={<Clock className="w-4 h-4" />}
            value={timeFormatted}
            label="Elapsed"
            color="text-accent-tertiary"
          />
        </div>
      </div>
    </div>
  );
}

interface ProgressStatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

function ProgressStat({ icon, value, label, color }: ProgressStatProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-velox-white font-mono">{value}</p>
        <p className="text-2xs text-velox-steel">{label}</p>
      </div>
    </div>
  );
}

