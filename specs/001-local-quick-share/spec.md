# Feature Specification: Local Quick Share

**Feature Branch**: `001-local-quick-share`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Build an simple web app that do quick share between phone or pc or vice versa in local network"

## Clarifications

### Session 2026-07-01
- Q: Meaning of project name 'loshare' → A: 'loshare' stands for 'local share'.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Device Discovery (Priority: P1)

A user opens the web app on a PC and a mobile phone connected to the same local network. Both devices immediately see each other listed on the screen with recognizable names (e.g., "Sleek Desktop", "Android Phone") without having to register or log in.

**Why this priority**: Peer discovery is the core foundation. Sharing cannot occur if devices cannot locate each other on the network.

**Independent Test**: Open the web application on two different devices connected to the same local Wi-Fi. Verify that both screens automatically update to show the other device.

**Acceptance Scenarios**:

1. **Given** two devices are connected to the same local network, **When** they open the web application, **Then** they MUST automatically detect and display each other's generated names on screen.
2. **Given** two connected devices, **When** one device closes the web page, **Then** it MUST be removed from the other device's active peer list within 3 seconds.

---

### User Story 2 - Quick File Sharing (Priority: P1)

A user wants to transfer a photo or a document from their phone to their PC. They tap the PC icon on their phone's screen, select the file, and tap send. The PC displays a confirmation dialog asking the user to accept the transfer. Upon acceptance, the file is transferred and saved to the PC.

**Why this priority**: File sharing is the primary user goal of this application.

**Independent Test**: Select a 5MB image on a phone, send it to a PC, accept the prompt on the PC, and verify the image downloads and is identical to the original.

**Acceptance Scenarios**:

1. **Given** a sender has selected a discovered peer, **When** they choose a file and initiate the transfer, **Then** the receiver MUST see a prompt showing the file name, size, and options to Accept or Decline.
2. **Given** the receiver clicks "Accept", **When** the transfer begins, **Then** both devices MUST display a real-time progress bar.
3. **Given** the transfer finishes successfully, **When** it completes, **Then** the file MUST automatically download to the receiver's default download location.

---

### User Story 3 - Quick Text/Link Sharing (Priority: P2)

A user wants to quickly share a website URL from their PC to their phone. They click on the phone icon on their PC screen, paste the link into a text field, and hit send. The link immediately appears on the phone screen with a convenient option to copy it to the clipboard.

**Why this priority**: High value for productivity and convenience without the overhead of file transfers.

**Independent Test**: Paste a text string on the PC, send it to the phone, verify the text appears on the phone, click "Copy", and paste it into another app to verify it is identical.

**Acceptance Scenarios**:

1. **Given** a sender has selected a discovered peer, **When** they submit a text snippet, **Then** the receiver MUST immediately see the text displayed on their screen.
2. **Given** a text snippet has been received, **When** the user taps the "Copy" button, **Then** the text MUST be copied to their device clipboard.

---

### Edge Cases

- **What happens when a network disconnection occurs mid-transfer?**
  If a device loses connectivity during a file transfer, the transfer session MUST immediately cancel, clean up partial data, and display a user-friendly error message (e.g., "Transfer failed: Connection lost").
- **How does the system handle files that are too large?**
  If a user attempts to select a file larger than 100MB, the application MUST block the transfer and show a message (e.g., "File exceeds the 100MB limit for local quick share").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically discover and list active devices connected to the same local network segment without requiring any user registration or authentication.
- **FR-002**: The system MUST assign a default recognizable name to each device (e.g., based on browser/device type) and allow users to customize their display name.
- **FR-003**: The system MUST require the receiver's explicit consent (Accept/Decline prompt) before starting any file or text transfer.
- **FR-004**: The system MUST display active transfer status including progress percentage, transfer speed indicator, and time remaining for file transfers.
- **FR-005**: The system MUST support sharing text/links and provide a copy-to-clipboard function on the receiving device.
- **FR-006**: The system MUST automatically trigger a browser download of the transferred file upon successful completion.
- **FR-007**: The system MUST operate completely offline, running entirely within the local network without requiring external internet access for peer discovery or signaling.

### Key Entities

- **Peer Device**: Represents an active device on the local network. Attributes include: connection ID, display name, device type (Mobile/Desktop), and status (Online/Offline).
- **Transfer Session**: Represents a data transfer between two peers. Attributes include: sender ID, receiver ID, payload type (File/Text), payload name, payload size, progress, and status (Pending/Transferring/Completed/Failed).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Discovery of active local devices MUST complete within 3 seconds of opening the web application.
- **SC-002**: Text/link sharing MUST display on the receiving device within 1.5 seconds of sending.
- **SC-003**: A 10MB file transfer MUST complete in under 5 seconds over a standard 100Mbps local network connection.
- **SC-004**: 100% of network interruptions or transfer failures MUST trigger a clear error message on both the sender and receiver screens within 2 seconds.

## Assumptions

- **A-001**: Participating devices are connected to the same local network segment (LAN or Wi-Fi) and local network traffic is not blocked by firewalls or AP isolation.
- **A-002**: Users access the application via modern web browsers that support standard Web API technologies.
- **A-003**: The maximum file transfer limit is set to 100MB to ensure smooth browser-based memory usage.
- **A-004**: No permanent file or user data is stored on a server; transfers are temporary and ephemeral.
