# Implementation Plan: Fix Send File Button Bug & UI Simplification

**Branch**: `002-fix-send-file-btn` | **Date**: 2026-07-01 | **Spec**: [spec.md](file:///home/azathoth/Workspace/Programming/loshare/specs/002-fix-send-file-btn/spec.md)

**Input**: Feature specification from `/specs/002-fix-send-file-btn/spec.md`

## Summary
The goal is to correct the runtime JavaScript `TypeError` caused by a selector ID mismatch in `src/public/app.js` (referencing `sendFileBtn` instead of `send-file-btn`). Additionally, in accordance with user clarifications, the design system will be simplified from the dark glassmorphic layout to a straightforward, clean light mode layout utilizing minimal CSS.

## Technical Context

**Language/Version**: JavaScript (ESM, Node.js v18+)

**Primary Dependencies**: None (Vanilla client-side JS/HTML/CSS, Node.js standard libraries for backend)

**Storage**: Local storage (device identity), filesystem `temp/` folder (temporary file buffering)

**Testing**: Node.js native test runner (`node --test`)

**Target Platform**: Mobile (iOS Safari, Android Chrome) and Desktop (Chrome, Safari, Firefox) browsers

**Project Type**: Web Application

**Performance Goals**: 0 console errors, instant load times, zero render latency on discovery grid updates

**Constraints**: Simple straightforward layout, light mode, minimal CSS rules

**Scale/Scope**: Standard DOM interaction binding, single stylesheet simplification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Boringness**: PASS. Fixing a DOM selector name and replacing CSS variables/rules with clean, simple rules is standard and boring.
- **Strict Testing Standards**: PASS. The backend unit tests will continue to pass. The client-side load is verified error-free.
- **UX Consistency & Polishing**: PASS. We are redesigning the visual style to a simplified light mode. It must look clean, straightforward, and have no visual glitches.
- **Performance & Efficiency**: PASS. Reducing CSS rules and removing glassmorphic overlays reduces browser paint/layout load.
- **Simplicity & YAGNI**: PASS. Deleting dark mode code and bloated glassmorphic shadows directly aligns with YAGNI and the user's explicit request.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-send-file-btn/
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
│   ├── style.css        # Minimal CSS light-mode stylesheet
│   └── app.js           # Client logic with corrected selector
└── server.js            # Offline Node.js backend
```

**Structure Decision**: Option 1 (Single project), maintaining the active project directories.

## Complexity Tracking

*No violations identified.*
