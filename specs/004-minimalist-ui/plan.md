# Implementation Plan: Minimalist UI Redesign & Insecure Download Fix

**Branch**: `004-minimalist-ui` | **Date**: 2026-07-01 | **Spec**: [spec.md](file:///home/azathoth/Workspace/Programming/loshare/specs/004-minimalist-ui/spec.md)

**Input**: Feature specification from `/specs/004-minimalist-ui/spec.md`

## Summary
The goal is to implement two key client-side changes:
1. **Insecure Download Fix**: Resolve browser-level mixed-content blocks when downloading files over insecure local HTTP. Instead of direct `window.location.href` navigation, files will be retrieved asynchronously via `fetch` as `Blob`s and saved using local object URLs.
2. **Minimalist UI Redesign**: Transition the visual layout to an ultra-minimalist style, removing all card borders, box-shadow rules, and colored header titles, relying strictly on spacing and neutral typography.

## Technical Context

**Language/Version**: JavaScript (ESM, Node.js v18+)

**Primary Dependencies**: None (Vanilla client-side JS/HTML/CSS, Node.js standard libraries for backend)

**Storage**: Local storage (device identity), filesystem `temp/` folder (server buffer), browser memory (client blob buffer)

**Testing**: Node.js native test runner (`node --test`)

**Target Platform**: Mobile (iOS Safari, Android Chrome) and Desktop (Chrome, Safari, Firefox) browsers

**Project Type**: Web Application

**Performance Goals**: 0 insecure download warning browser console logs, responsive styling, stable memory utilization for file downloads <=100MB

**Constraints**: Ultra-minimalist layout, light mode, minimal CSS, 100MB file limit (browser memory constraint)

**Scale/Scope**: Client-side downloader mechanism, layout CSS style adjustments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Boringness**: PASS. Fetching a file as a blob, generating a local object URL, and removing card borders/shadows is standard and boring.
- **Strict Testing Standards**: PASS. The backend unit tests will continue to pass. The client-side load is verified error-free.
- **UX Consistency & Polishing**: PASS. We are redesigning the visual style to a simplified minimalist light mode. It must look clean, straightforward, and have no visual glitches.
- **Performance & Efficiency**: PASS. Reducing CSS rules and removing glassmorphic overlays reduces browser paint/layout load.
- **Simplicity & YAGNI**: PASS. Deleting dark mode code and bloated glassmorphic shadows directly aligns with YAGNI and the user's explicit request.

## Project Structure

### Documentation (this feature)

```text
specs/004-minimalist-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (generated separately)
```

### Source Code (repository root)

```text
src/
├── public/
│   ├── index.html       # HTML Layout
│   ├── style.css        # Minimalist light-mode stylesheet
│   └── app.js           # Client logic with blob-assembly download
└── server.js            # Offline Node.js backend
```

**Structure Decision**: Option 1 (Single project), maintaining the active project directories.

## Complexity Tracking

*No violations identified.*
