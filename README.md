# 💅 Humaira Salon & Wedding - Full-Stack Booking System

[![Node.js Version](https://img.shields.io/badge/Node.js-v20.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![Sequelize ORM](https://img.shields.io/badge/Sequelize_ORM-v6.x-52B0E7?style=flat-square&logo=sequelize)](https://sequelize.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Hosting](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Security](https://img.shields.io/badge/Security-JWT%20%26%20Bcrypt-red?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

**Humaira Salon & Wedding Booking System** adalah platform reservasi perawatan kecantikan berbasis web yang dikembangkan khusus untuk mendukung digitalisasi UMKM Humaira Salon. Sistem ini mengusung arsitektur *decoupled full-stack*, memisahkan interaksi visual dinamis (*frontend*) dengan pemrosesan database, autentikasi, serta integrasi gateway (*backend*).

---

## 👥 Tim Pengembang & Pembagian Tugas (Role & Responsibility)

Proyek ini diselesaikan secara kolaboratif sebagai bagian dari portofolio profesional dan Kerja Praktek dengan pembagian peran yang terstruktur:

### 🎨 Frontend UI & UX Engineer
**Elan Nurhaliza**
*   **Desain Antarmuka & Tata Letak**: Merancang visual website menggunakan HTML5 dan Vanilla CSS dengan pendekatan estetika premium, elegan, dan responsif.
*   **Responsivitas Mobile**: Mengoptimalkan grid, layout, dan media queries agar website nyaman diakses dari smartphone pelanggan.
*   **Interaksi Sisi Klien**: Menangani manipulasi DOM, state kuantitas belanja perawatan, visualisasi tab kategori layanan, dan kalkulasi dinamis sementara di browser.

### ⚙️ Backend & Security Engineer
**Audry Nabila**
*   **Desain Arsitektur & Database**: Merancang skema database relasional (ERD) dan mengimplementasikan ORM Sequelize untuk mendukung SQLite (lokal) dan PostgreSQL (produksi).
*   **RESTful API Development**: Membangun endpoint aman untuk manajemen autentikasi user, katalog layanan kecantikan (CRUD), riwayat reservasi, dan panel admin.
*   **Autentikasi & Keamanan API**: Menerapkan sistem otorisasi berbasis **JSON Web Token (JWT)**, enkripsi password searah menggunakan **Bcrypt**, dan mengamankan kredensial rahasia melalui file `.env`.
*   **Integrasi Automated WhatsApp Gateway**: Mengembangkan trigger pengiriman konfirmasi booking otomatis secara asynchronous dari sisi server langsung ke nomor WhatsApp pelanggan.
*   **Deployment & Hosting**: Melakukan migrasi database ke Neon.tech (Postgre) serta men-deploy backend server ke **Vercel Cloud Serverless** lengkap dengan penanganan jalur tulis direktori asinkron `/tmp`.

---

## 🚀 Fitur Utama Sistem

### 💻 Sisi Pelanggan (Frontend & User Flow)
*   **Katalog Interaktif**: Daftar perawatan (rambut, SPA, wedding) yang dimuat secara dinamis dari API database.
*   **Keranjang Belanja Reservasi**: Pelanggan dapat memilih lebih dari satu perawatan sekaligus dengan kuantitas berbeda.
*   **Reservasi Langsung & Otomatis**: Form pengisian nama, tanggal, jam, dan nomor HP yang aman. Setelah berhasil dikirim, sistem otomatis mengarahkan ke nomor WhatsApp Admin dengan draf bukti reservasi yang rapi.
*   **Keamanan anti-tamper**: Mencegah kecurangan pengeditan harga sepihak melalui browser.

### 🛡️ Sisi Pengelola (Backend & Admin Dashboard)
*   **Sistem Auth (Registrasi/Login)**: Otentikasi aman untuk akun admin salon.
*   **Dashboard Manajemen Reservasi**: Menampilkan semua daftar booking masuk secara real-time yang tersimpan di database cloud.
*   **CRUD Katalog Layanan**: Admin dapat mengubah, menambah, atau menghapus menu perawatan dan harga yang tampil di website utama.
*   **Statistik Keuangan**: Grafik ringkasan omzet bulanan, jumlah booking aktif, dan perawatan terlaris untuk mempermudah laporan keuangan salon.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Custom styling, modern layout), JavaScript (ES6+ Fetch API).
*   **Backend Framework**: Node.js, Express.js.
*   **ORM**: Sequelize.
*   **Database**: SQLite (lokal / development), PostgreSQL (cloud / production via Neon.tech).
*   **Hosting**: Vercel.

---

## 📂 Struktur Direktori Proyek

```
📁 Humaira-Salon/
├── 📁 config/
│   └── database.js          # Inisialisasi Sequelize (Postgres / SQLite)
├── 📁 images/               # Aset gambar & ilustrasi visual website
├── 📄 server.js             # Entrypoint utama Express server, routing & database sync
├── 📄 booking.js            # Logika logika fetch API & interaksi WhatsApp di frontend
├── 📄 index.html            # Halaman Beranda utama
├── 📄 about.html            # Halaman Kontak & Informasi Humaira Salon
├── 📄 harga-rambut.html     # Modul booking perawatan rambut
├── 📄 harga-spa.html        # Modul booking perawatan SPA
├── 📄 dashboard.html        # Halaman Dashboard khusus Admin
├── 📄 vercel.json           # File konfigurasi deploy Serverless Vercel
├── 📄 .gitignore            # Mencegah file kredensial (.env, db) terunggah ke GitHub
└── 📄 .env.example          # Template contoh konfigurasi environment variables
```

---

## 🔧 Menjalankan Proyek Secara Lokal

### 1. Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstal **Node.js** (rekomendasi v18 ke atas) dan **Git**.

### 2. Kloning Repositori
```bash
git clone https://github.com/audrynabila28/humaira-salon-booking-system.git
cd humaira-salon-booking-system
```

### 3. Instalasi Dependency
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat salinan dari `.env.example` menjadi `.env` di folder root:
```bash
cp .env.example .env
```
Isi konfigurasi sesuai kebutuhan Anda:
```env
PORT=3000
JWT_SECRET=rahasia_jwt_anda
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password_admin_anda
# Biarkan DATABASE_URL kosong untuk menggunakan SQLite lokal secara otomatis
DATABASE_URL=
```

### 5. Jalankan Server
```bash
npm start
```
Buka browser Anda dan akses `http://localhost:3000`. Database SQLite lokal bernama `database.sqlite` akan otomatis dibuat dan diisi data katalog standar pada saat pertama kali dijalankan.

---

## 🌐 Panduan Deploy ke Vercel

Sistem ini dirancang agar dapat dihosting secara gratis di **Vercel** dengan konfigurasi otomatis:
1.  Hubungkan repositori GitHub Anda ke akun **Vercel**.
2.  Import proyek `humaira-salon-booking-system`.
3.  Masukkan variabel lingkungan (*Environment Variables*) berikut pada halaman pengaturan Vercel:
    *   `JWT_SECRET` (Contoh: String acak panjang)
    *   `ADMIN_EMAIL` (Email masuk admin dashboard)
    *   `ADMIN_PASSWORD` (Password masuk admin dashboard)
    *   `DATABASE_URL` (Opsional - Tautan Postgres Neon.tech jika ingin data permanen)
4.  Klik **Deploy**. Proyek Anda akan aktif dalam hitungan detik!
