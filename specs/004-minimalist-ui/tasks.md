# Tasks: Minimalist UI Redesign & Insecure Download Fix

**Input**: Design documents from `/specs/004-minimalist-ui/`

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

**Purpose**: Establish baseline validation before modifying layouts

**⚠️ CRITICAL**: Code changes should not begin until this phase is complete

- [X] T002 Run current test suite to establish correct baseline in `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Ultra-Minimalist Layout (Priority: P1) 🎯 MVP

**Goal**: Transition visual styling to an ultra-minimalist style, removing all card borders, box-shadow rules, and colored header titles.

**Independent Test**: Load the web app in browser, verify header title is neutral dark, and check that containers/cards have no borders or drop shadows.

### Implementation for User Story 1

- [X] T003 [US1] Rewrite layout selectors in `src/public/style.css` to enforce a clean light mode with no card borders or shadows
- [X] T004 [US1] Remove gradient styling and badges around the title in `src/public/index.html`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Secure Blob Assembly (Priority: P1)

**Goal**: Fetch file stream payloads using `Blob` assembly and trigger save locally via object URLs, resolving insecure connection warnings.

**Independent Test**: Perform a file transfer, click Accept on recipient device, and verify it downloads successfully without browser blocks.

### Implementation for User Story 2

- [X] T005 [US2] Track incoming transfer filename metadata in `src/public/app.js`
- [X] T006 [US2] Re-implement client-side download handler to use fetch blob streams and object URLs in `src/public/app.js`

**Checkpoint**: User Story 1 and 2 should be fully functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: General updates and final validation

- [X] T007 Run unit tests to check for regressions in `package.json`
- [X] T008 [P] Update documentation for visual styling and blob transfers in `README.md`
- [X] T009 [P] Execute validation scenarios in `specs/004-minimalist-ui/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS User Story 1.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion.
- **Polish (Phase 5)**: Depends on all user stories completion.

### Within User Story 1

- Tasks `T003` and `T004` can run in parallel since they touch different files.

### Within User Story 2

- Task `T005` (metadata state tracking) is a prerequisite for `T006` (triggering download with name lookup).

### Parallel Opportunities

- `T008` and `T009` in Polish can run in parallel once implementation is complete.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (Minimalist UI Layout).
3. **STOP and VALIDATE**: Verify styling rendering in browser.
4. Complete Phase 4 (Secure Blob Downloads).
5. Apply Polish.
