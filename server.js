require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_only_replace_in_production';

// Admin Credentials (ditentukan statis untuk pemilik salon - gunakan dummy untuk dev)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Menyajikan file-file HTML, CSS, JS statis di port 3000

// Inisialisasi Sequelize (Postgres untuk Production Cloud, SQLite untuk Local Development)
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  const fs = require('fs');
  // Di Vercel, folder root bersifat read-only. Gunakan /tmp jika terpaksa menggunakan SQLite di Vercel.
  const dbFolder = process.env.VERCEL 
    ? '/tmp' 
    : (fs.existsSync(path.join(__dirname, '.data')) ? path.join(__dirname, '.data') : __dirname);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbFolder, 'database.sqlite'),
    logging: false
  });
}

// ==========================================
// DEFINISI SKEMA MODEL DATABASE
// ==========================================

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  promo_subscribed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }, // 'rambut' atau 'wedding'
  price: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true }, // NULL jika Guest / Tamu
  customer_name: { type: DataTypes.STRING, allowNull: false },
  customer_phone: { type: DataTypes.STRING, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  booking_time: { type: DataTypes.STRING, allowNull: false }, // Jam (Format: "10:00")
  total_price: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' } // Pending, Confirmed, Done, Cancelled
});

const BookingItem = sequelize.define('BookingItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  service_name: { type: DataTypes.STRING, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  subtotal: { type: DataTypes.INTEGER, allowNull: false }
});

// Relasi Tabel
Booking.hasMany(BookingItem, { foreignKey: 'booking_id', onDelete: 'CASCADE' });
BookingItem.belongsTo(Booking, { foreignKey: 'booking_id' });
User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// ==========================================
// SEEDING MASTER DATA AWAL (JIKA DATABASE KOSONG)
// ==========================================

const seedData = async () => {
  const count = await Service.count();
  if (count === 0) {
    await Service.bulkCreate([
      // Perawatan Rambut
      { name: 'Potong Rambut', category: 'rambut', price: 45000, description: 'Potong rambut model modern oleh kapster berpengalaman.' },
      { name: 'PR Anak Balita', category: 'rambut', price: 35000, description: 'Potong rambut khusus anak balita dengan ramah dan sabar.' },
      { name: 'Cuci Rambut', category: 'rambut', price: 15000, description: 'Cuci rambut bersih lengkap dengan pijatan kepala ringan.' },
      { name: 'Blow Rambut', category: 'rambut', price: 15000, description: 'Blow rambut untuk tampilan bervolume dan segar.' },
      { name: 'Catok Rambut Vit', category: 'rambut', price: 45000, description: 'Catok rambut dengan tambahan serum vitamin pelindung panas.' },
      { name: 'Vitamin', category: 'rambut', price: 3000, description: 'Serum vitamin pelembab rambut rontok dan kusam.' },
      { name: 'Warna Rambut', category: 'rambut', price: 250000, description: 'Pewarnaan rambut merata menggunakan merk cat premium.' },
      { name: 'Rebonding Mulai dari', category: 'rambut', price: 300000, description: 'Pelurusan rambut bergelombang agar lurus alami.' },
      { name: 'Smoothing Mulai dari', category: 'rambut', price: 350000, description: 'Pelurusan rambut menggunakan keratin agar halus lembut.' },
      { name: 'Krimbath', category: 'rambut', price: 55000, description: 'Creambath rambut ginseng/aloe vera + pijat punggung relaksasi.' },
      { name: 'Krimbath Treat', category: 'rambut', price: 85000, description: 'Creambath perawatan intensif ketombe/rontok tingkat lanjut.' },
      { name: 'Hair Mask', category: 'rambut', price: 60000, description: 'Masker rambut untuk mengembalikan kelembapan alami batang rambut.' },
      { name: 'Hair Spa', category: 'rambut', price: 45000, description: 'Spa rambut menutrisi akar rambut dari polusi udara.' },

      // Paket Wedding
      { name: 'Paket Akad Basic', category: 'wedding', price: 1500000, description: 'Paket rias akad nikah, busana pengantin lengkap, & aksesoris.' },
      { name: 'Paket Resepsi Silver', category: 'wedding', price: 2500000, description: 'Rias pengantin akad & resepsi (2 kali ganti busana) + dekorasi pelaminan standar.' },
      { name: 'Paket Resepsi Gold', category: 'wedding', price: 3500000, description: 'Paket tata rias eksklusif akad & resepsi (3 kali ganti busana) + dekorasi pelaminan mewah + karpet jalan.' },
      { name: 'Paket Makeup Family', category: 'wedding', price: 500000, description: 'Rias wajah natural elegan untuk 2 orang keluarga inti/pendamping.' },
      { name: 'Paket Dekorasi + MUA', category: 'wedding', price: 5000000, description: 'Paket dekorasi pelaminan lengkap + Rias Pengantin + Rias Orang Tua + Rias Penerima Tamu.' },

      // Perawatan SPA
      { name: 'Pijat Tradisional Tubuh', category: 'spa', price: 120000, description: 'Pijat seluruh tubuh 60 menit untuk meredakan penat dan lelah.' },
      { name: 'Lulur Scrub Susu & Rempah', category: 'spa', price: 150000, description: 'Lulur tradisional mengangkat sel kulit mati agar kulit halus bersinar.' },
      { name: 'Massage Refleksi Kaki', category: 'spa', price: 60000, description: 'Pijat refleksi titik saraf kaki untuk melancarkan peredaran darah.' },
      { name: 'Totok Wajah & Facial', category: 'spa', price: 80000, description: 'Rangkaian pembersihan wajah lengkap disertai totok aura wajah.' },
      { name: 'Paket Spa Rileks Humaira', category: 'spa', price: 250000, description: 'Paket kombinasi pijat tubuh, lulur, dan masker wajah premium.' }
    ]);
    console.log('[Database] Berhasil melakukan seed master data katalog layanan.');
  }
};

