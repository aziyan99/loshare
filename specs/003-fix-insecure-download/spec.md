# Feature Specification: Fix Insecure Download Bug

**Feature Branch**: `003-fix-insecure-download`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "got new bug 'The file at 'http://192.168.1.13:3000/api/transfer/download?transferId=8238cbf8-486e-467f-9073-e592444483af' was loaded over an insecure connection. This file should be served over HTTPS.'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Blob Assembly (Priority: P1)

A recipient device accepts an incoming file. The browser streams the payload using an in-memory blob assembly method, triggering a local file save without triggering browser warnings or blocks regarding insecure HTTP downloads.

**Why this priority**: Essential MVP functionality. Modern browsers block direct file download location navigations over insecure HTTP connections, preventing users from receiving shared files.

**Independent Test**: Complete a file transfer between two local devices and verify that the file is downloaded to the target device without triggering any insecure connection warnings or browser blocks.

**Acceptance Scenarios**:

1. **Given** a peer has accepted an incoming file transfer, **When** the transfer status transitions to `ready`, **Then** the client browser MUST fetch the payload as a blob and save it locally under its original name and extension.
2. **Given** the download is completed, **When** the file is opened, **Then** the integrity and content of the file MUST match the original sender payload.

---

### Edge Cases

- **Large file downloads near the 100MB threshold**:
  Memory utilization on mobile devices must remain stable during blob creation. The system caps local transfers at 100MB, which fits within browser memory boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The client MUST fetch the file stream asynchronously using `fetch()` and convert the response to a `Blob`.
- **FR-002**: The client MUST trigger the file download locally by creating an object URL (`URL.createObjectURL(blob)`) and simulating a click on a temporary `<a>` element.
- **FR-003**: The client MUST store metadata of active incoming transfers in order to preserve the correct filename on local download creation.

### Key Entities

- **Blob Object URL**: A temporary client-side reference to the file payload buffered in browser memory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of file downloads MUST be processed without insecure HTTP browser blocking errors.
- **SC-002**: The generated file downloads MUST preserve original file name structures and extensions in 100% of cases.

## Assumptions

- **A-001**: Browser environments hosting the application have sufficient memory to buffer files up to 100MB.
