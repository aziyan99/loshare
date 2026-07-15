import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Url } from 'url';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'src', 'public');
const TEMP_DIR = path.join(process.cwd(), 'temp');
const MAX_FILE_SIZE = 104857600; // 100 MiB in bytes

// Ensure temp/ directory exists and clean it on startup
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
} else {
  // Clean up any remaining temporary files from previous runs
  const files = fs.readdirSync(TEMP_DIR);
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    } catch (err) {
      console.error(`Failed to delete stale temp file ${file}:`, err);
    }
  }
}

// Memory registries for peers and active transfers
const peers = new Map();
const transfers = new Map();

// Helper to broadcast active peer list to all connected SSE clients
function broadcastPeers() {
  const peerList = Array.from(peers.values()).map(p => ({
    id: p.id,
    name: p.name,
    deviceType: p.deviceType,
    ipAddress: p.ipAddress
  }));
  
  const data = JSON.stringify(peerList);
  for (const peer of peers.values()) {
    try {
      peer.res.write(`event: peers\ndata: ${data}\n\n`);
    } catch (err) {
      console.error(`Failed writing to peer ${peer.id}:`, err);
    }
  }
}

// Helper to send individual SSE message
function sendSSE(receiverId, eventType, dataObj) {
  const peer = peers.get(receiverId);
  if (peer) {
    try {
      peer.res.write(`event: ${eventType}\ndata: ${JSON.stringify(dataObj)}\n\n`);
      return true;
    } catch (err) {
      console.error(`Failed sending SSE ${eventType} to ${receiverId}:`, err);
    }
  }
  return false;
}

// Cleanup stale peers (heartbeat timeout: 15s)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, peer] of peers.entries()) {
    if (now - peer.lastSeen > 15000) {
      console.log(`Peer ${peer.name} (${id}) timed out`);
      try {
        peer.res.end();
      } catch (e) {}
      peers.delete(id);
      changed = true;
    }
  }
  if (changed) {
    broadcastPeers();
  }
}, 5000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