// Hubungkan dan sinkronisasi database secara aman (lazy load lewat middleware sebelum API jalan)
let isDbSynced = false;
const ensureDbSynced = async (req, res, next) => {
  if (!isDbSynced) {
    try {
      await sequelize.sync();
      await seedData();
      isDbSynced = true;
      console.log('[Database] Database terkoneksi, disinkronkan, dan di-seed.');
    } catch (err) {
      console.error('[Database Error] Gagal sinkronisasi:', err);
      return res.status(500).json({ message: 'Gagal menginisialisasi database.', error: err.message });
    }
  }
  next();
};

app.use('/api', ensureDbSynced);

// ==========================================
// MIDDLEWARE AUTHENTICATION (JWT VERIFICATION)
// ==========================================

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token kedaluwarsa atau tidak valid.' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Otorisasi ditolak. Token tidak ditemukan.' });
  }
};

// Admin Only Middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak. Fitur ini hanya untuk Admin.' });
  }
};

// ==========================================
// ROUTE API 1: AUTENTIKASI (LOGIN & REGISTER)
// ==========================================

// Pendaftaran Pelanggan Baru (Opsional login)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, promo_subscribed } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Lengkapi semua kolom pendaftaran.' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser || email.toLowerCase() === ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      promo_subscribed: !!promo_subscribed
    });

    res.status(201).json({ message: 'Pendaftaran member berhasil! Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal melakukan pendaftaran.', error: error.message });
  }
});

// Login Pelanggan & Admin Statis
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Masukkan email dan password.' });
    }

    // 1. Cek jika masuk sebagai Admin Statis
    if (email.toLowerCase() === ADMIN_EMAIL) {
      const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (isMatch) {
        const token = jwt.sign({ id: 0, email: ADMIN_EMAIL, role: 'admin', name: 'Pemilik Salon' }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({
          message: 'Selamat datang Admin!',
          token,
          user: { name: 'Pemilik Salon', email: ADMIN_EMAIL, role: 'admin' }
        });
      } else {
        return res.status(400).json({ message: 'Password admin salah.' });
      }
    }

    // 2. Cek sebagai Pelanggan di Database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: 'customer', name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'customer', phone: user.phone, promo_subscribed: user.promo_subscribed }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kegagalan login server.', error: error.message });
  }
});

