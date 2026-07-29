# Privacy

FileSight is designed with a **local-first, privacy-by-design** architecture.

## No Data Collection

- All file scanning, analysis, and processing happens **exclusively on your device**.
- Files are **never uploaded, transmitted, or sent** to any external server or service.
- The application **does not make any outbound network requests**.
- No telemetry, analytics, crash reporting, or tracking of any kind is included.
- No account creation, registration, or login is required.

## No Dependencies on Cloud Services

- The application has zero cloud dependencies.
- All computation is performed locally using the device's CPU.
- No third-party APIs are called during normal operation.
- The only network-accessible code is the initial `npm install` of open-source dependencies.

## Data Storage

- All application data (scan history, settings, preferences) is stored in a **local JSON file** on your machine.
- The data file location follows your operating system's convention:
  - **macOS:** `~/Library/Application Support/filesight/database.json`
  - **Windows:** `%APPDATA%/filesight/database.json`
  - **Linux:** `~/.config/filesight/database.json`
- You can delete this file at any time to erase all history and settings.
- No data is stored remotely.

## File System Access

- FileSight only accesses directories and files that you explicitly select through the native folder picker dialog.
- The application does not scan or access files without your explicit action.
- When cleaning files, the application moves them to the system Trash/Recycle Bin — files are not permanently deleted without your confirmation.

## Permissions

- The application does not request any special system permissions beyond file read access to the folders you choose.
- No network permissions are required.
- No camera, microphone, or location access is requested.

## Updates

- Application updates are distributed through GitHub Releases.
- The application does not include an auto-updater that communicates with external servers.
- You control when and how to update by downloading new releases manually.

## Third-Party Dependencies

FileSight uses open-source third-party libraries (npm packages) that are listed in `package.json`. These libraries run locally and do not transmit data. Each library is subject to its own license and privacy practices.
