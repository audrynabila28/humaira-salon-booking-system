# 💅 Humaira Salon & Wedding - Full-Stack Booking System

[![Node.js Version](https://img.shields.io/badge/Node.js-v20.x-green?style=flat-square\&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-blue?style=flat-square\&logo=express)](https://expressjs.com/)
[![Sequelize ORM](https://img.shields.io/badge/Sequelize_ORM-v6.x-52B0E7?style=flat-square\&logo=sequelize)](https://sequelize.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-4169E1?style=flat-square\&logo=postgresql)](https://neon.tech/)
[![Hosting](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square\&logo=vercel)](https://vercel.com/)
[![Security](https://img.shields.io/badge/Security-JWT%20%26%20Bcrypt-red?style=flat-square\&logo=jsonwebtokens)](https://jwt.io/)

**Humaira Salon & Wedding Booking System** adalah aplikasi reservasi layanan kecantikan berbasis web yang dirancang untuk membantu proses digitalisasi operasional salon. Sistem ini menerapkan arsitektur **full-stack web application** dengan pemisahan frontend dan backend sehingga lebih mudah dikembangkan, dipelihara, dan di-deploy ke lingkungan produksi.

Aplikasi menyediakan fitur reservasi layanan, manajemen katalog jasa, sistem autentikasi admin, forum konsultasi pelanggan, hingga modul rekrutmen karyawan dalam satu platform terintegrasi.

---

## ✨ Fitur Utama

### 👩‍💼 Fitur Pelanggan

* **Katalog Layanan Dinamis**

  * Menampilkan daftar layanan salon, SPA, dan wedding yang dimuat langsung dari database.

* **Sistem Reservasi Online**

  * Pelanggan dapat memilih beberapa layanan sekaligus dan melakukan pemesanan secara online.

* **WhatsApp Booking Integration**

  * Data reservasi otomatis diformat menjadi pesan siap kirim dan diarahkan ke WhatsApp Admin.

* **Forum Konsultasi Kecantikan**

  * Pelanggan dapat mengajukan pertanyaan, membaca diskusi, serta melihat tanggapan dari pihak salon.

---

### 🛡️ Fitur Administrator

* **Authentication & Authorization**

  * Login administrator menggunakan JSON Web Token (JWT).
  * Password disimpan menggunakan enkripsi Bcrypt.

* **Dashboard Manajemen Reservasi**

  * Mengelola data booking pelanggan.
  * Memantau status reservasi dan riwayat transaksi.

* **Manajemen Katalog Jasa**

  * Menambah, mengubah, dan menghapus layanan salon melalui dashboard admin.

* **Dashboard Rekrutmen**

  * Mengelola data pelamar kerja.
  * Mengirim keputusan rekrutmen melalui WhatsApp Web.

* **Dashboard Konsultasi**

  * Menjawab pertanyaan pelanggan.
  * Mengelola daftar konsultasi dan riwayat diskusi.

* **Newsletter Management**

  * Menyimpan dan mengelola pelanggan yang berlangganan informasi promo.

---

## 🏗️ Arsitektur Sistem

### Backend

* Node.js
* Express.js
* Sequelize ORM
* RESTful API Architecture
* JWT Authentication
* Bcrypt Password Hashing

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* Fetch API

### Database

* SQLite (Development)
* PostgreSQL via Neon (Production)

### Deployment

* Vercel Serverless Functions
* Neon PostgreSQL Cloud Database

---

## 🔒 Keamanan Sistem

* Password hashing menggunakan **Bcrypt**
* Token-based authentication menggunakan **JWT**
* Protected admin routes
* Validasi data pada sisi client dan server
* Middleware authorization untuk endpoint sensitif

---

## 🚀 Teknologi yang Digunakan

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | HTML5, CSS3, JavaScript |
| Backend        | Node.js, Express.js     |
| ORM            | Sequelize               |
| Database       | SQLite, PostgreSQL      |
| Authentication | JWT                     |
| Security       | Bcrypt                  |
| Deployment     | Vercel                  |
| Cloud Database | Neon                    |

---

## 🎯 Tujuan Proyek

Humaira Salon & Wedding Booking System dikembangkan untuk meningkatkan efisiensi proses reservasi, pengelolaan layanan, konsultasi pelanggan, dan rekrutmen karyawan melalui satu platform digital yang terintegrasi, aman, dan mudah digunakan.