// Mendapatkan data profile aktif (mengambil dari token JWT)
app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ id: 0, name: 'Pemilik Salon', email: ADMIN_EMAIL, role: 'admin' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'promo_subscribed']
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json({ ...user.toJSON(), role: 'customer' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat profil.', error: error.message });
  }
});

// Update status subscription promo dari dashboard profile pelanggan
app.patch('/api/auth/subscribe', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(400).json({ message: 'Admin tidak perlu berlangganan promo.' });
    
    const { promo_subscribed } = req.body;
    await User.update({ promo_subscribed: !!promo_subscribed }, { where: { id: req.user.id } });
    res.json({ message: 'Status langganan newsletter berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal merubah status langganan.', error: error.message });
  }
});

// ==========================================
// ROUTE API 2: KATALOG LAYANAN (Dinamis)
// ==========================================

// Publik: Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.findAll({ order: [['id', 'ASC']] });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat katalog layanan.', error: error.message });
  }
});

// Admin-Only: Tambah layanan baru
app.post('/api/services', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Nama, kategori, dan harga wajib diisi.' });
    }
    const newService = await Service.create({ name, category, price, description });
    res.status(201).json({ message: 'Layanan baru berhasil ditambahkan.', service: newService });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan layanan.', error: error.message });
  }
});

// Admin-Only: Update harga/layanan
app.put('/api/services/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan.' });
    }
    await service.update({ name, price, description });
    res.json({ message: 'Layanan berhasil diperbarui.', service });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui layanan.', error: error.message });
  }
});

// Admin-Only: Hapus layanan
app.delete('/api/services/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan.' });
    }
    await service.destroy();
    res.json({ message: 'Layanan berhasil dihapus dari katalog.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus layanan.', error: error.message });
  }
});

// ==========================================
// ROUTE API 3: SISTEM RESERVASI (BOOKING)
// ==========================================

// Publik/Customer: Mengecek bentrok jadwal
app.get('/api/bookings/check-conflict', async (req, res) => {
  try {
    const { date, time } = req.query;
    if (!date || !time) {
      return res.status(400).json({ message: 'Parameter tanggal dan jam dibutuhkan.' });
    }

    // Jam bentrok jika ada booking di tanggal & jam yang sama dengan status selain Cancelled
    const conflict = await Booking.findOne({
      where: {
        booking_date: date,
        booking_time: time,
        status: { [Op.ne]: 'Cancelled' }
      }
    });

    res.json({ conflict: !!conflict });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengecek ketersediaan jadwal.', error: error.message });
  }
});

