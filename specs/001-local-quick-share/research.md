# Technical Research: Local Quick Share

## Decision: Technology Stack & Core Architecture

We will implement a lightweight, zero-dependency Node.js backend paired with a vanilla HTML5/JS/CSS frontend. The architecture is designed to operate completely offline in a local area network (such as a home Indihome Wi-Fi router).

- **Backend**: Node.js using only the built-in standard library modules (`http`, `fs`, `path`, `os`, `crypto`). No Express or other external packages.
- **Signaling & Real-Time Events**: Server-Sent Events (SSE) for real-time, unidirectional server-to-client push messages (peer status, transfer notifications). Standard HTTP `POST` for client-to-server messaging.
- **File Transfer**: Traditional HTTP Multipart/Binary `POST` upload and `GET` download streaming. Files are streamed directly to a temporary local folder on the host machine (`temp/`) and streamed out to the recipient to minimize memory consumption.
- **Frontend**: Single-page application using modern CSS (vanilla, custom properties, HSL colors, responsive layout) and vanilla JavaScript.

---

## Decisions & Rationale

### 1. Zero-Dependency Node.js Backend vs. Express/Socket.io
- **Decision**: Use only Node.js standard library.
- **Rationale**:
  - **Simplicity & Maintainability**: Standard Node.js `http` module is extremely robust and avoids versioning or audit vulnerabilities associated with third-party libraries.
  - **No Installation Required**: Enables the user to run the app immediately with `node src/server.js` without running `npm install` first.
  - **Footprint**: Keeps the project size under 1MB.

### 2. Server-Sent Events (SSE) + HTTP POST vs. WebSockets for Messaging
- **Decision**: Use Server-Sent Events for real-time signaling, and standard POST requests for sending.
- **Rationale**:
  - **Native Browser support**: SSE is natively supported by all modern browsers (including mobile Safari and Chrome) and is easier to implement using standard HTTP streams.
  - **No external library**: WebSockets require `ws` on the backend, whereas SSE runs natively on Node's `http` response object.
  - **Reliability**: SSE handles connection dropouts and automatic reconnection natively.

### 3. Server-Buffered Local Transfer vs. WebRTC Peer-to-Peer
- **Decision**: Stream files through a temporary folder on the local server.
- **Rationale**:
  - **Compatibility**: WebRTC requires complex signaling, secure contexts (HTTPS), and often fails on local Wi-Fi networks if AP isolation or symmetric NATs are present. Since we run locally over HTTP (no SSL/HTTPS by default on local IPs), WebRTC APIs are often blocked or restricted in browsers.
  - **Robustness**: HTTP upload/download works 100% of the time on any local Wi-Fi connection, including Indihome networks, without requiring local SSL certs or facing ICE candidate failures.
  - **Memory Efficiency**: Node.js streams allow the file data to pipe directly from the request stream to disk, and then from disk to the recipient client, maintaining an extremely low memory footprint (<20MB) even for 100MB files.

---

## Alternatives Considered

### Socket.io / WebSockets
- **Evaluated**: Using a WebSocket library (like Socket.io or `ws`) to handle bidirectional messaging.
- **Why Rejected**: Requires adding external npm dependencies. Standard SSE provides the exact same real-time signaling capabilities with zero external dependencies.

### WebRTC P2P Transfer (Direct Peer-to-Peer)
- **Evaluated**: Connecting the two browsers directly via WebRTC data channels to send files directly between PC and Phone.
- **Why Rejected**: Browser security rules restrict WebRTC features on non-secure origins (HTTP). Setting up local HTTPS/SSL certificates (e.g. self-signed or Let's Encrypt) is complex and unfriendly for a "simple local web app". Furthermore, local Wi-Fi routers (like Indihome) often have firewall settings that block direct peer connection protocols, whereas local HTTP traffic to a single host is always permitted.
