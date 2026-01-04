// VELOX CORE - Stats Panel
// Summary statistics display

import { motion } from 'framer-motion';
import { FileText, Folder, HardDrive, Zap } from 'lucide-react';
import { useVeloxStore, selectStats } from '@/store/veloxStore';
import clsx from 'clsx';

export function StatsPanel() {
  const stats = useVeloxStore(selectStats);

  if (!stats) return null;

  const statItems = [
    {
      icon: <FileText className="w-5 h-5" />,
      value: stats.files.toLocaleString(),
      label: 'Files',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: <Folder className="w-5 h-5" />,
      value: stats.directories.toLocaleString(),
      label: 'Directories',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: <HardDrive className="w-5 h-5" />,
      value: stats.size,
      label: 'Total Size',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      value: `${(stats.duration / 1000).toFixed(2)}s`,
      label: 'Duration',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
    },
  ];

  return (
    <div className="card p-5 h-full">
      <h3 className="text-sm font-bold text-velox-white font-display mb-4">
        Scan Results
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card group hover:border-velox-steel/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx('p-1.5 rounded-lg', item.iconBg, item.iconColor)}>
                {item.icon}
              </div>
            </div>
            <p className="stat-value bg-gradient-to-r bg-clip-text text-transparent font-mono" 
               style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
              <span className={clsx('bg-gradient-to-r bg-clip-text text-transparent', item.color)}>
                {item.value}
              </span>
            </p>
            <p className="stat-label">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

