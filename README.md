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

### ⚙️ Fullstack Developer
**Audry Nabila**
*   **Perancangan Skema Database**: Merancang arsitektur database relasional (ERD) dan konfigurasi ORM Sequelize (mendukung SQLite untuk lokal dan PostgreSQL untuk produksi).
*   **RESTful API Development**: Membangun seluruh endpoint API backend untuk autentikasi user, katalog jasa (CRUD), riwayat reservasi pelanggan, daftar pelamar karir, dan forum tanya jawab.
*   **Sistem Autentikasi & Keamanan**: Menerapkan otorisasi berbasis **JSON Web Token (JWT)**, enkripsi password searah menggunakan **Bcrypt**, dan proteksi rute halaman admin (*Auth Guard*).
*   **Integrasi WhatsApp Gateway & Click-to-Chat**: Mengembangkan modul trigger booking otomatis serta link click-to-chat `wa.me` semi-otomatis untuk pengiriman keputusan rekrutmen ke WhatsApp pelamar.
*   **Deployment & Hosting**: Konfigurasi deployment serverless Express.js di Vercel Cloud Serverless dan database Neon.tech.

### 🎨 Frontend UI & UX Developer (Fitur Rekrutmen)
**Elan Nurhaliza**
*   **Desain Antarmuka Karir & Rekrutmen**: Merancang visual halaman karir publik `rekrutmen.html` dan dashboard rekrutmen terpisah `admin-rekrutmen.html` menggunakan HTML5 dan Vanilla CSS3.
*   **Interaksi Formulir Lamaran**: Mengimplementasikan validasi form sisi klien, manipulasi DOM, state input berkas pelamar (Nama, Posisi, HP, Email, CV link), dan pengiriman data ke API backend rekrutmen.
*   **Visualisasi Riwayat & Metrik**: Menyusun layout tabel pelamar aktif, riwayat kandidat diterima, dan widget total statistik pelamar kerja yang diterima.

### 💬 Frontend UI & UX Developer (Fitur Forum Konsultasi)
**Azzahra (Ara)**
*   **Desain Antarmuka Forum Diskusi**: Merancang visual halaman forum kecantikan publik `konsultasi.html` dan dashboard kelola konsultasi terpisah `admin-konsultasi.html` bertema glassmorphism yang premium.
*   **Redesain Tata Letak Luas**: Mengubah tata letak formulir tanya-jawab dan feed diskusi terjawab dari model kolom sempit menjadi **Stacked Layout** (lebar 850px-950px) agar nyaman dibaca dan bernuansa forum profesional.
*   **Interaksi Tanya Jawab & Feed**: Menangani rendering dinamis kategori keluhan (Rambut, SPA, Wedding), status badge, serta modal input tanggapan admin salon.

---

## 🚀 Fitur Utama Sistem

### 💻 Sisi Pelanggan (Frontend & User Flow)
*   **Katalog Jasa & Paket**: Daftar perawatan (rambut, SPA, wedding) dimuat dinamis dari API database.
*   **Keranjang Belanja Reservasi**: Pelanggan dapat memilih lebih dari satu perawatan sekaligus dengan kuantitas berbeda.
*   **Reservasi Langsung & WhatsApp Redirect**: Mengisi data booking dan otomatis mengarahkan ke chat WhatsApp Admin dengan format draf bukti reservasi yang rapi.
*   **Forum Diskusi Publik (`konsultasi.html`)**: Wadah lapang bagi pelanggan untuk mengajukan keluhan kecantikan dan membaca saran perawatan dari salon.

### 🛡️ Sisi Pengelola (Backend & Admin Dashboard)
*   **Sistem Auth Keamanan Tinggi**: Otentikasi login akun admin (`- / `-`).
*   **Dashboard Utama**: Mengelola status reservasi pelanggan (ceklis masuk omzet), katalog menu jasa, dan langganan e-mail promo.
*   **Dashboard Recruitment (`admin-rekrutmen.html`)**: Halaman terpisah untuk menyaring berkas, menghapus pelamar (✗), dan mengirim keputusan rekrutmen secara instan via WhatsApp Web.
*   **Dashboard Konsultasi (`admin-konsultasi.html`)**: Halaman terpisah untuk menjawab konsultasi keluhan pelanggan dan melakukan reset bulanan pertanyaan masuk.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Custom styling, modern layout), JavaScript (ES6+ Fetch API).
*   **Backend Framework**: Node.js, Express.js.
*   **ORM**: Sequelize.
*   **Database**: SQLite (lokal / development), PostgreSQL (cloud / production via Neon.tech).
*   **Hosting**: Vercel.

---

## 📂 Struktur Direktori Proyek
