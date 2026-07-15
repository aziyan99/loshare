# Feature Specification: Minimalist UI Redesign & Insecure Download Fix

**Feature Branch**: `004-minimalist-ui`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User descriptions:
1. "rethink the design, make it really minimalis, no need to be fancy border or shadow or colored blue title"
2. "got new bug 'The file at 'http://192.168.1.13:3000/api/transfer/download?transferId=8238cbf8-486e-467f-9073-e592444483af' was loaded over an insecure connection. This file should be served over HTTPS.'"

## Clarifications

### Session 2026-07-01
- Q: Merging active features → A: The insecure download bug fix and the minimalist visual layout redesign are merged into a single feature stream.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ultra-Minimalist Layout (Priority: P1)

A user opens the application on their PC or phone. The visual layout is extremely simple and clean. There are no box shadows, no card borders, and the main title is styled in standard primary text color (black/dark gray) rather than a colored blue gradient. The layout relies on clean white space, padding, and subtle background shading for structure.

**Why this priority**: Essential visual constraint. The user requested to strip down styling to a truly minimalist form.

**Independent Test**: Load the web app in a browser and visually inspect the page to verify that card borders, box shadows, and colored titles are removed.

**Acceptance Scenarios**:

1. **Given** the app main page is loaded, **When** rendering the header, **Then** the title MUST be rendered in a standard dark font color matching the primary body text color scheme.
2. **Given** the active peer grid and identity cards are visible, **When** inspecting their visual layout, **Then** there MUST be no borders or card box shadows.

### User Story 2 - Secure Blob Assembly (Priority: P1)

A recipient device accepts an incoming file. The browser streams the payload using an in-memory blob assembly method, triggering a local file save without triggering browser warnings or blocks regarding insecure HTTP downloads.

**Why this priority**: Essential functional MVP path. Modern browsers block direct file download location navigations over insecure HTTP connections, preventing users from receiving shared files.

**Independent Test**: Complete a file transfer between two local devices and verify that the file is downloaded to the target device without triggering any insecure connection warnings or browser blocks.

**Acceptance Scenarios**:

1. **Given** a peer has accepted an incoming file transfer, **When** the transfer status transitions to `ready`, **Then** the client browser MUST fetch the payload as a blob and save it locally under its original name and extension.
2. **Given** the download is completed, **When** the file is opened, **Then** the integrity and content of the file MUST match the original sender payload.

---

### Edge Cases

- **Interactive focus indicator**:
  Focus indicator outlines on inputs (e.g., identity name input, textareas) MUST remain visible to ensure standard accessibility guidelines are followed.
- **Large file downloads near the 100MB threshold**:
  Memory utilization on mobile devices must remain stable during blob creation. The system caps local transfers at 100MB, which fits within browser memory boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the primary logo title `loshare` in standard primary text color (e.g., `#0f172a` in light mode), removing blue gradients or colors.
- **FR-002**: Container layout boxes (identity setup and peer grid panels) MUST NOT have card borders (`border: none`) or shadows (`box-shadow: none`).
- **FR-003**: The UI layout MUST use margin and padding spacing instead of lines or borders to separate content containers.
- **FR-004**: The client MUST fetch the file stream asynchronously using `fetch()` and convert the response to a `Blob`.
- **FR-005**: The client MUST trigger the file download locally by creating an object URL (`URL.createObjectURL(blob)`) and simulating a click on a temporary `<a>` element.
- **FR-006**: The client MUST store metadata of active incoming transfers in order to preserve the correct filename on local download creation.

### Key Entities

- **Styling Rules**: Defines the visual constraints applied to the DOM tree nodes.
- **Blob Object URL**: A temporary client-side reference to the file payload buffered in browser memory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of container cards MUST have zero borders and zero drop shadows.
- **SC-002**: The primary text scheme MUST use a single neutral dark color for titles.
- **SC-003**: 100% of file downloads MUST be processed without insecure HTTP browser blocking errors.
- **SC-004**: The generated file downloads MUST preserve original file name structures and extensions in 100% of cases.

## Assumptions

- **A-001**: Input elements (e.g. text fields and buttons) retain subtle boundary shapes to preserve basic usability.
- **A-002**: Browser environments hosting the application have sufficient memory to buffer files up to 100MB.
