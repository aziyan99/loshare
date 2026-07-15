# Implementation Plan: Fix Sender Duplicate Download Bug

**Branch**: `005-fix-sender-download-bug` | **Date**: 2026-07-02 | **Spec**: [spec.md](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/spec.md)

**Input**: Feature specification from `/specs/005-fix-sender-download-bug/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The primary requirement is to resolve a critical bug where both the sender (Peer A) and the receiver (Peer B) trigger a download call upon completed file transfers, leading to duplicate triggers and HTTP-to-HTTPS/not-found errors on the sender. The technical approach isolates the download trigger to only the receiver by validating the presence of client-side metadata in `incomingTransfersMeta[transferId]`.

## Technical Context

**Language/Version**: JavaScript (ESM, Node.js v18+, Browser vanilla JS)

**Primary Dependencies**: None

**Storage**: Local temporary directory (`temp/` on server), local storage / memory states (`incomingTransfersMeta` on client)

**Testing**: Node.js native assert / test runner

**Target Platform**: Linux server, modern desktop and mobile browsers

**Project Type**: web-service (Node.js backend) + vanilla frontend client app

**Performance Goals**: Latency < 200ms p95 for API endpoints, direct streaming overhead minimal

**Constraints**: Zero-dependency frontend and backend, offline-capable local utility

**Scale/Scope**: Direct peer-to-peer file transfers up to 100MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate I (Code Quality & Boringness)**: **Pass**. The solution leverages existing client-side variables and maps. No external libraries or complex patterns are added.
- **Gate II (Strict Testing Standards)**: **Pass**. Local testing scenario defined in quickstart. Any backend test suites remain fully intact.
- **Gate III (UX Consistency & Polishing)**: **Pass**. Modals close cleanly on both sides on completion, avoiding hanging states.
- **Gate IV (Performance & Efficiency)**: **Pass**. Eliminates the duplicate network download call from the sender, reducing server load and socket exhaustion.
- **Gate V (Simplicity & YAGNI)**: **Pass**. Minimal code modifications targeting only the affected EventSource trigger block.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-sender-download-bug/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── contracts/           # Phase 1 output (/speckit-plan command)
    └── api_changes.md
```

### Source Code (repository root)

```text
src/
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
└── server.js

tests/
└── unit/
    └── server.test.js
```

**Structure Decision**: Single-project structure. Changes are strictly scoped to [app.js](file:///home/azathoth/Workspace/Programming/loshare/src/public/app.js).

## Complexity Tracking

No constitution violations detected.
