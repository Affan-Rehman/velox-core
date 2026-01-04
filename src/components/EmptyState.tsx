// VELOX CORE - Empty State
// Beautiful onboarding state when no scan has been performed

import { motion } from 'framer-motion';
import { FolderSearch, Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';

export function EmptyState() {
  const { selectFolder } = useVeloxStore();

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Lightning Fast',
      description: 'Rust-powered async scanning with real-time progress streaming',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure by Design',
      description: 'Sandboxed file access with no raw paths stored in memory',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Zero ANR',
      description: 'Completely decoupled UI ensures 100% responsiveness',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-8">
      {/* Main illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Glowing orb background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-40 h-40 bg-accent-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Icon */}
        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-velox-slate to-velox-obsidian border border-velox-graphite flex items-center justify-center shadow-2xl">
          <FolderSearch className="w-14 h-14 text-accent-primary" />
          
          {/* Animated ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-accent-primary/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-velox-white font-display text-center mb-2"
      >
        Ready to Explore
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-velox-silver text-center max-w-md mb-8"
      >
        Select a folder to begin scanning. VELOX CORE will recursively analyze 
        the directory and stream results in real-time.
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={selectFolder}
        className="group btn-primary flex items-center gap-3 text-lg px-8 py-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Select Folder</span>
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </motion.button>

      {/* Features grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-6 mt-16 max-w-3xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="text-center"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mx-auto mb-3`}>
              {feature.icon}
            </div>
            <h3 className="text-sm font-semibold text-velox-ivory mb-1 font-display">
              {feature.title}
            </h3>
            <p className="text-xs text-velox-steel leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex items-center gap-2 text-velox-steel text-xs"
      >
        <kbd className="px-2 py-1 bg-velox-slate rounded border border-velox-graphite font-mono">
          ⌘
        </kbd>
        <span>+</span>
        <kbd className="px-2 py-1 bg-velox-slate rounded border border-velox-graphite font-mono">
          O
        </kbd>
        <span className="ml-1">to open folder dialog</span>
      </motion.div>
    </div>
  );
}

