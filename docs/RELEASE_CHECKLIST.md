# Release Checklist

## Pre-release

- [ ] All 252+ tests pass (`npm test`)
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] Next.js build succeeds (`npm run build`)
- [ ] Electron build succeeds (`npm run build:electron`)
- [ ] Lint passes (`npm run lint` or equivalent)
- [ ] Version bumped in `package.json` (semver)
- [ ] CHANGELOG / release notes drafted

## App Icons & Assets

- [ ] `resources/icon.svg` — master vector icon
- [ ] `resources/icon-monochrome.svg` — monochrome variant (Linux taskbar)
- [ ] macOS icons generated (`iconset` → `icns`)
- [ ] Windows icons generated (`.ico`)
- [ ] Linux icons placed at standard paths
- [ ] App screenshot in `assets/screenshots/`
- [ ] Icon referenced in `electron-builder.yml`

## Electron Builder Config

- [ ] `appId` matches reverse-domain format
- [ ] macOS: `hardenedRuntime: true`, `gatekeeperAssess: false`
- [ ] macOS: signing certificate name set (or `identity: null` for CI)
- [ ] Windows: `target` includes `nsis` portable
- [ ] Linux: `target` includes `AppImage`, `deb`, `rpm`
- [ ] `files` glob includes all necessary assets
- [ ] `extraResources` includes any bundled binaries

## Cross-platform Testing

### macOS
- [ ] Fresh install from DMG
- [ ] Full scan of Downloads folder (1000+ files)
- [ ] Duplicate detection works
- [ ] Move to Trash works
- [ ] History persists across restart
- [ ] Onboarding shows on first launch
- [ ] Settings persist across restart
- [ ] Dark mode / light mode toggle
- [ ] Window title is "FileSight"

### Windows
- [ ] Fresh install from NSIS installer
- [ ] Scan, duplicates, trash all work
- [ ] No path separator issues (`\` vs `/`)

### Linux
- [ ] AppImage launches on Ubuntu 24.04
- [ ] deb installs and launches
- [ ] rpm installs and launches
- [ ] Icon displays in taskbar
- [ ] No sandbox/namespace issues

## Final Checks

- [ ] `README.md` is up to date
- [ ] `branding/guidelines.md` is up to date
- [ ] `docs/TESTING.md` is up to date
- [ ] No debug logs in console output
- [ ] No `.env` or secrets committed
- [ ] `.gitignore` covers build artifacts (`out/`, `.next/`, `dist/`)
- [ ] Electron `main` process has `title: 'FileSight'`
- [ ] Bundle size reviewed (`ANALYZE=true` build)
- [ ] Tag and create GitHub release with assets attached
