# Tasks: Fix Send File Button Bug & UI Simplification

**Input**: Design documents from `/specs/002-fix-send-file-btn/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Running the unit test suite ensures that no backend regressions occur during styling and client code adjustments.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume standard unified Node.js project structure: `src/` for source files, `src/public/` for frontend assets, and `tests/unit/` for tests.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation checks

- [X] T001 Verify project directories and git branch configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish baseline validation before modifying frontend layouts

**⚠️ CRITICAL**: Code changes should not begin until this phase is complete

- [X] T002 Run current test suite to establish correct baseline in `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - App JS Load Verification & UI Simplification (Priority: P1) 🎯 MVP

**Goal**: Resolve selector mismatch causing JS TypeError and transition styling from dark glassmorphic layout to a straightforward, clean light mode layout with minimal CSS.

**Independent Test**: Load the web app in browser, open developer tools, inspect console to confirm 0 TypeErrors. Confirm the interface displays a clean light theme. Select a target peer/file, click **Send File**, and verify the transfer dialog opens successfully.

### Implementation for User Story 1

- [X] T003 [US1] Correct DOM selector ID from `sendFileBtn` to `send-file-btn` in `src/public/app.js`
- [X] T004 [US1] Rewrite styling rules to simple light-mode with minimal CSS in `src/public/style.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: General updates and final validation

- [X] T005 Run unit tests to check for regressions in `package.json`
- [X] T006 [P] Update documentation for visual styling in `README.md`
- [X] T007 [P] Execute validation scenarios in `specs/002-fix-send-file-btn/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS User Story 1.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **Polish (Phase 4)**: Depends on User Story 1 completion.

### Within User Story 1

- JS selector correction (`T003`) and CSS simplification (`T004`) can run in parallel since they touch different files.

### Parallel Opportunities

- `T006` and `T007` in Polish can run in parallel once the core implementation completes.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Fix selector binding in `src/public/app.js` (`T003`).
3. Simplify stylesheet in `src/public/style.css` (`T004`).
4. **STOP and VALIDATE**: Test load and UI display in browser.
5. Apply Polish (documentation and test runs).
