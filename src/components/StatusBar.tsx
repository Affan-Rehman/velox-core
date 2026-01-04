// VELOX CORE - Status Bar
// System status and connection indicator

import { motion } from 'framer-motion';
import { Cpu, HardDrive, Wifi, WifiOff, Clock } from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const { isConnected, systemInfo, scanStatus, error } = useVeloxStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-7 flex items-center justify-between px-4 bg-velox-abyss/80 backdrop-blur-xl border-t border-velox-graphite/50 text-2xs text-velox-steel select-none">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi className="w-3 h-3 text-accent-success" />
          ) : (
            <WifiOff className="w-3 h-3 text-accent-danger" />
          )}
          <span className={clsx(isConnected ? 'text-accent-success' : 'text-accent-danger')}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-3 bg-velox-graphite" />

        {/* System info */}
        {systemInfo && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {systemInfo.os} • {systemInfo.arch}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {systemInfo.cpuCores} cores
            </span>
          </div>
        )}

        {/* Error display */}
        {error && (
          <>
            <div className="w-px h-3 bg-velox-graphite" />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-accent-danger flex items-center gap-1"
            >
              ⚠ {error}
            </motion.span>
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Scan status indicator */}
        {scanStatus !== 'idle' && (
          <div className="flex items-center gap-1.5">
            {scanStatus === 'scanning' && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-accent-primary"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <span className={clsx(
              scanStatus === 'completed' && 'text-accent-success',
              scanStatus === 'scanning' && 'text-accent-primary',
              scanStatus === 'error' && 'text-accent-danger',
              scanStatus === 'cancelled' && 'text-accent-warning'
            )}>
              {scanStatus === 'scanning' && 'Scanning...'}
              {scanStatus === 'completed' && 'Scan Complete'}
              {scanStatus === 'error' && 'Scan Error'}
              {scanStatus === 'cancelled' && 'Scan Cancelled'}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-3 bg-velox-graphite" />

        {/* Clock */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span className="font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Version */}
        <span className="text-velox-graphite font-mono">
          VELOX CORE
        </span>
      </div>
    </footer>
  );
}

