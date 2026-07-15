# Quickstart: Fix Sender Duplicate Download Bug

This guide documents the E2E verification scenarios to validate that only the designated recipient triggers a file download, and the sender does not experience any HTTP to HTTPS or download errors.

## Setup & Run

1. Start the server using the workspace runbook script:
   ```bash
   rtk npm start
   ```
2. Open two separate web browser sessions (Session A and Session B):
   - **Session A**: Open `http://localhost:3000` (represents Peer A / Sender).
   - **Session B**: Open `http://localhost:3000` in a private window or another browser (represents Peer B / Recipient).
3. Confirm that both peers appear on the other's dashboard.

## Validation Scenarios

### Scenario 1: Successful File Transfer (A -> B)

1. In **Session A**, click on **Peer B**.
2. Select a test file (e.g., `test.txt` under 5MB) and click **Send File**.
3. In **Session B**, click **Accept** on the incoming file confirmation modal.
4. Verify the following behavior:
   - On **Session A**: The progress bar completes at 100%. The modal remains open until the receiver finishes saving, then closes cleanly. **No file download is triggered, and no network/console errors are thrown**.
   - On **Session B**: The progress bar completes at 100%. The file is automatically downloaded and saved to the local file system.
5. Inspect the DevTools console of **Session A** to ensure no `Mixed Content` or `Failed to load resource` errors are present.

### Scenario 2: File Transfer Rejection

1. In **Session A**, select a file and send it to **Peer B**.
2. In **Session B**, click **Decline**.
3. Verify that the progress modal closes on both sessions and no download or error occurs.
