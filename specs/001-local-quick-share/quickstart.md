# Quickstart Validation Guide: Local Quick Share

This guide provides step-by-step instructions to validate that the Local Quick Share implementation is correct and functional.

---

## Prerequisites
- Node.js runtime installed (v18.0.0 or higher)
- A local network connection (Wi-Fi or Ethernet) where devices can reach each other via IP address (no AP isolation enabled).
- At least two devices connected to the same network (e.g. a PC and a mobile phone).

---

## Setup & Running the Server

Since this project has **zero external dependencies** and uses only the Node.js standard library, no package installations are required.

1. **Start the local server**:
   From the repository root, execute:
   ```bash
   node src/server.js
   ```
   *The server will start and print its listening port and local IP address (e.g., `http://192.168.1.15:3000`).*

---

## E2E Validation Scenarios

### Scenario 1: Device Discovery
1. Open a browser tab on the host PC and navigate to `http://localhost:3000`.
2. Open a mobile browser on a phone connected to the same Wi-Fi, and navigate to the IP address outputted by the server (e.g., `http://192.168.1.15:3000`).
3. **Verify**: Both screens should update automatically to display the other peer's auto-generated name (e.g. "Windows Desktop" and "iPhone Mobile").

---

### Scenario 2: Text Snippet Share
1. On the PC, click/tap the phone icon in the peer list.
2. In the share input area, type a text message or a link (e.g., `https://google.com`).
3. Press **Send**.
4. **Verify**:
   - The phone screen instantly displays the incoming text message.
   - Tap **Copy** on the phone, and verify that the text is copied to the clipboard.

---

### Scenario 3: File Transfer
1. On the phone, select the PC from the active peer list.
2. Choose a file (e.g. a small photo, <10MB) and tap **Send File**.
3. **Verify**:
   - The PC immediately displays a modal dialog asking to **Accept** or **Decline** a file named `photo.jpg` of size `X KB` from the phone.
4. Click **Accept** on the PC.
5. **Verify**:
   - Real-time progress bars update on both devices.
   - Upon completion, the file is automatically downloaded to the PC's default browser downloads folder.
   - The temporary buffered file in the server's `temp/` folder is automatically deleted.

---

## Running Automated Tests

To run the unit tests written for server route handling and helper functions:
```bash
node --test tests/unit/
```
Verify that all unit tests pass with `ok` status.
