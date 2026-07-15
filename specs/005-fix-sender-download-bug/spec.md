# Feature Specification: Fix Sender Duplicate Download Bug

**Feature Branch**: `005-fix-sender-download-bug`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "We have one bug, when the transfer completed, A -> B, B downloaded the file successfully, after that somehow it is download the file in A and error HTTP to HTTPS"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Correct File Delivery and Recipient Download (Priority: P1)

As a user sending a file (User A) to another device (User B), when User B accepts the file, the file should transfer, User B should successfully download it, and User A should not trigger any file download or experience network security errors.

**Why this priority**: This is the core functionality. Sender should only upload, not download.

**Independent Test**: Set up a transfer from A to B. Verify B gets the download trigger and downloads the file. Verify A's browser does not download anything and has no HTTP/HTTPS mixed content or redirect errors in the console.

**Acceptance Scenarios**:

1. **Given** a registered peer A (sender) and B (recipient) on the same local network, **When** A sends a file to B and B accepts it, **Then** the progress bar updates on both A and B, B downloads the file, and A does not attempt to download the file.
2. **Given** a finished file download on B, **When** the server terminates the transfer and deletes the temp file, **Then** both A and B's transfer progress modals are closed automatically and no error alert/toast is shown to either user.

---

### Edge Cases

- What happens when the receiver declines the transfer?
  - The modal should close on both sides and no download is triggered.
- What happens if the sender is disconnected during transfer?
  - The transfer fails, showing an error on the receiver's end, and no download is triggered on either end.
- What happens when the download fails or times out on the receiver?
  - The receiver shows a failure alert, and the sender is notified (or the transfer terminates gracefully), without triggering any download on the sender.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST restrict the automated file download trigger (triggered by the `ready` transfer status) to only the designated receiver peer of the transfer.
- **FR-002**: The sender peer MUST NOT request or trigger the file download from `/api/transfer/download` upon completion of the upload.
- **FR-003**: The system MUST keep the sender's transfer modal open showing the correct completion status or progress until the overall transfer state transitions to `completed` or `failed`.
- **FR-004**: The system MUST NOT show network/HTTP errors on the sender's device due to trying to download a non-existent or deleted temporary file.

### Key Entities *(include if feature involves data)*

- **Transfer Session**: Represents the state of the active file transfer, including `transferId`, `senderId`, `receiverId`, `fileName`, `fileSize`, `fileType`, `status` (pending, transferring, ready, completed, failed), and progress.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of file transfers successfully trigger a file download ONLY on the recipient browser.
- **SC-002**: The sender browser triggers 0 file download requests and raises 0 console errors (including mixed content/protocol errors) upon transfer completion.
- **SC-003**: The progress modal on both sides closes cleanly and is completely removed from the screen upon transfer completion or failure.

## Assumptions

- The browser local storage contains unique peer IDs and names for each peer.
- The server has access to a writable temp directory for buffering transfer payloads.
- The client connection uses SSE for real-time signaling.
