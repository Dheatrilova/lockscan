// =============================================
// LOCKSCAN — scan.js  (Decrypt Page)
// =============================================

let scannedCipher = '';
let cameraStream = null;
let cameraAnimFrame = null;

// ---- TABS ----
function switchTab(tab) {
  if (tab !== 'camera') stopCamera();

  const id = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab' + id).classList.add('active');
  document.getElementById('tabContent' + id).classList.add('active');

  resetAll();
}

function resetAll() {
  scannedCipher = '';

  // Reset key
  const keyInput = document.getElementById('decryptKeyInput');
  if (keyInput) keyInput.value = '';

  // Reset cipher textarea
  const cipherInput = document.getElementById('cipherInput');
  if (cipherInput) cipherInput.value = '';

  // Sembunyikan hasil decrypt paksa
  const decryptOutput = document.getElementById('decryptOutput');
  if (decryptOutput) {
    decryptOutput.setAttribute('style', 'display:none !important');
  }

  // Reset result box
  const resultBox = document.getElementById('resultBox');
  if (resultBox) resultBox.className = 'result-box';

  const resultLabel = document.getElementById('resultLabel');
  if (resultLabel) resultLabel.textContent = '';

  const resultText = document.getElementById('resultText');
  if (resultText) resultText.textContent = '';

  // Reset camera scan result
  const cameraScanResult = document.getElementById('cameraScanResult');
  if (cameraScanResult) cameraScanResult.style.display = 'none';

  // Reset upload area
  const qrPreviewWrap = document.getElementById('qrPreviewWrap');
  const uploadZone = document.getElementById('uploadZone');
  const scanResult = document.getElementById('scanResult');
  const qrFileInput = document.getElementById('qrFileInput');
  if (qrPreviewWrap) qrPreviewWrap.style.display = 'none';
  if (uploadZone) uploadZone.style.display = 'block';
  if (scanResult) scanResult.style.display = 'none';
  if (qrFileInput) qrFileInput.value = '';
}

// ---- QR UPLOAD ----
function handleQRUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('❗ File harus berupa gambar!', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        scannedCipher = code.data;
        document.getElementById('qrPreviewImg').src = e.target.result;
        document.getElementById('qrPreviewWrap').style.display = 'block';
        document.getElementById('uploadZone').style.display = 'none';
        document.getElementById('scanResult').style.display = 'flex';
        document.getElementById('scanCipherPreview').textContent =
          scannedCipher.length > 60 ? scannedCipher.substring(0, 60) + '...' : scannedCipher;
        showToast('✅ QR Code berhasil dibaca!', 'success');
      } else {
        showToast('❗ QR Code tidak terbaca. Coba gambar yang lebih jelas.', 'error');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeQR() {
  scannedCipher = '';
  document.getElementById('qrPreviewWrap').style.display = 'none';
  document.getElementById('uploadZone').style.display = 'block';
  document.getElementById('scanResult').style.display = 'none';
  document.getElementById('qrFileInput').value = '';
}

// ---- DRAG & DROP ----
const uploadZone = document.getElementById('uploadZone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--accent)';
    uploadZone.style.background = 'rgba(99,220,175,0.06)';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file) handleQRUpload({ target: { files: [file] } });
  });
}

// ---- CAMERA SCAN ----
async function startCamera() {
  const video = document.getElementById('cameraVideo');
  const startBtn = document.getElementById('startCameraBtn');
  const stopBtn = document.getElementById('stopCameraBtn');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('❗ Browser tidak mendukung akses kamera.', 'error');
    return;
  }

  try {
    // Stop existing stream first
    if (cameraStream) stopCamera();

    // Try rear camera first, fallback to any available camera
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
    } catch {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    }

    // Reset video element completely
    video.srcObject = null;
    await new Promise(r => setTimeout(r, 100));
    video.srcObject = cameraStream;

    // Wait for video to be ready (with timeout fallback)
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 3000);
      video.oncanplay = () => { clearTimeout(timeout); resolve(); };
      video.onloadedmetadata = () => video.play().catch(() => {});
    });

    // Try playing if not already playing
    if (video.paused) {
      try { await video.play(); } catch(e) { console.warn('play() warning:', e); }
    }

    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    showToast('🎥 Kamera aktif — arahkan ke QR Code', 'success');

    // Small delay to ensure first frame is rendered
    setTimeout(() => scanCameraFrame(), 300);

  } catch (err) {
    console.error(err);
    if (err.name === 'NotAllowedError') {
      showToast('❗ Izin kamera ditolak. Aktifkan di pengaturan browser.', 'error');
    } else if (err.name === 'NotFoundError') {
      showToast('❗ Kamera tidak ditemukan di perangkat ini.', 'error');
    } else {
      showToast('❗ Kamera error: ' + err.message, 'error');
    }
  }
}

