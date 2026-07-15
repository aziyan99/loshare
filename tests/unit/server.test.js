import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { server, peers, transfers, TEMP_DIR } from '../../src/server.js';

// Setup environment for testing
process.env.NODE_ENV = 'test';

// Start server on a dynamic port
let testPort;
let testUrl;

test.before(async () => {
  return new Promise((resolve) => {
    server.listen(0, 'localhost', () => {
      testPort = server.address().port;
      testUrl = `http://localhost:${testPort}`;
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(() => {
      // Clear temp directory
      if (fs.existsSync(TEMP_DIR)) {
        const files = fs.readdirSync(TEMP_DIR);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(TEMP_DIR, file));
          } catch (e) {}
        }
      }
      resolve();
    });
  });
});

// Helper to make POST requests
function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: testPort,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper to make binary POST requests
function uploadBinary(pathWithParams, buffer) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: testPort,
      path: pathWithParams,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body ? JSON.parse(body) : null
        });
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// Helper to make GET requests
function getRaw(path) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: testPort,
      path: path
    }, (res) => {
      let data = [];
      res.on('data', chunk => { data.push(chunk); });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data)
        });
      });
    }).on('error', reject);
  });
}

// --- Test Cases ---

test('T011 / T007 - Static Asset 404', async () => {
  const res = await getRaw('/nonexistent-file.xyz');
  assert.strictEqual(res.statusCode, 404);
});

test('T007 / T011 - Peer SSE Registration and Heartbeats', async () => {
  const peerId = 'test-peer-id-1';
  let peerExistsDuringConnection = false;
  let sseResponseStatus = 0;
  let sseContentType = '';

  // Establish an SSE event handler request (simulated)
  const req = http.request({
    hostname: 'localhost',
    port: testPort,
    path: `/events?id=${peerId}&name=TestPhone&deviceType=mobile`,
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream'
    }
  }, (res) => {
    sseResponseStatus = res.statusCode;
    sseContentType = res.headers['content-type'];
    peerExistsDuringConnection = peers.has(peerId);
  });
  req.end();

  // Give registry a brief moment to write connection status
  await new Promise(r => setTimeout(r, 100));

  assert.strictEqual(sseResponseStatus, 200);
  assert.strictEqual(sseContentType, 'text/event-stream');
  assert.ok(peerExistsDuringConnection);

  // Test Heartbeat
  const hbRes = await postJSON('/api/heartbeat', { id: peerId });
  assert.strictEqual(hbRes.statusCode, 204);

  // Test Heartbeat on nonexistent peer
  const hbFail = await postJSON('/api/heartbeat', { id: 'ghost-peer' });
  assert.strictEqual(hbFail.statusCode, 404);
  
  // Close connection
  req.destroy();
  await new Promise(r => setTimeout(r, 50));
  assert.ok(!peers.has(peerId));
});

test('T019 / T022 - Text sharing validation', async () => {
  const senderId = 'sender-uuid';
  const receiverId = 'receiver-uuid';

  // Register recipient peer in memory to simulate active status
  peers.set(receiverId, {
    id: receiverId,
    name: 'Receiver Phone',
    deviceType: 'mobile',
    ipAddress: '127.0.0.1',
    res: { write: () => {} }, // Mock writable stream
    lastSeen: Date.now()
  });

  // Valid share
  const validShare = await postJSON('/api/send-text', {
    senderId,
    receiverId,
    text: 'Hello World!'
  });
  assert.strictEqual(validShare.statusCode, 200);

  // Invalid share (missing fields)
  const invalidShare = await postJSON('/api/send-text', {
    senderId
  });
  assert.strictEqual(invalidShare.statusCode, 400);

  // Share to offline recipient
  const offlineShare = await postJSON('/api/send-text', {
    senderId,
    receiverId: 'offline-uuid',
    text: 'Is anybody there?'
  });
  assert.strictEqual(offlineShare.statusCode, 404);

  // Clean up
  peers.delete(receiverId);
});

test('T012 / T015 / T016 / T017 - File Transfer Lifecycle', async () => {
  const senderId = 'sender-id';
  const receiverId = 'receiver-id';

  // Register sender and receiver
  peers.set(senderId, {
    id: senderId,
    name: 'Sender PC',
    deviceType: 'desktop',
    ipAddress: '127.0.0.1',
    res: { write: () => {} },
    lastSeen: Date.now()
  });
  peers.set(receiverId, {
    id: receiverId,
    name: 'Receiver Phone',
    deviceType: 'mobile',
    ipAddress: '127.0.0.1',
    res: { write: () => {} },
    lastSeen: Date.now()
  });

  // 1. Request file transfer
  const initRes = await postJSON('/api/transfer/request', {
    senderId,
    receiverId,
    fileName: 'test-doc.txt',
    fileSize: 12,
    fileType: 'text/plain'
  });
  assert.strictEqual(initRes.statusCode, 200);
  const transferId = initRes.body.transferId;
  assert.ok(transferId);

  // 2. Size limit validation (>100MB)
  const overSizeRes = await postJSON('/api/transfer/request', {
    senderId,
    receiverId,
    fileName: 'huge-movie.mp4',
    fileSize: 104857601, // 100MB + 1 byte
    fileType: 'video/mp4'
  });
  assert.strictEqual(overSizeRes.statusCode, 413);

  // 3. Respond to request (accept)
  const acceptRes = await postJSON('/api/transfer/respond', {
    transferId,
    response: 'accept'
  });
  assert.strictEqual(acceptRes.statusCode, 200);
  assert.strictEqual(acceptRes.body.status, 'transferring');

  // 4. Upload binary content
  const payload = Buffer.from('Hello Stream');
  const uploadRes = await uploadBinary(`/api/transfer/upload?transferId=${transferId}`, payload);
  assert.strictEqual(uploadRes.statusCode, 200);

  // Verify file buffer was written
  const transferInfo = transfers.get(transferId);
  assert.ok(fs.existsSync(transferInfo.tempFilePath));

  // 5. Download binary content
  const downloadRes = await getRaw(`/api/transfer/download?transferId=${transferId}`);
  assert.strictEqual(downloadRes.statusCode, 200);
  assert.strictEqual(downloadRes.headers['content-type'], 'text/plain');
  assert.strictEqual(downloadRes.headers['content-disposition'], 'attachment; filename="test-doc.txt"');
  assert.strictEqual(downloadRes.body.toString(), 'Hello Stream');

  // Give server time to trigger finish event and unlink file
  await new Promise(r => setTimeout(r, 100));

  // Verify file was cleaned up on download completion
  assert.ok(!fs.existsSync(transferInfo.tempFilePath));
  assert.ok(!transfers.has(transferId));

  // Clean up
  peers.delete(senderId);
  peers.delete(receiverId);
});
