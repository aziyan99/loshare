# Tasks: Local Quick Share

**Input**: Design documents from `/specs/001-local-quick-share/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Node.js native unit tests are included for backend route handlers and streams.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume standard unified Node.js project structure: `src/` for source files, `src/public/` for frontend assets, and `tests/unit/` for tests.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with directories `src/`, `src/public/`, and `tests/unit/`
- [X] T002 Initialize Node.js project configuration file `package.json` with ESM module configuration and startup scripts
- [X] T003 [P] Configure basic formatting/linting scripts in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core HTTP server and file stream infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Implement basic HTTP server listener and static file serving routes in `src/server.js`
- [X] T005 Setup Server-Sent Events (SSE) stream registry route on `/events` in `src/server.js`
- [X] T006 Create local temporary directory checks and automatic startup cleanup for `temp/` folder in `src/server.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time Device Discovery (Priority: P1) 🎯 MVP

**Goal**: Allow devices on the local network to automatically discover each other in real-time when opening the web app.

**Independent Test**: Start the server and open the web page on a PC and a mobile phone connected to the same Wi-Fi. Verify that both screens display each other's automatically assigned names without logging in.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Create unit tests for peer connection and heartbeat routes in `tests/unit/server.test.js`

### Implementation for User Story 1

- [X] T008 [P] [US1] Create basic HTML viewport layout and peer list containers in `src/public/index.html`
- [X] T009 [P] [US1] Add custom-property-based responsive HSL CSS styling for desktop/mobile views in `src/public/style.css`
- [X] T010 [P] [US1] Implement client-side SSE connection handler, name customization, and heartbeat loop in `src/public/app.js`
- [X] T011 [US1] Implement backend SSE peer registration and heartbeat route `/api/heartbeat` in `src/server.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Quick File Sharing (Priority: P1) 🎯 MVP

**Goal**: Enable users to select, request permission, upload (via binary streams to disk), download, and track the progress of files up to 100MB between peers.

**Independent Test**: Connect two devices, select a 5MB image on one, send it to the other, click Accept, and verify the file successfully downloads and remains intact.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US2] Create unit tests for upload limits, download response headers, and stream parsing in `tests/unit/server.test.js`

### Implementation for User Story 2

- [X] T013 [P] [US2] Add file share buttons, file input dropzones, and prompt modals in `src/public/index.html` and `src/public/style.css`
- [X] T014 [P] [US2] Implement client-side file selection, transfer request dispatch to `/api/transfer/request`, and prompt response handler in `src/public/app.js`
- [X] T015 [US2] Implement backend endpoints for `/api/transfer/request` and `/api/transfer/respond` to manage transfer sessions in `src/server.js`
- [X] T016 [US2] Implement upload route `/api/transfer/upload` that pipes raw body binary payload directly into the temporary `temp/` folder in `src/server.js`
- [X] T017 [US2] Implement download route `/api/transfer/download` that streams the buffered file to the client and deletes it on completion in `src/server.js`
- [X] T018 [US2] Integrate client-side upload/download progress indicators and real-time SSE updates in `src/public/app.js`

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Quick Text/Link Sharing (Priority: P2)

**Goal**: Allow users to share text links and snippets instantly, which automatically copy to the receiver's clipboard.

**Independent Test**: Select a peer, type a link in the share box, send it, and verify the receiver sees the text and can copy it successfully.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T019 [P] [US3] Create unit tests for text payload validation and SSE dispatch routing in `tests/unit/server.test.js`

### Implementation for User Story 3

- [X] T020 [P] [US3] Add text input boxes and Copy to Clipboard buttons in `src/public/index.html` and `src/public/style.css`
- [X] T021 [P] [US3] Implement client-side text send handler and SSE text listener with clipboard fallback in `src/public/app.js`
- [X] T022 [US3] Implement backend route `/api/send-text` to validate and broadcast the message via SSE in `src/server.js`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: General user experience improvements and final validation.

- [X] T023 Implement client-side connection recovery banners and automatic SSE reconnect attempts in `src/public/app.js`
- [X] T024 Polish CSS visual states (active button status, transition animations, and loading spinners) in `src/public/style.css`
- [X] T025 Add documentation for local hosting, IP address binding, and port configuration in `README.md`
- [X] T026 Execute and verify all validation scenarios in `specs/001-local-quick-share/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (Discovery) MUST complete before User Story 2 (File Share) and User Story 3 (Text Share) since transfers depend on having discovered peers.
  - User Story 2 and 3 can proceed in parallel or sequentially.
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Depends on User Story 1 (Discovery)
- **User Story 3 (P2)**: Depends on User Story 1 (Discovery)

### Within Each User Story

- Tests MUST be written and fail before implementation.
- UI elements before client scripts.
- Client scripts and endpoints before final integration and progress bars.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- Frontend styling (`T008`, `T009`) and tests (`T007`) for User Story 1 can run in parallel.
- UI setup (`T013`) and tests (`T012`) for User Story 2 can run in parallel.
- UI setup (`T020`) and tests (`T019`) for User Story 3 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch test and HTML template preparation in parallel:
Task: "T007 [P] [US1] Create unit tests for peer connection and heartbeat routes in tests/unit/server.test.js"
Task: "T008 [P] [US1] Create basic HTML viewport layout and peer list containers in src/public/index.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1 (Discovery).
4. Complete Phase 4: User Story 2 (File Sharing).
5. **STOP and VALIDATE**: Verify that discovery and file transfers work end-to-end between PC and phone.

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready.
2. Add User Story 1 -> Test device list -> Demo.
3. Add User Story 2 -> Test file streaming -> Demo (MVP!).
4. Add User Story 3 -> Test text/link copying -> Demo.
5. Apply Polish.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently testable.
- Commit after each task or logical group.
- Avoid vague descriptions.