// Membuat reservasi baru (Bisa member log in maupun GUEST)
app.post('/api/bookings', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { booking_date, booking_time, items, customer_name, customer_phone } = req.body;

    // 1. Dapatkan user ID jika dia login (Authorization token opsional disematkan)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.role === 'customer' ? decoded.id : null;
      } catch (err) {
        // Abaikan jika token tidak valid/kadaluwarsa, layani sebagai Guest
      }
    }

    // 2. Validasi input dasar
    if (!booking_date || !booking_time || !items || items.length === 0) {
      return res.status(400).json({ message: 'Mohon lengkapi tanggal, jam, dan item perawatan.' });
    }

    // 3. Nama & Telepon opsional dari body jika Guest. Jika login, ambil dari user DB.
    let finalCustomerName = customer_name;
    let finalCustomerPhone = customer_phone;

    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        finalCustomerName = user.name;
        finalCustomerPhone = user.phone;
      }
    }

    if (!finalCustomerName || !finalCustomerPhone) {
      return res.status(400).json({ message: 'Nama pelanggan dan nomor telepon wajib diisi.' });
    }

    // 4. Deteksi Bentrok Jadwal di Server
    const conflictBooking = await Booking.findOne({
      where: {
        booking_date: booking_date,
        booking_time: booking_time,
        status: { [Op.ne]: 'Cancelled' }
      }
    }, { transaction });

    if (conflictBooking) {
      await transaction.rollback();
      return res.status(409).json({
        message: 'Maaf, jam reservasi tersebut baru saja dipesan pelanggan lain. Silakan pilih waktu yang lain!'
      });
    }

    // 5. Kalkulasi Harga Total di Server (Melindungi dari manipulasi harga)
    let grandTotal = 0;
    const itemsToSave = [];

    for (const item of items) {
      const service = await Service.findByPk(item.id);
      if (!service) {
        throw new Error(`Layanan ${item.name} tidak ada di katalog.`);
      }
      const subtotal = service.price * item.qty;
      grandTotal += subtotal;

      itemsToSave.push({
        service_name: service.name,
        qty: item.qty,
        price: service.price,
        subtotal: subtotal
      });
    }

    // 6. Simpan Booking Header
    const newBooking = await Booking.create({
      user_id: userId,
      customer_name: finalCustomerName,
      customer_phone: finalCustomerPhone,
      booking_date,
      booking_time,
      total_price: grandTotal,
      status: 'Pending'
    }, { transaction });

    // 7. Simpan Booking Items Detail
    const details = itemsToSave.map(item => ({
      ...item,
      booking_id: newBooking.id
    }));
    await BookingItem.bulkCreate(details, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Reservasi berhasil disimpan ke sistem!',
      bookingId: newBooking.id,
      totalPrice: grandTotal,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message || 'Gagal memproses booking.', error: error.message });
  }
});

// Member-Only: Mendapatkan riwayat booking pribadi
app.get('/api/bookings/my', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Hanya pelanggan yang dapat melihat riwayat pribadi.' });
    }

    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [BookingItem],
      order: [['id', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat booking.', error: error.message });
  }
});

// ==========================================
// ROUTE API 4: DASHBOARD ADMIN ONLY
// ==========================================

// Admin-Only: Mengambil semua booking masuk
app.get('/api/bookings/admin', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [BookingItem],
      order: [['id', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat seluruh data booking.', error: error.message });
  }
});

// Admin-Only: Mengubah status booking
app.patch('/api/bookings/:id/status', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Done', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Data booking tidak ditemukan.' });
    }

    await booking.update({ status });
    res.json({ message: `Status booking #${booking.id} berhasil diubah ke ${status}.`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah status booking.', error: error.message });
  }
});

// Admin-Only: Statistik Dashboard
app.get('/api/admin/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    // 1. Hitung total pendapatan dari booking berstatus 'Done' atau 'Confirmed'
    const totalRevenue = await Booking.sum('total_price', {
      where: { status: ['Confirmed', 'Done'] }
    }) || 0;

    // 2. Hitung jumlah booking per status
    const pendingCount = await Booking.count({ where: { status: 'Pending' } });
    const confirmedCount = await Booking.count({ where: { status: 'Confirmed' } });
    const doneCount = await Booking.count({ where: { status: 'Done' } });

    // 3. Daftar e-mail pelanggan yang berlangganan promo newsletter
    const promoSubscribers = await User.findAll({
      where: { promo_subscribed: true },
      attributes: ['name', 'email', 'phone'],
      order: [['id', 'DESC']]
    });

    res.json({
      stats: {
        totalRevenue,
        pendingCount,
        confirmedCount,
        doneCount,
        totalBookings: pendingCount + confirmedCount + doneCount
      },
      subscribers: promoSubscribers
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat statistik admin.', error: error.message });
  }
});

// ==========================================
// BOOTSTRAP EXPRESS SERVER
// ==========================================

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 Humaira Salon & Wedding Backend BERHASIL DIJALANKAN!`);
    console.log(`🌐 Alamat Akses Website Lokal : http://localhost:${PORT}`);
    console.log(`📁 File Database SQLite      : ${path.join(__dirname, 'database.sqlite')}`);
    console.log(`🔑 Akun Default Admin         : email: ${ADMIN_EMAIL}`);
    console.log(`                               password: ${ADMIN_PASSWORD}`);
    console.log(`================================================================`);
  });
}

module.exports = app;
