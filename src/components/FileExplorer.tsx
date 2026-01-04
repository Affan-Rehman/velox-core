// VELOX CORE - File Explorer
// High-performance file listing with virtual scrolling

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Folder,
  Link2,
  Search,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronDown,
  File,
  Image,
  FileCode,
  FileJson,
  FileVideo,
  FileAudio,
  Archive,
} from 'lucide-react';
import { useVeloxStore } from '@/store/veloxStore';
import type { FileEntry } from '@/types';
import clsx from 'clsx';

export function FileExplorer() {
  const {
    filteredEntries,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    setViewMode,
    setSortBy,
    toggleSortOrder,
    setSearchQuery,
  } = useVeloxStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Group entries by depth for tree view
  const topLevelEntries = useMemo(() => {
    return filteredEntries.filter((e) => e.depth <= 1);
  }, [filteredEntries]);

  const displayEntries = viewMode === 'tree' ? topLevelEntries : filteredEntries;

  return (
    <div className="card h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-velox-graphite/50">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-velox-steel" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 text-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <ArrowUpDown className="w-4 h-4" />
            <span className="capitalize">{sortBy}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <div className="bg-velox-slate border border-velox-graphite rounded-lg shadow-xl p-1 min-w-[140px]">
              {(['name', 'size', 'modified', 'type'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={clsx(
                    'w-full px-3 py-2 text-left text-sm rounded-md transition-colors capitalize',
                    sortBy === option
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-velox-silver hover:bg-velox-graphite hover:text-velox-ivory'
                  )}
                >
                  {option}
                </button>
              ))}
              <div className="border-t border-velox-graphite my-1" />
              <button
                onClick={toggleSortOrder}
                className="w-full px-3 py-2 text-left text-sm rounded-md text-velox-silver hover:bg-velox-graphite hover:text-velox-ivory"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-velox-slate rounded-lg p-1">
          <ViewModeButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            icon={<List className="w-4 h-4" />}
            label="List"
          />
          <ViewModeButton
            active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Grid"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto scrollable p-2">
        <AnimatePresence mode="popLayout">
          {displayEntries.length > 0 ? (
            viewMode === 'grid' ? (
              <motion.div
                className="grid grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {displayEntries.slice(0, 200).map((entry, index) => (
                  <GridItem
                    key={entry.id}
                    entry={entry}
                    index={index}
                    selected={selectedId === entry.id}
                    onClick={() => setSelectedId(entry.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                {displayEntries.slice(0, 500).map((entry, index) => (
                  <ListItem
                    key={entry.id}
                    entry={entry}
                    index={index}
                    selected={selectedId === entry.id}
                    onClick={() => setSelectedId(entry.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-velox-steel">No files found</p>
            </div>
          )}
        </AnimatePresence>

        {displayEntries.length > 500 && viewMode === 'list' && (
          <div className="text-center py-4 text-velox-steel text-sm">
            Showing first 500 of {displayEntries.length.toLocaleString()} entries
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-velox-graphite/50 text-xs text-velox-steel flex items-center justify-between">
        <span>{filteredEntries.length.toLocaleString()} items</span>
        {searchQuery && (
          <span>Filtered from {useVeloxStore.getState().scanResult?.entries.length.toLocaleString()} total</span>
        )}
      </div>
    </div>
  );
}

interface ViewModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ViewModeButton({ active, onClick, icon, label }: ViewModeButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'p-2 rounded-md transition-colors',
        active
          ? 'bg-velox-graphite text-velox-ivory'
          : 'text-velox-steel hover:text-velox-silver'
      )}
    >
      {icon}
    </button>
  );
}

interface ListItemProps {
  entry: FileEntry;
  index: number;
  selected: boolean;
  onClick: () => void;
}

function ListItem({ entry, index, selected, onClick }: ListItemProps) {
  const Icon = getFileIcon(entry);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.01, 0.3) }}
      onClick={onClick}
      className={clsx(
        'file-item',
        selected && 'file-item-selected'
      )}
    >
      {/* Icon */}
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        entry.isDirectory ? 'bg-amber-500/20 text-amber-400' :
        entry.isSymlink ? 'bg-purple-500/20 text-purple-400' :
        'bg-velox-graphite text-velox-silver'
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-velox-ivory truncate font-medium">
          {entry.name}
        </p>
        <p className="text-2xs text-velox-steel truncate-path font-mono">
          {entry.path}
        </p>
      </div>

      {/* Size */}
      <div className="text-right">
        <p className="text-xs font-mono text-velox-silver">
          {entry.isDirectory ? '--' : entry.sizeFormatted}
        </p>
        {entry.extension && (
          <p className="text-2xs text-velox-steel uppercase">
            .{entry.extension}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface GridItemProps {
  entry: FileEntry;
  index: number;
  selected: boolean;
  onClick: () => void;
}

function GridItem({ entry, index, selected, onClick }: GridItemProps) {
  const Icon = getFileIcon(entry);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      onClick={onClick}
      className={clsx(
        'p-3 rounded-xl border transition-all cursor-default group',
        selected
          ? 'bg-accent-primary/10 border-accent-primary/30'
          : 'bg-velox-slate/20 border-transparent hover:bg-velox-slate/40 hover:border-velox-graphite'
      )}
    >
      {/* Icon */}
      <div className={clsx(
        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110',
        entry.isDirectory ? 'bg-amber-500/20 text-amber-400' :
        entry.isSymlink ? 'bg-purple-500/20 text-purple-400' :
        'bg-velox-graphite text-velox-silver'
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Name */}
      <p className="text-xs text-velox-ivory truncate text-center font-medium">
        {entry.name}
      </p>
      
      {/* Size */}
      <p className="text-2xs text-velox-steel text-center mt-0.5">
        {entry.isDirectory ? 'Folder' : entry.sizeFormatted}
      </p>
    </motion.div>
  );
}

function getFileIcon(entry: FileEntry) {
  if (entry.isDirectory) return Folder;
  if (entry.isSymlink) return Link2;

  const ext = entry.extension?.toLowerCase();
  
  const iconMap: Record<string, typeof FileText> = {
    // Images
    png: Image, jpg: Image, jpeg: Image, gif: Image, svg: Image, webp: Image, ico: Image,
    // Code
    js: FileCode, ts: FileCode, tsx: FileCode, jsx: FileCode, py: FileCode, rs: FileCode,
    go: FileCode, java: FileCode, c: FileCode, cpp: FileCode, h: FileCode, css: FileCode,
    scss: FileCode, html: FileCode, vue: FileCode, svelte: FileCode,
    // Data
    json: FileJson, yaml: FileJson, yml: FileJson, xml: FileJson, toml: FileJson,
    // Video
    mp4: FileVideo, mov: FileVideo, avi: FileVideo, mkv: FileVideo, webm: FileVideo,
    // Audio
    mp3: FileAudio, wav: FileAudio, ogg: FileAudio, flac: FileAudio, m4a: FileAudio,
    // Archives
    zip: Archive, tar: Archive, gz: Archive, rar: Archive, '7z': Archive,
  };

  return iconMap[ext || ''] || File;
}

