# LockScan — QR Secure Message 🔐
LockScan adalah aplikasi berbasis web (*web-based application*) yang menggabungkan teknik **Kriptografi** dan **QR Code** untuk mengamankan pesan teks. Aplikasi ini memungkinkan pengguna menyandikan (mengenkripsi) pesan rahasia menggunakan kunci pengaman (*key*) menjadi bentuk teks acak (*ciphertext*), kemudian mengubahnya menjadi QR Code agar mudah dibagikan. Penerima pesan cukup memindai (*scan*) QR Code tersebut dan memasukkan kunci yang benar untuk membaca kembali pesan asli (dekripsi). Proyek ini dibangun menggunakan arsitektur *front-end* murni (HTML5, CSS3, dan JavaScript modern) sehingga dapat berjalan dengan sangat cepat langsung melalui peramban web (*browser*).

---
## 👥 Tim Pengembang (Kelompok A1)
Proyek ini dikembangkan oleh:
* **Parida Lubis**
* **Bernita Agustien**
* **Dhea Tri Lova. S**
* **Jelita Zalukhu**
* **Ferlita Hulu**

---

## ✨ Fitur Utama
1. **Enkripsi AES yang Kuat:** Menggunakan pustaka *CryptoJS* dengan algoritma AES (*Advanced Encryption Standard*) untuk mengamankan teks sebelum dijadikan QR Code.
2. **Kalkulator Kekuatan Kunci (*Key Strength Indicator*):** Dilengkapi fitur interaktif yang secara otomatis menilai tingkat keamanan kata sandi/kunci yang dimasukkan pengguna secara *real-time*.
3. **Pembuat & Pengunduh QR Code:** Mengubah teks terenkripsi (*ciphertext*) menjadi gambar QR Code secara instan dengan opsi unduh (`.png`) sekali klik.
4. **Pemindai QR Fleksibel (Unggah File):** Menggunakan pustaka `jsQR` untuk mendeteksi, membaca, dan mengekstrak pesan terenkripsi dari file gambar QR Code yang diunggah pengguna.
5. **Mode Demo Cepat:** Menyediakan data demo bawaan untuk mencoba alur kerja dekripsi tanpa harus membuat QR Code baru terlebih dahulu.
6. **UI/UX Futuristik (*Cyberpunk/Tech Theme*):** Desain antarmuka modern menggunakan tema gelap (*dark mode*) yang memadukan font *Syne* & *Space Mono*, animasi *glowing background*, efek transisi halus, serta notifikasi *Toast* yang interaktif.

---

## 📁 Struktur Berkas Proyek
```text
lockscan_clean/
├── index.html       # Halaman Utama (Enkripsi Pesan & Pembuatan QR Code)
├── scan.html        # Halaman Pemindaian (Unggah QR Code & Dekripsi Pesan)
├── style.css        # Berkas Desain Global (Variabel Warna CSS, Animasi, & Tata Letak)
├── app.js           # Fungsi Bersama (Logika Toast, Toggle Password, & Indikator Kunci)
└── scan.js          # Logika Khusus Dekripsi (Fungsi jsQR, Penanganan File, & Muat Demo)

```

---

## 🛠️ Teknologi & Pustaka Yang Digunakan
Aplikasi ini menggunakan teknologi web standar tanpa *framework* berat untuk menjaga performa tetap optimal:
* **HTML5 & CSS3:** Struktur halaman dan desain web responsif (*mobile-friendly*).
* **JavaScript (ES6+):** Logika interaktivitas aplikasi.
* **[CryptoJS v4.1.1](https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js):** Pustaka untuk menangani enkripsi dan dekripsi berbasis AES.
* **[QRCode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js):** Pustaka untuk melakukan *rendering* teks terenkripsi menjadi bentuk gambar QR Code.
* **[jsQR v1.4.0](https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js):** Pustaka pelacak posisi kode QR murni dari data gambar mentah (*raw image canvas*).

---

## 🚀 Cara Menjalankan Proyek Secara Lokal
Karena proyek ini menggunakan modul JavaScript standar dan memuat pustaka eksternal via CDN, kamu dapat menjalankannya dengan mudah:
1. **Unduh atau Clone Repositori Ini:**
```bash
git clone [https://github.com/USERNAME_GITHUB_KAMU/lockscan_clean.git](https://github.com/USERNAME_GITHUB_KAMU/lockscan_clean.git)

```
2. **Masuk ke Direktori Proyek:**
```bash
cd lockscan_clean

```
3. **Buka Aplikasi:**
* Kamu bisa langsung mengklik ganda (*double click*) berkas `index.html` untuk membukanya di browser.
* *Rekomendasi:* Gunakan ekstensi **Live Server** pada Visual Studio Code agar seluruh fungsionalitas pembacaan data gambar berjalan mulus tanpa kendala CORS browser.



---

## 📖 Alur Penggunaan Aplikasi
### 1. Mengamankan Pesan (Halaman `index.html`):
1. Masukkan pesan rahasia pada kotak input yang disediakan.
2. Buat kunci enkripsi (*key*) privat Anda. Perhatikan indikator kekuatan kunci untuk memastikan keamanan maksimal.
3. Klik tombol **"Generate QR Secure"**. Teks acak hasil enkripsi akan muncul bersama dengan QR Code-nya.
4. Klik **"Unduh QR Code"** untuk menyimpannya ke perangkat Anda.
### 2. Membaca Pesan Kembali (Halaman `scan.html`):
1. Masuk ke halaman **"Scan & Decrypt"**.
2. Klik area unggah gambar dan pilih berkas foto QR Code yang sudah diunduh sebelumnya.
3. Masukkan kunci enkripsi yang sama pada kolom kunci dekripsi.
4. Klik tombol **"Decrypt Pesan"** untuk membaca isi pesan asli di bawahnya.
