# loshare (local share)

A simple, lightweight, and completely offline web application for quick-sharing files and text links between your phone, PC, and other devices connected to the same local network (Wi-Fi or LAN).

Designed with zero external npm dependencies, running entirely on the Node.js standard library.

---

## Features
- **Real-time Device Discovery**: Open the app on any device on your Wi-Fi network and see other devices instantly. No accounts, login, or internet required.
- **Direct File Streaming**: Share files up to 100MB directly. Bytes are piped dynamically from the sender to the server and downloaded securely via client-side Blob assembly ONLY on the recipient device, preventing duplicate triggers and insecure browser warnings.
- **Quick Text & Link Copying**: Share URLs or notes instantly. Clipboard copy fallbacks are supported on receiving devices.
- **Ultra-Minimalist Light UI**: A clean, straightforward, and ultra-minimalist light-mode design utilizing minimal CSS with no borders, shadows, or colored logo gradients that fits perfectly on iOS Safari, Android Chrome, and Desktop browsers.
- **Completely Offline**: Runs 100% inside your local network segment (perfect for secure or remote offline setups).

---

## Quickstart & Local Hosting

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher) installed on the host machine.
- Participating devices must be connected to the same Wi-Fi router (e.g., Indihome) and be able to communicate with each other's local IP addresses.

### 2. Start the Server
From the repository root, run:
```bash
npm start
```
*Alternatively, run `node src/server.js` directly.*

The server will output:
```text
Loshare server listening on port 3000
Access locally: http://localhost:3000
Access on your local network: http://192.168.1.15:3000
```

### 3. Open in Browser
- **On host machine**: Open [http://localhost:3000](http://localhost:3000)
- **On other devices**: Open the local IP outputted in the server log (e.g., `http://192.168.1.15:3000`)

Customize your device name on-screen, select a peer, and start sharing text or files instantly!

---

## Development & Testing

### Running Tests
To execute the native Node.js unit tests (covering SSE registration, heartbeat routing, and streaming upload/download constraints):
```bash
npm test
```
