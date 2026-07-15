# API Contracts: Local Quick Share

This document defines the HTTP endpoints and Server-Sent Events (SSE) contracts exposed by the local sharing Node.js server.

---

## 1. Static Asset Delivery

### Server Frontend
Serves the single-page web app.
- **Method**: `GET`
- **Path**: `/`
- **Response**: `200 OK` (Content-Type: `text/html`)

---

## 2. Peer Discovery & Signaling (SSE)

### Real-time Event Stream
Establishes a unidirectional text event stream (SSE) for the client. The client remains connected to receive real-time updates.
- **Method**: `GET`
- **Path**: `/events`
- **Query Parameters**:
  - `id`: Unique device ID (UUID v4)
  - `name`: Chosen display name (e.g. "My Phone")
  - `deviceType`: Device category (`desktop` | `mobile` | `tablet`)
- **Headers**:
  - Accept: `text/event-stream`
  - Cache-Control: `no-cache`
  - Connection: `keep-alive`
- **Response Streams**:
  - **Connection Success**:
    ```sse
    event: connected
    data: {"message": "Event stream connected"}
    ```
  - **Peer List Broadcast**: Sent whenever a new peer joins or leaves.
    ```sse
    event: peers
    data: [{"id": "uuid-1", "name": "Sleek PC", "deviceType": "desktop", "ipAddress": "192.168.1.100"}, ...]
    ```
  - **Incoming Text**: Sent to a specific receiver when a peer shares text.
    ```sse
    event: text-incoming
    data: {"senderId": "uuid-1", "senderName": "Sleek PC", "text": "Hello World!"}
    ```
  - **Incoming File Request**: Sent to a specific receiver asking for permission to send a file.
    ```sse
    event: file-request
    data: {"transferId": "uuid-transfer", "senderId": "uuid-1", "senderName": "Sleek PC", "fileName": "photo.jpg", "fileSize": 1024000, "fileType": "image/jpeg"}
    ```
  - **Transfer Status Update**: Sent to both sender and receiver to synchronize progress.
    ```sse
    event: transfer-status
    data: {"transferId": "uuid-transfer", "status": "transferring" | "completed" | "failed", "progress": 45.0}
    ```

---

## 3. Communication Endpoints

### Heartbeat
Notifies the server that the device is still active.
- **Method**: `POST`
- **Path**: `/api/heartbeat`
- **Headers**:
  - Content-Type: `application/json`
- **Request Body**:
  ```json
  {
    "id": "uuid-device-id"
  }
  ```
- **Responses**:
  - `204 No Content`: Successful heartbeat registration
  - `404 Not Found`: Device not registered (requires reconnecting to `/events`)

---

### Send Text
Shares a text snippet/link with a specific peer.
- **Method**: `POST`
- **Path**: `/api/send-text`
- **Headers**:
  - Content-Type: `application/json`
- **Request Body**:
  ```json
  {
    "senderId": "uuid-sender-id",
    "receiverId": "uuid-receiver-id",
    "text": "https://example.com"
  }
  ```
- **Responses**:
  - `200 OK`: Text sent successfully
  - `400 Bad Request`: Missing fields or validation errors
  - `404 Not Found`: Target receiver is offline

---

### Initiate File Transfer Request
Initiates a file sharing request, alerting the receiver before actual bytes are uploaded.
- **Method**: `POST`
- **Path**: `/api/transfer/request`
- **Headers**:
  - Content-Type: `application/json`
- **Request Body**:
  ```json
  {
    "senderId": "uuid-sender-id",
    "receiverId": "uuid-receiver-id",
    "fileName": "document.pdf",
    "fileSize": 5242880,
    "fileType": "application/pdf"
  }
  ```
- **Responses**:
  - `200 OK`: Request delivered to recipient
    ```json
    {
      "transferId": "uuid-transfer-id"
    }
    ```
  - `400 Bad Request`: File size exceeds limits or invalid inputs
  - `404 Not Found`: Receiver not found

---

### Respond to File Transfer Request
Receiver accepts or declines the incoming file transfer.
- **Method**: `POST`
- **Path**: `/api/transfer/respond`
- **Headers**:
  - Content-Type: `application/json`
- **Request Body**:
  ```json
  {
    "transferId": "uuid-transfer-id",
    "response": "accept" | "decline"
  }
  ```
- **Responses**:
  - `200 OK`: Response recorded
  - `404 Not Found`: Transfer session not found

---

### Upload File Binary
The sender uploads the actual file data to the server if the receiver accepted the request.
- **Method**: `POST`
- **Path**: `/api/transfer/upload`
- **Query Parameters**:
  - `transferId`: Unique ID of the transfer session
- **Headers**:
  - Content-Type: `application/octet-stream`
- **Request Body**: Binary file payload (raw bytes)
- **Responses**:
  - `200 OK`: File uploaded and buffered on server
  - `400 Bad Request`: Transfer was not accepted or is invalid
  - `413 Payload Too Large`: Upload size exceeds 100MB
  - `500 Internal Server Error`: Disk write error

---

### Download File Binary
The receiver downloads the buffered file.
- **Method**: `GET`
- **Path**: `/api/transfer/download`
- **Query Parameters**:
  - `transferId`: Unique ID of the completed transfer
- **Response**:
  - `200 OK`: (Content-Type matches the file's mime type, e.g. `application/pdf`)
    - Headers include: `Content-Disposition: attachment; filename="document.pdf"`
  - `404 Not Found`: File or transfer ID not found or already deleted
