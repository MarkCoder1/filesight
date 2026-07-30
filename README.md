<div align="center">
  <br />
  <img src="./assets/logo/filesight.png" width="80" height="80" alt="FileSight Logo" />
  <h1 align="center">FileSight</h1>
  <p align="center">
    <strong>Understand your files. Reclaim your space.</strong>
  </p>
  <p align="center">
    A privacy-first desktop application for understanding and managing your files.
    <br />
    Everything runs locally. Nothing is sent to the cloud.
  </p>
  <p align="center">
    <a href="#features">Features</a>&nbsp;·&nbsp;
    <a href="#screenshots">Screenshots</a>&nbsp;·&nbsp;
    <a href="#installation">Installation</a>&nbsp;·&nbsp;
    <a href="docs/INSTALLATION.md">Documentation</a>&nbsp;·&nbsp;
    <a href="CONTRIBUTING.md">Contributing</a>
  </p>
  <br />
</div>

## The Problem

Downloads folders silently accumulate clutter:

- Old installers (`.dmg`, `.exe`, `.pkg`) lingering for years
- Duplicate files with identical content
- Large forgotten files consuming disk space
- Scattered documents with no organization

## The Solution

FileSight gives you a clear picture of your files so you can make informed decisions about what to keep and what to clean up.

## Features

| Feature                 | Description                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Storage Analysis**    | Visual breakdown of your Downloads folder by file type, size, and age.                          |
| **Duplicate Detection** | Find and review duplicate files using hash-based content analysis.                              |
| **Smart Suggestions**   | Get actionable recommendations for cleaning up old installers, large files, and stale archives. |
| **File Explorer**       | Search, filter, and sort through your files by category, size, and date.                        |
| **Safe Cleanup**        | Move files to the system Trash with a single click. Nothing is deleted automatically.           |
| **Scan History**        | Track storage changes over time with trend charts and scan comparisons.                         |
| **Privacy First**       | All processing happens on your device. No accounts. No tracking. No uploads.                    |

## Screenshots

| Home                                   | Dashboard                                        | Duplicates                                         |
| -------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| ![Home](./assets/screenshots/home.png) | ![Dashboard](./assets/screenshots/dashboard.png) | ![Duplicates](./assets/screenshots/duplicates.png) |

## Installation

### macOS

1. Download the latest `.dmg` from the [Releases page](https://github.com/anomalyco/filesight/releases).
2. Open the DMG and drag **FileSight** to your Applications folder.
3. Launch the app. macOS may ask you to confirm opening a downloaded app.

### Windows

1. Download the latest `-win.exe` from the [Releases page](https://github.com/anomalyco/filesight/releases).
2. Run the installer and follow the setup wizard.
3. Launch FileSight from the Start menu or desktop shortcut.

**AppImage:**

```bash
chmod +x FileSight-*.AppImage
./FileSight-*.AppImage
```

**Debian/Ubuntu:**

```bash
sudo dpkg -i FileSight-*.deb
```

### Build from source

See [docs/INSTALLATION.md](docs/INSTALLATION.md#development-setup) for development setup instructions.

## Privacy

FileSight is designed with privacy as a core principle:

- All scanning and analysis happens **locally on your device**
- Files are **never uploaded or transmitted**
- No telemetry, tracking, or analytics
- No account creation required
- No cloud dependencies
- All data is stored in a local JSON file

## Technology

- **Frontend** — Next.js (React 19, TypeScript, Tailwind CSS 4)
- **Desktop** — Electron 43 (contextIsolation, no nodeIntegration)
- **State** — Zustand 5
- **Charts** — Recharts
- **Icons** — Lucide
- **UI** — Radix UI primitives
- **Testing** — Vitest (252+ tests)

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE) — see [LICENSE](./LICENSE) for details.

---
## Download

Get FileSight:
[Download Latest Release](https://github.com/MarkCoder1/filesight/releases/latest)

<p align="center">
  <sub>Built with Electron + Next.js. Runs entirely on your device.</sub>
</p>
