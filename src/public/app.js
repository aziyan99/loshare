// Local UUID and name generators
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getDefaultName(type) {
  const brand = type === 'desktop' ? 'PC' : type === 'tablet' ? 'Tablet' : 'Phone';
  const colors = ['Blue', 'Green', 'Purple', 'Orange', 'Sleek', 'Silver', 'Amber', 'Vibrant'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `${randomColor} ${brand}`;
}

// 1. Core State
const myId = localStorage.getItem('loshare_peer_id') || generateUUID();
localStorage.setItem('loshare_peer_id', myId);

const myDeviceType = getDeviceType();
let myName = localStorage.getItem('loshare_peer_name') || getDefaultName(myDeviceType);
localStorage.setItem('loshare_peer_name', myName);

let activePeers = [];
let selectedPeerId = null;
let currentTransferId = null;
const incomingTransfersMeta = {};
let eventSource = null;
let heartbeatInterval = null;

// HTML Elements
const banner = document.getElementById('connection-banner');
const bannerText = document.getElementById('banner-text');
const nameInput = document.getElementById('my-name-input');
const deviceTypeLabel = document.getElementById('my-device-type');
const ipLabel = document.getElementById('my-ip');
const noPeersPlaceholder = document.getElementById('no-peers-placeholder');
const peersGrid = document.getElementById('peers-grid');

// Share Modal Elements
const shareModal = document.getElementById('share-modal');
const modalTargetName = document.getElementById('modal-target-name');
const closeModalBtn = document.getElementById('close-modal-btn');
const tabFileBtn = document.getElementById('tab-file-btn');
const tabTextBtn = document.getElementById('tab-text-btn');
const tabFile = document.getElementById('tab-file');
const tabText = document.getElementById('tab-text');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const fileDetails = document.getElementById('selected-file-details');
const fileNameLabel = document.getElementById('selected-file-name');
const fileSizeLabel = document.getElementById('selected-file-size');
const sendFileBtn = document.getElementById('send-file-btn');
const textInput = document.getElementById('text-input');
const sendTextBtn = document.getElementById('send-text-btn');

// Incoming Transfer Alert
const incomingModal = document.getElementById('incoming-modal');
const incomingSender = document.getElementById('incoming-sender');
const incomingFileName = document.getElementById('incoming-file-name');
const incomingFileSize = document.getElementById('incoming-file-size');
const acceptTransferBtn = document.getElementById('accept-transfer-btn');
const declineTransferBtn = document.getElementById('decline-transfer-btn');

// Active Progress Modal
const transferModal = document.getElementById('transfer-modal');
const transferTitle = document.getElementById('transfer-title');
const transferSubtitle = document.getElementById('transfer-subtitle');
const transferProgressFill = document.getElementById('transfer-progress-fill');
const transferPercent = document.getElementById('transfer-percent');
const transferBytes = document.getElementById('transfer-bytes');

// Text Display Modal
const textModal = document.getElementById('text-modal');
const textSenderTitle = document.getElementById('text-sender-title');
const textDisplay = document.getElementById('text-display');
const closeTextBtn = document.getElementById('close-text-btn');
const copyTextBtn = document.getElementById('copy-text-btn');

// --- Helper Functions ---

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function showBanner(message) {
  bannerText.textContent = message;
  banner.classList.remove('hidden');
}

function hideBanner() {
  banner.classList.add('hidden');
}

// --- WebSocket/SSE Peer connection ---

function connectSSE() {
  if (eventSource) {
    eventSource.close();
  }

  const sseUrl = `/events?id=${myId}&name=${encodeURIComponent(myName)}&deviceType=${myDeviceType}`;
  eventSource = new EventSource(sseUrl);

  eventSource.onopen = () => {
    hideBanner();
    console.log('SSE Stream established');
    startHeartbeat();
  };

  eventSource.onerror = () => {
    showBanner('Reconnecting to local network host...');
    stopHeartbeat();
    setTimeout(connectSSE, 3000);
  };

  eventSource.addEventListener('connected', (e) => {
    console.log('Registered with server:', JSON.parse(e.data));
  });

  eventSource.addEventListener('peers', (e) => {
    const peersList = JSON.parse(e.data);
    
    // Filter out our own device
    activePeers = peersList.filter(p => p.id !== myId);
    
    // Capture our own IP if present
    const me = peersList.find(p => p.id === myId);
    if (me && me.ipAddress) {
      ipLabel.textContent = me.ipAddress.replace('::ffff:', '');
    }

    renderPeers();
  });

  eventSource.addEventListener('text-incoming', (e) => {
    const { senderName, text } = JSON.parse(e.data);
    textSenderTitle.textContent = `Text from ${senderName}`;
    textDisplay.textContent = text;
    textModal.classList.remove('hidden');
  });

  eventSource.addEventListener('file-request', (e) => {
    const { transferId, senderName, fileName, fileSize, fileType } = JSON.parse(e.data);
    currentTransferId = transferId;
    incomingTransfersMeta[transferId] = { fileName };
    incomingSender.textContent = senderName;
    incomingFileName.textContent = fileName;
    incomingFileSize.textContent = formatBytes(fileSize);
    incomingModal.classList.remove('hidden');
  });

  eventSource.addEventListener('transfer-status', (e) => {
    const { transferId, status, progress, error } = JSON.parse(e.data);
    if (status === 'transferring') {
      // Check if we are the sender and need to initiate upload
      if (window.activeUploadFile && window.activeUploadId === transferId) {
        const file = window.activeUploadFile;
        window.activeUploadFile = null; // Prevent double trigger
        startBinaryUpload(transferId, file);
      }
      transferTitle.textContent = 'Streaming Bytes';
      transferSubtitle.textContent = 'Transmitting data directly between local browsers...';
      transferProgressFill.style.width = `${progress}%`;
      transferPercent.textContent = `${progress}%`;
      transferModal.classList.remove('hidden');
    } else if (status === 'ready') {
      if (currentTransferId === transferId) {
        if (incomingTransfersMeta[transferId]) {
          // Trigger download for recipient
          transferModal.classList.add('hidden');
          const metadata = incomingTransfersMeta[transferId];
          
          // Show assembling state to recipient
          transferTitle.textContent = 'Saving File';
          transferSubtitle.textContent = 'Assembling payload in browser memory...';
          transferProgressFill.style.width = '100%';
          transferPercent.textContent = '100%';
          transferModal.classList.remove('hidden');

          fetch(`/api/transfer/download?transferId=${transferId}`)
            .then(res => {
              if (!res.ok) throw new Error('Download failed');
              return res.blob();
            })
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = metadata.fileName;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              
              transferModal.classList.add('hidden');
              delete incomingTransfersMeta[transferId];
              currentTransferId = null;
            })
            .catch(err => {
              transferModal.classList.add('hidden');
              alert(`Failed to save file: ${err.message}`);
              delete incomingTransfersMeta[transferId];
              currentTransferId = null;
            });
        } else {
          // We are the sender. Update modal message to wait for recipient download to complete.
          transferTitle.textContent = 'File Uploaded';
          transferSubtitle.textContent = 'Recipient is saving the file...';
          transferProgressFill.style.width = '100%';
          transferPercent.textContent = '100%';
        }
      }
    } else if (status === 'completed') {
      transferModal.classList.add('hidden');
      delete incomingTransfersMeta[transferId];
      currentTransferId = null;
    } else if (status === 'failed') {
      transferModal.classList.add('hidden');
      alert(`Transfer failed: ${error || 'Connection broken'}`);
      delete incomingTransfersMeta[transferId];
      currentTransferId = null;
    }
  });
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: myId })
    }).catch(e => console.error('Heartbeat ping failed:', e));
  }, 10000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// --- Render interface lists ---