// File extension mapping for static file server
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Main request router
const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // 1. Static Asset Server
  if (req.method === 'GET' && (pathname === '/' || pathname.startsWith('/public/') || !pathname.startsWith('/api') && pathname !== '/events')) {
    let relativePath = pathname === '/' ? 'index.html' : pathname;
    if (relativePath.startsWith('/public/')) {
      relativePath = relativePath.substring(8); // Strip "/public/" prefix
    }
    const filePath = path.join(PUBLIC_DIR, relativePath);

    // Security Check: prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stats.size });
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  // 2. Server-Sent Events Interface
  if (req.method === 'GET' && pathname === '/events') {
    const id = reqUrl.searchParams.get('id');
    const name = reqUrl.searchParams.get('name');
    const deviceType = reqUrl.searchParams.get('deviceType');

    if (!id || !name || !deviceType) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Missing connection credentials');
    }

    // Capture caller IP address
    const ipAddress = req.socket.remoteAddress;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Write initial connection status
    res.write(`event: connected\ndata: {"message": "Event stream connected"}\n\n`);

    // Register active peer details
    peers.set(id, { id, name, deviceType, ipAddress, res, lastSeen: Date.now() });
    console.log(`Peer connected: ${name} (${id}) from ${ipAddress}`);

    broadcastPeers();

    // Remove peer on connection close
    req.on('close', () => {
      console.log(`Peer disconnected: ${name} (${id})`);
      peers.delete(id);
      broadcastPeers();
    });
    return;
  }

  // 3. API Handlers
  if (req.method === 'POST') {
    let body = '';
    
    // Helper to extract JSON body
    const getJSONBody = (callback) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          callback(JSON.parse(body));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
    };

    // Heartbeat Router
    if (pathname === '/api/heartbeat') {
      getJSONBody(({ id }) => {
        const peer = peers.get(id);
        if (peer) {
          peer.lastSeen = Date.now();
          res.writeHead(204);
          return res.end();
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Peer not registered' }));
      });
      return;
    }

    // Send Text Router
    if (pathname === '/api/send-text') {
      getJSONBody(({ senderId, receiverId, text }) => {
        if (!senderId || !receiverId || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing required fields' }));
        }

        const target = peers.get(receiverId);
        const sender = peers.get(senderId);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Recipient offline' }));
        }

        sendSSE(receiverId, 'text-incoming', {
          senderId,
          senderName: sender ? sender.name : 'Unknown Device',
          text
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Text delivered' }));
      });
      return;
    }

    // Initiate File Transfer Router
    if (pathname === '/api/transfer/request') {
      getJSONBody(({ senderId, receiverId, fileName, fileSize, fileType }) => {
        if (!senderId || !receiverId || !fileName || fileSize === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing transfer metadata' }));
        }

        if (fileSize > MAX_FILE_SIZE) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'File size exceeds 100MB limit' }));
        }

        const receiver = peers.get(receiverId);
        const sender = peers.get(senderId);
        if (!receiver) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Receiver offline' }));
        }

        const transferId = crypto.randomUUID();
        const transfer = {
          transferId,
          senderId,
          receiverId,
          fileName,
          fileSize,
          fileType,
          status: 'pending',
          progress: 0,
          tempFilePath: path.join(TEMP_DIR, `${transferId}.tmp`)
        };

        transfers.set(transferId, transfer);

        // Alert receiver
        sendSSE(receiverId, 'file-request', {
          transferId,
          senderId,
          senderName: sender ? sender.name : 'Unknown Device',
          fileName,
          fileSize,
          fileType
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ transferId }));
      });
      return;
    }

    // Respond to File Transfer Router
    if (pathname === '/api/transfer/respond') {
      getJSONBody(({ transferId, response }) => {
        const transfer = transfers.get(transferId);
        if (!transfer) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Transfer session not found' }));
        }

        if (response === 'accept') {
          transfer.status = 'transferring';
          sendSSE(transfer.senderId, 'transfer-status', {
            transferId,
            status: 'transferring',
            progress: 0
          });
        } else {
          transfer.status = 'failed';
          sendSSE(transfer.senderId, 'transfer-status', {
            transferId,
            status: 'failed',
            progress: 0,
            error: 'Receiver declined'
          });
          transfers.delete(transferId);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: transfer.status }));
      });
      return;
    }

    // File Upload Router (raw binary streams)
    if (pathname === '/api/transfer/upload') {
      const transferId = reqUrl.searchParams.get('transferId');
      const transfer = transfers.get(transferId);

      if (!transfer || transfer.status !== 'transferring') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Transfer not accepted or invalid' }));
      }

      // Check upload size limit
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > MAX_FILE_SIZE) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload exceeds 100MB' }));
      }

      const fileWriteStream = fs.createWriteStream(transfer.tempFilePath);
      let bytesUploaded = 0;
      let lastProgressBroadcast = 0;

      req.on('data', chunk => {
        bytesUploaded += chunk.length;
        const progress = parseFloat(((bytesUploaded / transfer.fileSize) * 100).toFixed(1));
        
        // Broadcast progress updates via SSE (throttled to avoid network flooding)
        if (progress - lastProgressBroadcast >= 5 || progress === 100) {
          transfer.progress = progress;
          lastProgressBroadcast = progress;
          const statusPayload = { transferId, status: 'transferring', progress };
          sendSSE(transfer.senderId, 'transfer-status', statusPayload);
          sendSSE(transfer.receiverId, 'transfer-status', statusPayload);
        }
      });

      req.pipe(fileWriteStream);

      fileWriteStream.on('finish', () => {
        transfer.status = 'ready';
        const finalStatus = { transferId, status: 'ready', progress: 100 };
        sendSSE(transfer.senderId, 'transfer-status', finalStatus);
        sendSSE(transfer.receiverId, 'transfer-status', finalStatus);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Upload completed' }));
      });

      fileWriteStream.on('error', err => {
        console.error('File write error:', err);
        transfer.status = 'failed';
        const failStatus = { transferId, status: 'failed', progress: 0, error: 'Write failed' };
        sendSSE(transfer.senderId, 'transfer-status', failStatus);
        sendSSE(transfer.receiverId, 'transfer-status', failStatus);
        
        try {
          fs.unlinkSync(transfer.tempFilePath);
        } catch (e) {}
        
        transfers.delete(transferId);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server write error' }));
      });
      return;
    }
  }

  // File Download Router
  if (req.method === 'GET' && pathname === '/api/transfer/download') {
    const transferId = reqUrl.searchParams.get('transferId');
    const transfer = transfers.get(transferId);

    if (!transfer || transfer.status !== 'ready') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File not found or transfer expired');
    }

    fs.stat(transfer.tempFilePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('File storage error');
      }

      res.writeHead(200, {
        'Content-Type': transfer.fileType || 'application/octet-stream',
        'Content-Length': stats.size,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(transfer.fileName)}"`
      });

      const fileReadStream = fs.createReadStream(transfer.tempFilePath);
      fileReadStream.pipe(res);

      res.on('finish', () => {
        // Clean up temporary buffered file after stream finishes
        fs.unlink(transfer.tempFilePath, err => {
          if (err) console.error(`Failed to delete temp file ${transfer.tempFilePath}:`, err);
        });
        
        const completeStatus = { transferId, status: 'completed', progress: 100 };
        sendSSE(transfer.senderId, 'transfer-status', completeStatus);
        sendSSE(transfer.receiverId, 'transfer-status', completeStatus);

        transfers.delete(transferId);
      });

      fileReadStream.on('error', err => {
        console.error('File read error:', err);
        try {
          fs.unlinkSync(transfer.tempFilePath);
        } catch (e) {}
        transfers.delete(transferId);
      });
    });
    return;
  }

  // Default Route
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Start listening if run directly (not loaded in tests)
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    // Print local network access instructions
    console.log(`Loshare server listening on port ${PORT}`);
    console.log(`Access locally: http://localhost:${PORT}`);
    
    // Find local IP addresses
    import('os').then(os => {
      const interfaces = os.networkInterfaces();
      for (const devName in interfaces) {
        for (const iface of interfaces[devName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`Access on your local network: http://${iface.address}:${PORT}`);
          }
        }
      }
    });
  });
}

export { server, peers, transfers, TEMP_DIR };
