# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in FileSight, please report it privately by opening a security advisory on GitHub:

1. Go to the [Security Advisories](https://github.com/anomalyco/filesight/security/advisories) page.
2. Click **New draft security advisory**.
3. Provide a description of the issue and steps to reproduce.

Please do **not** report security vulnerabilities through public GitHub issues.

## Privacy Architecture

FileSight is designed with a local-only architecture:

- **All file scanning, analysis, and processing happens on your device.**
- Files are never uploaded, transmitted, or sent to any external service.
- No telemetry, analytics, or tracking of any kind is included.
- No account creation or registration is required.
- All application data (scan history, settings) is stored in a local JSON file on your machine.
- The application has no network permissions and does not make outbound HTTP requests.

## Scope

The following are considered out of scope:

- Vulnerabilities in third-party dependencies (report to the respective project)
- Operating system level security (permissions, sandboxing)
- Physical access attacks

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✓         |
