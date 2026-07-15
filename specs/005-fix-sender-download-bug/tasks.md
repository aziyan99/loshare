# Tasks: Fix Sender Duplicate Download Bug

**Input**: Design documents from `/specs/005-fix-sender-download-bug/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify project files exist and run existing tests via `npm test` using [package.json](file:///home/azathoth/Workspace/Programming/loshare/package.json) and [tests/unit/server.test.js](file:///home/azathoth/Workspace/Programming/loshare/tests/unit/server.test.js)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Verify SSE and static server setup are running correctly by checking [src/server.js](file:///home/azathoth/Workspace/Programming/loshare/src/server.js)

---

## Phase 3: User Story 1 - Restrict Download Trigger to Recipient (Priority: P1) 🎯 MVP

**Goal**: Restrict the file download trigger solely to the recipient client, preventing duplicate triggers and console errors on the sender.

**Independent Test**: Perform manual verification from [quickstart.md](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/quickstart.md) using two client windows, verifying B successfully downloads the file while A experiences no download or console errors.

### Implementation for User Story 1

- [x] T003 [US1] Inspect status === 'ready' handler block in [src/public/app.js](file:///home/azathoth/Workspace/Programming/loshare/src/public/app.js)
- [x] T004 [US1] Modify status === 'ready' check in [src/public/app.js](file:///home/azathoth/Workspace/Programming/loshare/src/public/app.js) to verify `incomingTransfersMeta[transferId]` exists before triggering download
- [x] T005 [US1] Handle sender-side UI for status === 'ready' in [src/public/app.js](file:///home/azathoth/Workspace/Programming/loshare/src/public/app.js) (modifying progress dialog/modal titles if needed)
- [x] T006 [US1] Run manual E2E scenario 1 from [quickstart.md](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/quickstart.md)

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates, final validations, and cleanups

- [x] T007 [P] Update project documentation in [README.md](file:///home/azathoth/Workspace/Programming/loshare/README.md)
- [x] T008 [P] Run the full Node.js unit test suite in [tests/unit/server.test.js](file:///home/azathoth/Workspace/Programming/loshare/tests/unit/server.test.js)
- [x] T009 Run [quickstart.md](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/quickstart.md) validation across all listed scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on User Story 1 completion

### Parallel Opportunities

- Documentation updates ([T007](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/tasks.md#T007)) and running backend unit tests ([T008](file:///home/azathoth/Workspace/Programming/loshare/specs/005-fix-sender-download-bug/tasks.md#T008)) can run in parallel with other implementation steps since they target separate files.

---

## Parallel Example: User Story 1

```bash
# Verify base code setup in parallel with checking server:
Task: "Verify project files exist and run existing tests"
Task: "Verify SSE and static server setup are running correctly"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run Scenario 1 to verify B downloads file while A triggers nothing and raises no errors.
5. Polish and run final unit tests in Phase 4.
