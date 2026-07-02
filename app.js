// =============================================
// LOCKSCAN — app.js  (Shared Functions)
// =============================================

// ---- TOAST ----
function showToast(msg, type = 'default', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.className = 'toast'; }, duration);
}

// ---- TOGGLE PASSWORD ----
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

// ---- KEY STRENGTH ----
function evaluateKeyStrength(key) {
  if (!key) return { score: 0, label: 'Masukkan key...', color: '' };
  let score = 0;
  if (key.length >= 6) score++;
  if (key.length >= 10) score++;
  if (/[A-Z]/.test(key)) score++;
  if (/[0-9]/.test(key)) score++;
  if (/[^A-Za-z0-9]/.test(key)) score++;

  const levels = [
    { score: 20, label: 'Lemah — tambahkan karakter lebih banyak', color: '#f472b6' },
    { score: 40, label: 'Cukup — bisa lebih kuat lagi', color: '#fb923c' },
    { score: 65, label: 'Sedang — lumayan aman', color: '#facc15' },
    { score: 85, label: 'Kuat — bagus!', color: '#4ade80' },
    { score: 100, label: 'Sangat Kuat — 🔥', color: '#63dcaf' },
  ];
  return levels[Math.min(score - 1, 4)] || levels[0];
}

// ---- AES ENCRYPT / DECRYPT ----
function aesEncrypt(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}

function aesDecrypt(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch {
    return null;
  }
}

// ---- GENERATE QR (index.html only) ----
let currentCiphertext = '';

function generateQR() {
  const messageInput = document.getElementById('messageInput');
  const keyInput = document.getElementById('keyInput');
  const btn = document.getElementById('generateBtn');
  if (!messageInput || !keyInput) return;

  const message = messageInput.value.trim();
  const key = keyInput.value.trim();

  if (!message) { showToast('❗ Pesan tidak boleh kosong!', 'error'); messageInput.focus(); return; }
  if (!key) { showToast('❗ Key tidak boleh kosong!', 'error'); keyInput.focus(); return; }
  if (key.length < 4) { showToast('❗ Key minimal 4 karakter!', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Memproses...';

  setTimeout(() => {
    currentCiphertext = aesEncrypt(message, key);

    document.getElementById('ciphertextDisplay').textContent = currentCiphertext;

    // Buat link decrypt. Ciphertext CryptoJS SUDAH berbentuk base64,
    // jadi cukup encodeURIComponent — TIDAK perlu di-btoa lagi (dulu double-encoded,
    // bikin payload QR jadi jauh lebih panjang dari perlu = QR makin padat & susah discan).
    const baseUrl = window.location.href
      .split('#')[0]
      .replace(/index\.html.*$/, '')
      .replace(/\/$/, '');
    const qrLink = `${baseUrl}/scan.html?c=${encodeURIComponent(currentCiphertext)}`;

    // Update tombol "Pergi ke Halaman Decrypt" dengan link yang berisi ciphertext
    const decryptBtn = document.querySelector('.btn-secondary[href]');
    if (decryptBtn) decryptBtn.href = qrLink;

    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    new QRCode(qrDiv, {
      text: qrLink,
      // Dirender lebih besar (300px, bukan 160px) supaya tiap modul QR punya
      // cukup pixel — ini kunci utama biar tetap bisa dibaca saat di-upload
      // ulang sebagai file gambar, bukan cuma waktu discan langsung lewat kamera.
      width: 300, height: 300,
      // colorDark/colorLight sebelumnya TERTUKAR (modul gelap dikasih warna terang).
      // Sekarang dibetulkan + kontras dimaksimalkan (nyaris hitam/putih) supaya
      // paling reliable dibaca kamera & jsQR.
      colorDark: '#0a0f16',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    const outputArea = document.getElementById('outputArea');
    outputArea.style.display = 'block';
    outputArea.style.opacity = '0';
    outputArea.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      outputArea.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      outputArea.style.opacity = '1';
      outputArea.style.transform = 'translateY(0)';
    });
    outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('✅ QR Code berhasil dibuat!', 'success');

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">⚡</span> Generate QR Code <span class="btn-ripple"></span>';
  }, 600);
}

// ---- COPY CIPHER ----
function copyCipher() {
  if (!currentCiphertext) return;
  navigator.clipboard.writeText(currentCiphertext)
    .then(() => showToast('📋 Ciphertext disalin!', 'success'))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = currentCiphertext;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('📋 Ciphertext disalin!', 'success');
    });
}

// ---- DOWNLOAD QR ----
// PENTING: QR yang cuma canvas mentah (tanpa "quiet zone" / margin putih di
// sekelilingnya) sering GAGAL dibaca scanner ketika dibuka dari file gambar,
// walaupun scan langsung dari layar tetap jalan (karena background halaman
// yang terang di sekitar QR ikut berfungsi sebagai quiet zone). Makanya di
// sini kita gambar ulang ke canvas baru yang lebih besar dengan border putih
// supaya file PNG-nya reliable dibaca walau di-upload ulang.
function downloadQR() {
  const qrDiv = document.getElementById('qrcode');
  if (!qrDiv) return;
  const canvas = qrDiv.querySelector('canvas');
  const img = qrDiv.querySelector('img');
  const sourceEl = canvas || img;

  if (!sourceEl) {
    showToast('❗ QR belum dibuat!', 'error');
    return;
  }

  const srcW = canvas ? canvas.width : img.naturalWidth;
  const srcH = canvas ? canvas.height : img.naturalHeight;
  const quietZone = Math.round(Math.max(srcW, srcH) * 0.15); // ~15% margin tiap sisi

  const outCanvas = document.createElement('canvas');
  outCanvas.width = srcW + quietZone * 2;
  outCanvas.height = srcH + quietZone * 2;
  const ctx = outCanvas.getContext('2d');

  // Isi background putih penuh dulu (quiet zone WAJIB putih/terang, bukan
  // warna tema, supaya kontras maksimal buat scanner)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
  ctx.drawImage(sourceEl, quietZone, quietZone, srcW, srcH);

  const link = document.createElement('a');
  link.download = 'lockscan-qr.png';
  link.href = outCanvas.toDataURL('image/png');
  link.click();
  showToast('⬇ QR Code diunduh!', 'success');
}

// ---- CHAR COUNTER (index.html only) ----
const _messageInput = document.getElementById('messageInput');
if (_messageInput) {
  _messageInput.addEventListener('input', () => {
    const count = document.getElementById('charCount');
    if (count) count.textContent = _messageInput.value.length;
  });
}

// ---- KEY STRENGTH LIVE UPDATE (index.html only) ----
const _keyInput = document.getElementById('keyInput');
if (_keyInput) {
  _keyInput.addEventListener('input', () => {
    const { score, label, color } = evaluateKeyStrength(_keyInput.value);
    const fill = document.getElementById('strengthFill');
    const lbl = document.getElementById('strengthLabel');
    if (fill) { fill.style.width = score + '%'; fill.style.background = color; }
    if (lbl) { lbl.textContent = label; lbl.style.color = color || 'var(--text-dim)'; }
  });
}

// ---- Ctrl+Enter shortcut (index.html only — scan.html punya shortcut sendiri di scan.js) ----
if (!document.getElementById('cipherInput')) {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') {
      const genBtn = document.getElementById('generateBtn');
      if (genBtn) genBtn.click();
    }
  });
}