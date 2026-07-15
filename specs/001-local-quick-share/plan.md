# Implementation Plan: Local Quick Share

**Branch**: `001-local-quick-share` | **Date**: 2026-07-01 | **Spec**: [spec.md](file:///home/azathoth/Workspace/Programming/loshare/specs/001-local-quick-share/spec.md)

**Input**: Feature specification from `/specs/001-local-quick-share/spec.md`

**Note**: This plan defines the zero-dependency technical architecture using Node.js Server-Sent Events (SSE) and HTML5 APIs.

## Summary
The goal is to build a simple, responsive, and completely offline web application that allows file and text sharing between PC and mobile devices connected to the same local Wi-Fi network. The solution will run on a single host machine serving a static page, and devices will communicate with it via standard HTTP requests and an SSE stream for real-time signaling, keeping the implementation simple and completely free of third-party package dependencies.

---

## Technical Context

**Language/Version**: JavaScript (Node.js v18+)

**Primary Dependencies**: None (vanilla standard library modules: `http`, `fs`, `path`, `os`, `crypto`)

**Storage**: Temporary local filesystem directory (`temp/` under repository root) for buffering file uploads

**Testing**: Node.js built-in test runner (`node:test`) and assertion library (`node:assert`)

**Target Platform**: Node.js host runtime; any modern mobile (iOS Safari, Android Chrome) or desktop browser

**Project Type**: Web application (unified single host serving frontend + api)

**Performance Goals**: Peer discovery < 3s, text transfer < 1.5s, file transfer rates matching local network bandwidth limits

**Constraints**: Completely offline local Wi-Fi operation (no internet required), maximum 100MB file transfer limit, no SSL/HTTPS context constraints (must work over HTTP for local IPs)

**Scale/Scope**: Small scale local network usage (<10 active devices concurrently)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Rationale / Verification |
|---|---|---|
| **I. Code Quality & Boringness** | PASS | Hand-rolled HTTP route handling and file streaming using pure Node.js APIs. No Express, no bundlers, no npm dependency chain. |
| **II. Strict Testing Standards** | PASS | High-level routes, name sanitization, and streaming buffers covered via native Node.js unit tests. |
| **III. UX Consistency & Polishing** | PASS | Fully responsive HTML5 layout designed using vanilla CSS HSL color palettes. Includes active transfer progress bars, device icon indicators, and clean alert dialogues. |
| **IV. Performance & Efficiency** | PASS | Files are piped directly from request streams to temporary disk storage and back to the receiver, maintaining memory overhead under 20MB. |
| **V. Simplicity & YAGNI** | PASS | No account registration, database storage, or external STUN/TURN servers required. Simple and self-contained. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-local-quick-share/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── api.md           # Phase 1 API specifications
```

### Source Code (repository root)

```text
src/
├── server.js            # Node.js backend server (HTTP & SSE routing)
└── public/              # Frontend static web assets
    ├── index.html       # Client interface HTML
    ├── style.css        # Responsive layouts and HSL styling
    └── app.js           # Client-side peer discovery and transfer coordination
tests/
├── unit/
    └── server.test.js   # Unit tests for route handlers and validators
```

**Structure Decision**: Option 2: Unified Node.js server containing backend endpoint logic and serving client assets from a static directory (`src/public/`). This matches the simplicity constraint and keeps deployment to a single command.

---

## Complexity Tracking

*No constitution violations present. No complex architectures or unnecessary layers defined.*
