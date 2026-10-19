# Macroni — Project Summary & Architecture Guide

## Overview

**Macroni** is a minimal macOS desktop GUI for managing `crontab` jobs. Originally created 6 years ago as an Electron application using Webpack, Babel, and React 16, it has now been modernized into a fast desktop application powered by **Electrobun**, **Bun**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

The application allows users to:
1. Inspect system `crontab` jobs in a reactive sidebar with real-time search.
2. Create and edit jobs using frequency presets (*Minutely*, *Hourly*, *Nightly*, *Weekly*, *Monthly*, *Yearly*, *Custom*) and raw minute/hour/day/month/weekday fields.
3. Validate cron syntax live and copy generated expressions with one click.
4. Safely save, modify, or delete cron tasks from macOS system crontab.
5. Use native macOS application menus and keyboard shortcuts (`⌘N` for New Job, `⌘R` for Refresh, `⌘Q` for Quit).

---

## Migration History (Electron ➔ Electrobun)

### 1. Diagnostic Evaluation of Legacy Electron Build
- **Initial State:** 6-year-old boilerplate (`electron: 7.1.13`, `node-sass: 4.13.1`, `electron-rebuild: 1.10.0`).
- **Diagnosis:** Build failed as expected on modern hardware:
  - Electron 7.1.13 lacked `darwin-arm64` prebuilt binaries (Apple Silicon support was introduced in Electron 11+). GitHub returned HTTP 404 for the download.
  - Native modules (`node-sass 4.13.1`) were incompatible with Node.js v26.
  - The original Electron `package.json` was archived to `package.electron.json` for historical reference.

### 2. Migration to Electrobun
- **Git Branch:** Switched to branch `electrobun`.
- **Electrobun & Hutch Configuration:**
  - `electrobun.config.ts`: Configured metadata (`Macroni`, `com.owenmelbourne.Macroni`), native macOS window options, and asset mapping.
  - `hutch.config.ts`: Configured dev and stable build scripts.
  - `assets/appIcon.iconset`: Generated native macOS app icons from `resources/icon.icns`.
- **Bun Backend (`src/bun/`):**
  - `src/bun/cronService.ts`: Native cron service interacting with macOS system `crontab`.
  - `src/bun/index.ts`: Native `BrowserWindow` creation, macOS `ApplicationMenu` setup, and local API server on `127.0.0.1:38241`.
- **Modern Webview Frontend (`src/mainview/`):**
  - `src/mainview/App.tsx`: Responsive split-view layout with toast notifications.
  - `src/mainview/components/Sidebar.tsx`: Searchable list of cron tasks and "Create Job" trigger.
  - `src/mainview/components/CronBuilder.tsx`: Schedule builder with presets, validation, and copy utilities.
  - `src/mainview/components/Editor.tsx` & `src/mainview/components/Placeholder.tsx`: Form container and empty state view.
  - `src/mainview/styles.css`: Pure Tailwind CSS v4 styling.

---

## Verification & Build Results

- **TypeScript Typecheck:** `bunx tsc --noEmit --skipLibCheck` passed with 0 errors.
- **CSS Compilation:** Built with `@tailwindcss/cli` in ~35ms.
- **Development Build:** `bun run build` generated `build/dev-macos-arm64/Macroni-dev.app`.
- **Release Build:** `bunx electrobun build --env=stable` generated:
  - macOS DMG installer: `artifacts/macos-arm64-Macroni.dmg` (22 MB)
  - Production app bundle: `build/stable-macos-arm64/Macroni.app` (~67 MB)
  - Compressed update bundle: `artifacts/stable-macos-arm64-Macroni.app.tar.zst` (21 MB)
  - Update manifest: `artifacts/stable-macos-arm64-update.json`

---

## Key Commands

```bash
# Compile Tailwind CSS
bun run css

# Run in development mode with live reload
bun run dev

# Build the development application
bun run build

# Build the stable production release (creates DMG installer and update assets)
bun run css && bunx electrobun build --env=stable

# Install locally to /Applications
cp -rv ./build/stable-macos-arm64/Macroni.app /Applications/
```

---

## TODO: GitHub Release Workflow for Hutch & Electrobun

To automate production packaging and publish GitHub releases with over-the-air (OTA) updates on tag pushes (`v*`), configure `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version tag to release (e.g. v1.0.1)'
        required: false
        default: ''

permissions:
  contents: write

jobs:
  release:
    name: Build & Publish macOS Release
    runs-on: macos-14 # Apple Silicon M1/arm64 runner

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: |
          bun install --frozen-lockfile || bun install

      - name: Compile Tailwind CSS
        run: |
          bun run css

      - name: Package Electrobun stable app & generate update assets
        run: |
          npx electrobun build --env=stable

      - name: Ad-hoc code sign application bundle and DMG
        run: |
          codesign --force --deep -s - "./build/stable-macos-arm64/Macroni.app"
          for dmg in artifacts/*.dmg build/stable-macos-arm64/*.dmg; do
            if [ -f "$dmg" ]; then
              echo "Signing disk image: $dmg"
              codesign --force -s - "$dmg"
            fi
          done

      - name: Create ZIP archive of application bundle
        run: |
          cd build/stable-macos-arm64
          ditto -c -k --keepParent "Macroni.app" "../../artifacts/Macroni-macos-arm64.zip"
          cd ../..

      - name: Verify build artifacts
        run: |
          echo "=== Generated Artifacts ==="
          ls -lh artifacts/

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            artifacts/*
          tag_name: ${{ github.ref_type == 'tag' && github.ref_name || inputs.version }}
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Action Items for Release Automation:
- [ ] Create `.github/workflows/release.yml` with the workflow above.
- [ ] In `electrobun.config.ts`, configure `release.baseUrl` (e.g., `https://github.com/<owner>/Macroni/releases/latest/download`) to enable delta patches and automatic OTA updates.
- [ ] Add a version bump helper script (e.g. `scripts/release.ts`) to automate updating `package.json`, `electrobun.config.ts`, git committing, tagging, and pushing.
