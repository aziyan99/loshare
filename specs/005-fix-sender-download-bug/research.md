# Research: Fix Sender Duplicate Download Bug

## Technical Decision

We will modify the frontend EventSource listener in `src/public/app.js` to restrict the download trigger for `status === 'ready'` transfers solely to the recipient. We do this by checking if the client has transfer metadata registered in the local `incomingTransfersMeta` map for the matching `transferId`.

## Rationale

- **Leveraging Pre-existing State**: The recipient browser registers incoming metadata in the `incomingTransfersMeta[transferId]` map during the `file-request` SSE event. The sender browser does not. Checking if this entry exists is a clean, client-side, zero-additional-overhead solution.
- **Alignment with Constitution**:
  - **Principle I (Boringness & Standard Library)**: No new external libraries, custom signaling protocols, or complex state machinery are introduced.
  - **Principle V (Simplicity & YAGNI)**: Avoids modifying the server-side code or altering the SSE payload structure, keeping changes localized and minimal.

## Alternatives Considered

### Alternative A: Include client role in the SSE status update payload
- **Description**: Modify the server-side SSE event broadcast to explicitly include whether the target client is the `'sender'` or `'receiver'` for the transfer status message.
- **Why Rejected**: This requires changing the SSE broadcast structure in `src/server.js` and updating the parsing code in `app.js`. It adds unnecessary boilerplate and complexity when the client already possesses the required state locally.

### Alternative B: Clear `currentTransferId` on the sender immediately after upload completes
- **Description**: Clear the `currentTransferId` on the sender client as soon as `startBinaryUpload` finishes or gets a 200 response.
- **Why Rejected**: If `currentTransferId` is cleared prematurely, the sender's client will ignore the subsequent `ready`, `completed`, and `failed` SSE events, meaning the progress modal will remain open or fail to transition correctly, violating UX Principle III.