function scanCameraFrame() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');

  // Stop if camera was turned off
  if (!cameraStream) return;

  // Make sure video is actually playing and has real dimensions
  if (
    !video ||
    video.paused ||
    video.ended ||
    video.readyState < 2 ||
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    cameraAnimFrame = requestAnimationFrame(scanCameraFrame);
    return;
  }

  // Draw current frame to hidden canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Try to decode QR
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height, {
    inversionAttempts: 'attemptBoth'
  });

  if (code && code.data) {
    scannedCipher = code.data;

    // Reset key dan hasil decrypt dulu
    const keyInput = document.getElementById('decryptKeyInput');
    if (keyInput) { keyInput.value = ''; keyInput.focus(); }
    const decryptOutput = document.getElementById('decryptOutput');
    if (decryptOutput) decryptOutput.style.display = 'none';

    // Tampilkan preview cipher
    document.getElementById('cameraScanResult').style.display = 'flex';
    document.getElementById('cameraCipherPreview').textContent =
      scannedCipher.length > 60 ? scannedCipher.substring(0, 60) + '...' : scannedCipher;

    showToast('✅ QR discan! Masukkan key lalu klik Decrypt.', 'success', 4000);
    stopCamera();
    return;
  }

  // Continue scanning
  cameraAnimFrame = requestAnimationFrame(scanCameraFrame);
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (cameraAnimFrame) {
    cancelAnimationFrame(cameraAnimFrame);
    cameraAnimFrame = null;
  }
  const video = document.getElementById('cameraVideo');
  if (video) video.srcObject = null;

  const startBtn = document.getElementById('startCameraBtn');
  const stopBtn = document.getElementById('stopCameraBtn');
  if (startBtn) startBtn.style.display = 'flex';
  if (stopBtn) stopBtn.style.display = 'none';
}

// Stop camera when leaving the page
window.addEventListener('beforeunload', stopCamera);

// ---- DECRYPT ----
function decryptMessage() {
  const activeTab = document.querySelector('.tab-btn.active')?.id;
  let cipher = '';

  if (activeTab === 'tabQR') {
    cipher = scannedCipher.trim();
    if (!cipher) { showToast('❗ Belum ada QR yang diupload!', 'error'); return; }
  } else if (activeTab === 'tabCamera') {
    cipher = scannedCipher.trim();
    if (!cipher) { showToast('❗ Belum ada QR yang discan dari kamera!', 'error'); return; }
  } else if (activeTab === 'tabText') {
    cipher = document.getElementById('cipherInput')?.value.trim() || '';
    if (!cipher) { showToast('❗ Ciphertext tidak boleh kosong!', 'error'); return; }
  }

  const key = document.getElementById('decryptKeyInput')?.value.trim();
  if (!key) { showToast('❗ Key tidak boleh kosong!', 'error'); return; }

  const result = aesDecrypt(cipher, key);
  const outputArea = document.getElementById('decryptOutput');
  const resultBox = document.getElementById('resultBox');

  outputArea.removeAttribute('style');
  outputArea.style.display = 'block';

  if (result) {
    resultBox.className = 'result-box success';
    document.getElementById('resultLabel').textContent = '✅ Dekripsi Berhasil!';
    document.getElementById('resultText').textContent = result;
    document.getElementById('resultText').style.color = 'var(--text)';
    document.getElementById('copyResultBtn').style.display = 'inline-flex';
    showToast('🔓 Pesan berhasil didekripsi!', 'success');
  } else {
    resultBox.className = 'result-box error';
    document.getElementById('resultLabel').textContent = '❌ Dekripsi Gagal!';
    document.getElementById('resultText').textContent =
      'Key yang kamu masukkan salah atau ciphertext tidak valid.\n\nPastikan key sama persis dengan yang digunakan saat enkripsi.';
    document.getElementById('resultText').style.color = 'var(--text-muted)';
    document.getElementById('copyResultBtn').style.display = 'none';
    showToast('❌ Key salah atau ciphertext tidak valid!', 'error');
  }

  outputArea.style.opacity = '0';
  outputArea.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    outputArea.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    outputArea.style.opacity = '1';
    outputArea.style.transform = 'translateY(0)';
  });
  outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- COPY RESULT ----
function copyResult() {
  const text = document.getElementById('resultText')?.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => showToast('📋 Pesan disalin!', 'success'))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('📋 Pesan disalin!', 'success');
    });
}

// ---- DEMO ----
function loadDemo() {
  const demoCipher = CryptoJS.AES.encrypt(
    'Halo! Ini pesan rahasia dari LockScan 🔐\n\nProyek Kriptografi — Kelompok A1\n(Parida, Bernita, Dhea, Jelita, Ferlita)',
    'demo123'
  ).toString();
  switchTab('text');
  document.getElementById('cipherInput').value = demoCipher;
  document.getElementById('decryptKeyInput').value = 'demo123';
  showToast('🎭 Demo dimuat! Klik Decrypt untuk melihat hasilnya.', 'success', 4000);
}

// Ctrl+Enter shortcut
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') decryptMessage();
});

// ---- BACA CIPHERTEXT DARI URL OTOMATIS ----
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const cipher = params.get('c');
  if (!cipher) return;

  // Switch ke tab paste teks
  switchTab('text');

  // Isi ciphertext otomatis
  const cipherInput = document.getElementById('cipherInput');
  if (cipherInput) cipherInput.value = decodeURIComponent(cipher);

  // Fokus ke field key
  const keyInput = document.getElementById('decryptKeyInput');
  if (keyInput) setTimeout(() => keyInput.focus(), 300);

  showToast('📲 QR terbaca! Masukkan key untuk decrypt.', 'success', 4000);
});