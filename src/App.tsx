// VELOX CORE - Main Application Component
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TitleBar } from './components/TitleBar';
import { ScannerPanel } from './components/ScannerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { StatsPanel } from './components/StatsPanel';
import { FileExplorer } from './components/FileExplorer';
import { StatusBar } from './components/StatusBar';
import { EmptyState } from './components/EmptyState';
import { useVeloxStore } from './store/veloxStore';
import * as ipc from './lib/ipc';

function App() {
  const {
    setConnected,
    setBackendVersion,
    setSystemInfo,
    updateProgress,
    completeScan,
    setError,
    scanStatus,
    scanResult,
    scanProgress,
  } = useVeloxStore();

  // Initialize IPC listeners
  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    const setupListeners = async () => {
      // Ready event
      const unlistenReady = await ipc.onReady((event) => {
        console.log('🚀 VELOX CORE Ready:', event);
        setConnected(true);
        setBackendVersion(event.version);
      });
      unlisteners.push(unlistenReady);

      // Progress event
      const unlistenProgress = await ipc.onScanProgress((progress) => {
        updateProgress(progress);
      });
      unlisteners.push(unlistenProgress);

      // Complete event
      const unlistenComplete = await ipc.onScanComplete((result) => {
        completeScan(result);
      });
      unlisteners.push(unlistenComplete);

      // Error event
      const unlistenError = await ipc.onScanError((error) => {
        setError(error.error);
      });
      unlisteners.push(unlistenError);

      // Fetch system info
      try {
        const sysInfo = await ipc.getSystemInfo();
        setSystemInfo(sysInfo);
      } catch (error) {
        console.error('Failed to get system info:', error);
      }
    };

    setupListeners();

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [setConnected, setBackendVersion, setSystemInfo, updateProgress, completeScan, setError]);

  // Heartbeat monitor
  useEffect(() => {
    const monitor = new ipc.HeartbeatMonitor((connected) => {
      setConnected(connected);
    });
    monitor.start(5000);
    return () => monitor.stop();
  }, [setConnected]);

  const isScanning = scanStatus === 'scanning';
  const hasResult = scanResult !== null;

  return (
    <div className="h-screen flex flex-col bg-velox-void overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-tertiary/5 rounded-full blur-[128px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 flex flex-col p-6 gap-6 min-h-0">
          {/* Top Section: Scanner + Stats */}
          <div className="flex gap-6">
            {/* Scanner Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              <ScannerPanel />
            </motion.div>

            {/* Stats Panel */}
            <AnimatePresence mode="wait">
              {(isScanning || hasResult) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-80"
                >
                  <StatsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Panel */}
          <AnimatePresence mode="wait">
            {isScanning && scanProgress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProgressPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Explorer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-h-0"
          >
            <AnimatePresence mode="wait">
              {hasResult ? (
                <motion.div
                  key="explorer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <FileExplorer />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App;