function renderPeers() {
  if (activePeers.length === 0) {
    noPeersPlaceholder.classList.remove('hidden');
    peersGrid.classList.add('hidden');
    return;
  }

  noPeersPlaceholder.classList.add('hidden');
  peersGrid.classList.remove('hidden');
  peersGrid.innerHTML = '';

  activePeers.forEach(peer => {
    const card = document.createElement('div');
    card.className = 'peer-node';
    card.addEventListener('click', () => openShareModal(peer));

    const iconBox = document.createElement('div');
    iconBox.className = 'node-icon-box';

    // Choose SVG icon depending on peer type
    if (peer.deviceType === 'mobile') {
      iconBox.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
          <path d="M12 18h.01"/>
        </svg>
      `;
    } else if (peer.deviceType === 'tablet') {
      iconBox.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
          <path d="M12 18h.01"/>
        </svg>
      `;
    } else {
      iconBox.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect width="20" height="14" x="2" y="3" rx="2" ry="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      `;
    }

    const nameLabel = document.createElement('span');
    nameLabel.className = 'peer-name';
    nameLabel.textContent = peer.name;

    const typeLabel = document.createElement('span');
    typeLabel.className = 'peer-type';
    typeLabel.textContent = peer.deviceType;

    card.appendChild(iconBox);
    card.appendChild(nameLabel);
    card.appendChild(typeLabel);
    peersGrid.appendChild(card);
  });
}

