// VELOX CORE - Custom Title Bar
// Desktop-native frameless window controls

import { useCallback } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { motion } from 'framer-motion';
import { Minus, Square, X, Zap } from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';
import clsx from 'clsx';

export function TitleBar() {
  const { isConnected, backendVersion } = useVeloxStore();

  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }, []);

  const handleClose = useCallback(async () => {
    await appWindow.close();
  }, []);

  return (
    <header
      data-tauri-drag-region
      className="h-12 flex items-center justify-between px-4 bg-velox-abyss/80 backdrop-blur-xl border-b border-velox-graphite/50 select-none"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        {/* Animated Logo */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-lg shadow-accent-primary/30">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {/* Pulse ring when connected */}
          {isConnected && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-accent-primary"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.div>

        {/* Title */}
        <div className="flex items-baseline gap-2" data-tauri-drag-region>
          <h1 className="text-sm font-bold text-velox-white tracking-tight font-display">
            VELOX CORE
          </h1>
          {backendVersion && (
            <span className="text-2xs font-mono text-velox-steel">
              v{backendVersion}
            </span>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1.5 ml-4">
          <div
            className={clsx(
              'w-1.5 h-1.5 rounded-full transition-colors',
              isConnected ? 'bg-accent-success' : 'bg-accent-danger animate-pulse'
            )}
          />
          <span className="text-2xs font-medium text-velox-steel uppercase tracking-wider">
            {isConnected ? 'Engine Ready' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1">
        <WindowButton
          onClick={handleMinimize}
          icon={<Minus className="w-3 h-3" />}
          label="Minimize"
        />
        <WindowButton
          onClick={handleMaximize}
          icon={<Square className="w-2.5 h-2.5" />}
          label="Maximize"
        />
        <WindowButton
          onClick={handleClose}
          icon={<X className="w-3.5 h-3.5" />}
          label="Close"
          variant="danger"
        />
      </div>
    </header>
  );
}

interface WindowButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
}

function WindowButton({ onClick, icon, label, variant = 'default' }: WindowButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'w-10 h-8 flex items-center justify-center rounded transition-colors',
        variant === 'default' && 'text-velox-silver hover:bg-velox-slate hover:text-velox-ivory',
        variant === 'danger' && 'text-velox-silver hover:bg-accent-danger hover:text-white'
      )}
    >
      {icon}
    </button>
  );
}

