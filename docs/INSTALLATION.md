# Installation

## Pre-built Binaries

Download the latest release for your platform from the [Releases page](https://github.com/anomalyco/filesight/releases).

### macOS

1. Download `FileSight-*-mac.dmg`.
2. Open the DMG file.
3. Drag **FileSight** into your **Applications** folder.
4. Launch from Applications. On first launch, macOS may show a security warning — click **Open** to confirm.
5. If macOS blocks the app due to notarization, go to **System Settings > Privacy & Security** and click **Open Anyway**.

### Windows

1. Download `FileSight-*-win.exe`.
2. Run the installer. Windows may show a SmartScreen warning — click **More info > Run anyway**.
3. Follow the setup wizard. You can choose the installation directory and whether to create a desktop shortcut.
4. Launch FileSight from the Start menu or desktop shortcut.

### Linux

#### AppImage

1. Download `FileSight-*-linux.AppImage`.
2. Make it executable and run:
   ```bash
   chmod +x FileSight-*-linux.AppImage
   ./FileSight-*-linux.AppImage
   ```

#### Debian / Ubuntu

1. Download `FileSight-*-linux.deb`.
2. Install with:
   ```bash
   sudo dpkg -i FileSight-*-linux.deb
   ```

#### RPM (Fedora / RHEL)

1. Download `FileSight-*-linux.rpm`.
2. Install with:
   ```bash
   sudo rpm -i FileSight-*-linux.rpm
   ```

## Development Setup

### Requirements

- **Node.js** 18 or later
- **npm** 9 or later
- **Git**

### Steps

```bash
# Clone the repository
git clone https://github.com/anomalyco/filesight.git
cd filesight

# Install dependencies
npm install

# Start development mode (Next.js + Electron concurrently)
npm run dev
```

### Development Commands

| Command                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start Next.js dev server + Electron in development mode   |
| `npm run dev:next`     | Start only the Next.js dev server                         |
| `npm run dev:electron` | Compile and launch Electron                               |
| `npm run build`        | Build Next.js static export + compile Electron TypeScript |
| `npm test`             | Run all tests                                             |
| `npm run dist`         | Build and package for the current platform                |
| `npm run dist:mac`     | Build and package for macOS                               |
| `npm run dist:win`     | Build and package for Windows                             |
| `npm run lint`         | Run ESLint                                                |
| `npm run format`       | Format code with Prettier                                 |

### Project Structure

```
filesight/
├── src/                    # Next.js frontend
│   ├── app/                # Pages (home, dashboard, duplicates, history, settings)
│   ├── components/         # React components
│   ├── hooks/              # React hooks
│   ├── stores/             # Zustand stores
│   ├── lib/                # Utilities and constants
│   └── types/              # TypeScript types
├── electron/               # Electron main process
│   ├── main.ts             # Electron entry point
│   ├── preload.ts          # Context bridge
│   ├── scanner/            # File scanning engine
│   ├── analyzer/           # Storage analysis engine
│   ├── duplicates/         # Duplicate detection
│   ├── cleanup/            # Trash/cleanup module
│   ├── database/           # JSON persistence layer
│   ├── settings/           # Settings system
│   └── ipc/                # IPC handlers
├── tests/                  # Test files
├── resources/              # App icons and build resources
├── docs/                   # Documentation
└── assets/                 # Branding and screenshots
```