// --- Share Interactions & Modals ---

function openShareModal(peer) {
  selectedPeerId = peer.id;
  modalTargetName.textContent = `Share with ${peer.name}`;
  shareModal.classList.remove('hidden');
}

function closeShareModal() {
  shareModal.classList.add('hidden');
  selectedPeerId = null;
  resetFileSelection();
}

function resetFileSelection() {
  fileInput.value = '';
  fileDetails.classList.add('hidden');
  document.querySelector('.dropzone-content').classList.remove('hidden');
  sendFileBtn.disabled = true;
}

// Tabs routing inside share modal
tabFileBtn.addEventListener('click', () => {
  tabFileBtn.classList.add('active');
  tabTextBtn.classList.remove('active');
  tabFile.classList.remove('hidden');
  tabText.classList.add('hidden');
});

tabTextBtn.addEventListener('click', () => {
  tabTextBtn.classList.add('active');
  tabFileBtn.classList.remove('active');
  tabText.classList.add('hidden');
  tabFile.classList.remove('hidden'); // wait, should be display tabText and hide tabFile
  tabFile.classList.add('hidden');
  tabText.classList.remove('hidden');
});

// Dropzone bindings
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFileSelection(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelection(e.target.files[0]);
  }
});

function handleFileSelection(file) {
  if (file.size > 104857600) {
    alert('File size exceeds the 100MB limit for local quick share.');
    resetFileSelection();
    return;
  }

  fileNameLabel.textContent = file.name;
  fileSizeLabel.textContent = formatBytes(file.size);
  
  document.querySelector('.dropzone-content').classList.add('hidden');
  fileDetails.classList.remove('hidden');
  sendFileBtn.disabled = false;
}

// --- Data Transmission Trigger Endpoints ---

// Send Text Snippet
sendTextBtn.addEventListener('click', () => {
  const textVal = textInput.value.trim();
  if (!textVal) return;

  fetch('/api/send-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: myId,
      receiverId: selectedPeerId,
      text: textVal
    })
  }).then(res => {
    if (res.ok) {
      textInput.value = '';
      closeShareModal();
    } else {
      alert('Failed to deliver text. Recipient may have disconnected.');
    }
  }).catch(err => {
    console.error('Text transfer error:', err);
    alert('Failed to connect to local host.');
  });
});

// Send File (Request -> Respond -> Upload)
sendFileBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file || !selectedPeerId) return;

  // 1. Dispatch metadata request
  fetch('/api/transfer/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: myId,
      receiverId: selectedPeerId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Transfer rejected by server');
    return res.json();
  })
  .then(({ transferId }) => {
    closeShareModal();
    
    // Open progress dialog in "pending status"
    transferTitle.textContent = 'Waiting for acceptance...';
    transferSubtitle.textContent = 'Waiting for recipient device to accept the file...';
    transferProgressFill.style.width = '0%';
    transferPercent.textContent = '0%';
    transferBytes.textContent = `0 / ${formatBytes(file.size)}`;
    transferModal.classList.remove('hidden');

    // Monitor response status using XHR upload stream
    // Setup a listener: if the user declines, SSE alerts us, closing the modal.
    // If accepted, we start binary upload.
    currentTransferId = transferId;
    
    // Keep reference to the actual file for uploading when ready
    window.activeUploadFile = file;
    window.activeUploadId = transferId;
  })
  .catch(err => {
    console.error('Request initialization error:', err);
    alert('Failed to initiate transfer.');
  });
});

// Listen to upload triggers inside window context
// This intercepts status checks (triggered via our EventSource listener)
window.addEventListener('message', (e) => {
  // Wait, standard SSE event handler (connectSSE) can directly trigger upload
  // to avoid complex messaging. Let's see: we can trigger it inside connectSSE directly!
});

