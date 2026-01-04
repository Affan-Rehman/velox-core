# ⚡ VELOX CORE

> **Performance-First Hybrid Desktop Engine**

A high-performance, local-first desktop application built with **Rust** (Tauri) and **React/TypeScript**. Designed for lightning-fast file operations with a premium "Obsidian SaaS" dark mode interface.

<p align="center">
  <img src="docs/preview.png" alt="VELOX CORE Preview" width="800"/>
</p>

---

## ✨ Features

### 🚀 **Lightning Fast**

- Rust-powered async directory scanning using `tokio` runtime
- Real-time progress streaming via Tauri IPC events
- Non-blocking I/O for zero UI freezes

### 🔒 **Secure by Design**

- Sandboxed file access with strict path validation
- No raw file paths stored in frontend memory
- UUID-based file references for enhanced security

### 🎨 **Premium UX**

- "Obsidian SaaS" dark mode design language
- Sub-100ms interaction latency target
- Custom frameless window with native controls
- Framer Motion animations throughout

### 📦 **Cross-Platform**

- Windows (x64) - `.msi` installer
- macOS (Apple Silicon & Intel) - `.dmg` disk image
- Linux - `.AppImage` and `.deb` packages

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VELOX CORE                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   React Frontend    │◄──►│     Tauri IPC Bridge       │ │
│  │   (TypeScript)      │    │     (Event Streaming)       │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│            │                              │                  │
│            ▼                              ▼                  │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Zustand Store     │    │     Rust Engine            │ │
│  │   (State Mgmt)      │    │     (Async Workers)         │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Backend (Rust)

- **Tauri Framework** - Lightweight alternative to Electron
- **Tokio Runtime** - Async I/O for non-blocking operations
- **WalkDir** - Efficient recursive directory traversal
- **Serde** - Type-safe serialization for IPC

### Frontend (TypeScript/React)

- **Zustand** - Lightweight state management
- **Framer Motion** - Premium animations
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable)
- [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

---

## 📁 Project Structure

```
velox-core/
├── src/                    # React frontend source
│   ├── components/         # UI components
│   ├── store/              # Zustand state management
│   ├── lib/                # IPC bridge & utilities
│   ├── types/              # TypeScript interfaces
│   └── styles/             # Global CSS
├── src-tauri/              # Rust backend source
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── commands.rs     # Tauri commands
│   │   ├── scanner.rs      # Directory scanner
│   │   ├── state.rs        # Global state
│   │   ├── types.rs        # Data structures
│   │   └── error.rs        # Error handling
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── .github/workflows/      # CI/CD pipelines
└── package.json            # Node dependencies
```

---

## 🎯 Core Commands

### IPC Commands (Frontend → Backend)

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `scan_directory`     | Recursively scan a folder with progress streaming |
| `cancel_scan`        | Cancel an active scan operation                   |
| `get_scan_status`    | Get current scan status                           |
| `heartbeat`          | Backend health check                              |
| `open_folder_dialog` | Open native folder picker                         |

### Events (Backend → Frontend)

| Event                 | Description                     |
| --------------------- | ------------------------------- |
| `velox:ready`         | Backend initialization complete |
| `velox:scan:progress` | Real-time scan progress updates |
| `velox:scan:complete` | Scan finished successfully      |
| `velox:scan:error`    | Scan encountered an error       |

---

## 🎨 Design System

### Color Palette (Obsidian SaaS)

| Token            | Hex       | Usage                    |
| ---------------- | --------- | ------------------------ |
| `velox-void`     | `#08090c` | Deepest background       |
| `velox-abyss`    | `#0d0f14` | Primary background       |
| `velox-obsidian` | `#12151c` | Card backgrounds         |
| `accent-primary` | `#6366f1` | Primary actions (Indigo) |
| `accent-success` | `#10b981` | Success states (Emerald) |
| `accent-danger`  | `#ef4444` | Error states (Red)       |

### Typography

- **Display**: Cabinet Grotesk (headings)
- **Body**: Satoshi (UI text)
- **Mono**: JetBrains Mono (code/paths)

---

## 🔧 Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

Key settings:

- **Window**: 1280x800, frameless with custom title bar
- **Permissions**: Scoped file access to user directories
- **Updater**: Auto-update with public key verification
- **CSP**: Strict content security policy

### Environment Variables

```bash
# Enable debug logging
RUST_LOG=velox_core=debug

# Tauri development
TAURI_DEBUG=true
```

---

## 📦 Building for Production

```bash
# Build optimized binaries
npm run tauri:build

# Output locations:
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/appimage/
```

---