// Let's hook the EventSource receiver accept event in the main EventSource handler:
// Inside connectSSE status listener:
// If status is "transferring" and we are the sender, initiate XHR binary stream.
// To do this, let's track the upload logic in a dedicated function:
function startBinaryUpload(transferId, file) {
  const xhr = new XMLHttpRequest();
  
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const progress = parseFloat(((e.loaded / e.total) * 100).toFixed(1));
      transferProgressFill.style.width = `${progress}%`;
      transferPercent.textContent = `${progress}%`;
      transferBytes.textContent = `${formatBytes(e.loaded)} / ${formatBytes(e.total)}`;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log('Upload binary piped completely');
      // Update UI to show upload complete, waiting for recipient
      transferTitle.textContent = 'Upload Complete';
      transferSubtitle.textContent = 'Waiting for recipient to save file...';
      transferProgressFill.style.width = '100%';
      transferPercent.textContent = '100%';
    } else {
      alert('Upload failed on server.');
      transferModal.classList.add('hidden');
      currentTransferId = null;
    }
  };

  xhr.onerror = () => {
    alert('Network error during file upload.');
    transferModal.classList.add('hidden');
  };

  xhr.open('POST', `/api/transfer/upload?transferId=${transferId}`);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  xhr.send(file);
}

// Modify connectSSE event listener logic internally to call startBinaryUpload:
// Let's intercept EventSource status handler:
// (Inside eventSource.addEventListener('transfer-status')):
// If status is 'transferring' and we have window.activeUploadFile and window.activeUploadId === transferId:
// We start binary upload and set window.activeUploadFile = null.
// Let's override the EventSource listener by attaching to the window object or adjusting variables.
// Since variables are in scope, we can check them directly!
// Let's modify EventSource listener code in app.js:
/*
  eventSource.addEventListener('transfer-status', (e) => {
    const { transferId, status, progress, error } = JSON.parse(e.data);
    if (status === 'transferring') {
      // Check if we are the sender
      if (window.activeUploadFile && window.activeUploadId === transferId) {
        const file = window.activeUploadFile;
        window.activeUploadFile = null; // Prevent double trigger
        startBinaryUpload(transferId, file);
      }
      ...
*/

// Incoming Transfer Confirmation Actions
acceptTransferBtn.addEventListener('click', () => {
  if (!currentTransferId) return;
  
  fetch('/api/transfer/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transferId: currentTransferId,
      response: 'accept'
    })
  })
  .then(() => {
    incomingModal.classList.add('hidden');
    
    // Open progress dialog for receiver
    transferTitle.textContent = 'Downloading File';
    transferSubtitle.textContent = 'Streaming data directly to default download path...';
    transferProgressFill.style.width = '0%';
    transferPercent.textContent = '0%';
    transferModal.classList.remove('hidden');
  });
});

declineTransferBtn.addEventListener('click', () => {
  if (!currentTransferId) return;

  fetch('/api/transfer/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transferId: currentTransferId,
      response: 'decline'
    })
  })
  .then(() => {
    incomingModal.classList.add('hidden');
    currentTransferId = null;
  });
});

// Clipboard interactions
copyTextBtn.addEventListener('click', () => {
  const text = textDisplay.textContent;
  navigator.clipboard.writeText(text)
    .then(() => {
      const prevText = copyTextBtn.textContent;
      copyTextBtn.textContent = 'Copied!';
      copyTextBtn.style.background = 'var(--success-color)';
      setTimeout(() => {
        copyTextBtn.textContent = prevText;
        copyTextBtn.style.background = 'var(--accent-color)';
      }, 1500);
    })
    .catch(e => {
      console.error('Clipboard copy failed:', e);
      alert('Failed to copy. Try selecting manually.');
    });
});

// Close Text Display modal
closeTextBtn.addEventListener('click', () => textModal.classList.add('add')); // Wait, should be classList.add('hidden')
closeTextBtn.addEventListener('click', () => textModal.classList.add('hidden'));

// Edit Identity Name Field
nameInput.value = myName;
deviceTypeLabel.textContent = myDeviceType;

nameInput.addEventListener('change', () => {
  const newName = nameInput.value.trim();
  if (newName && newName !== myName) {
    myName = newName;
    localStorage.setItem('loshare_peer_name', myName);
    console.log(`Identity updated: ${myName}`);
    
    // Re-establish SSE connection with updated name metadata
    connectSSE();
  } else {
    nameInput.value = myName;
  }
});

// UI Dialog Closers
closeModalBtn.addEventListener('click', closeShareModal);

// Clean intercept upload trigger in SSE
window.activeUploadFile = null;
window.activeUploadId = null;

// Initialize connection on page load
connectSSE();
