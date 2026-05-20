(function () {
  const phoneNumber = "6289646946880"; // Nomor WhatsApp Humaira Salon
  const API_URL = ''; // Mengarah ke local origin

  // Element selectors
  const serviceListEl = document.getElementById("serviceList");
  const totalEl = document.getElementById("grandTotal");
  const bookingBtn = document.getElementById("bookingBtn");
  const bookingDateEl = document.getElementById("bookingDate");
  const bookingTimeEl = document.getElementById("bookingTime");
  
  const guestInfoSection = document.getElementById("guestInfoSection");
  const memberWelcome = document.getElementById("memberWelcome");
  const guestNameEl = document.getElementById("guestName");
  const guestPhoneEl = document.getElementById("guestPhone");

  let servicesData = [];
  let currentUser = null;

  // Helper format Rupiah
  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  // Helper format Tanggal Indonesia
  function formatDateID(dateValue) {
    if (!dateValue) return "-";
    const date = new Date(dateValue + "T00:00:00");
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  // ON INITIALIZE
  async function init() {
    // 1. Cek status autentikasi pelanggan
    await checkMemberAuth();

    // 2. Muat katalog harga secara dinamis dari API backend
    await loadDynamicCatalog();
  }

  // MEMERIKSA STATUS LOGIN MEMBER
  async function checkMemberAuth() {
    const token = localStorage.getItem("humaira_token");
    if (!token) {
      // Tidak ada token, tampilkan form Tamu (Guest)
      if (guestInfoSection) guestInfoSection.style.display = "grid";
      if (memberWelcome) memberWelcome.style.display = "none";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        currentUser = await response.json();
        if (currentUser.role === 'customer') {
          // Berhasil login sebagai customer, sembunyikan form Guest
          if (guestInfoSection) guestInfoSection.style.display = "none";
          if (memberWelcome) {
            memberWelcome.style.display = "block";
            memberWelcome.innerHTML = `Memesan sebagai member: <strong>${currentUser.name}</strong> (${currentUser.phone}) - <a href="profile.html" style="color: #fff; text-decoration: underline;">Detail Akun</a>`;
          }
        } else {
          // Jika admin, biarkan bertindak sebagai Guest
          if (guestInfoSection) guestInfoSection.style.display = "grid";
          if (memberWelcome) memberWelcome.style.display = "none";
        }
      } else {
        localStorage.removeItem("humaira_token");
      }
    } catch (e) {
      console.error("Gagal verifikasi auth member:", e);
    }
  }

  // LOAD KATALOG LAYANAN SECARA DINAMIS
  async function loadDynamicCatalog() {
    if (!serviceListEl) return;

    try {
      const response = await fetch(`${API_URL}/api/services`);
      if (!response.ok) throw new Error("Gagal mengambil data katalog.");

      const services = await response.json();
      
      // Deteksi kategori berdasarkan judul halaman
      const pageTitle = document.querySelector(".price-header h2").textContent.trim();
      let targetCategory = "rambut";
      if (pageTitle.includes("Wedding")) {
        targetCategory = "wedding";
      } else if (pageTitle.includes("SPA")) {
        targetCategory = "spa";
      }

      // Filter layanan
      servicesData = services.filter(s => s.category === targetCategory);

      if (servicesData.length === 0) {
        serviceListEl.innerHTML = `<p style="text-align: center; padding: 20px; opacity: 0.8;">Belum ada layanan tersedia.</p>`;
        return;
      }

      // Render items
      serviceListEl.innerHTML = servicesData.map(s => `
        <div class="service-item" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}">
          <div class="service-info">
            <h3>${s.name}</h3>
            <p>${formatRupiah(s.price)}</p>
            ${s.description ? `<p style="font-size: 12px; opacity: 0.85; margin-top: 4px; font-weight: 300;">${s.description}</p>` : ''}
          </div>
          <div class="qty-control">
            <button class="qty-btn btn-minus" type="button">-</button>
            <span class="qty">0</span>
            <button class="qty-btn btn-plus" type="button">+</button>
          </div>
        </div>
      `).join('');

      // Attach event listeners
      attachQtyListeners();

    } catch (error) {
      serviceListEl.innerHTML = `<p style="text-align: center; padding: 20px; color: #ff8b8b;">${error.message}</p>`;
    }
  }

  // ATTACH PLUS & MINUS BUTTON EVENT LISTENERS
  function attachQtyListeners() {
    const items = serviceListEl.querySelectorAll(".service-item");
    
    items.forEach(item => {
      const minusBtn = item.querySelector(".btn-minus");
      const plusBtn = item.querySelector(".btn-plus");
      const qtyEl = item.querySelector(".qty");

      plusBtn.addEventListener("click", () => {
        const currentQty = Number(qtyEl.textContent);
        qtyEl.textContent = String(currentQty + 1);
        updateTotal();
      });

      minusBtn.addEventListener("click", () => {
        const currentQty = Number(qtyEl.textContent);
        qtyEl.textContent = String(Math.max(0, currentQty - 1));
        updateTotal();
      });
    });
  }

  // DAPATKAN DAFTAR ITEM YANG DIPILIH
  function getSelectedItems() {
    const selected = [];
    if (!serviceListEl) return selected;

    const items = serviceListEl.querySelectorAll(".service-item");
    items.forEach(item => {
      const id = Number(item.dataset.id);
      const name = item.dataset.name;
      const price = Number(item.dataset.price || 0);
      const qty = Number(item.querySelector(".qty").textContent);

      if (qty > 0) {
        selected.push({
          id,
          name,
          price,
          qty,
          subtotal: price * qty
        });
      }
    });
    return selected;
  }

  // UPDATE GRAND TOTAL BIAYA DI SCREEN
  function updateTotal() {
    const selected = getSelectedItems();
    const total = selected.reduce((sum, item) => sum + item.subtotal, 0);
    if (totalEl) totalEl.textContent = formatRupiah(total);
  }

  // SUBMIT BOOKING RESERVASI
  if (bookingBtn) {
    bookingBtn.addEventListener("click", async () => {
      const selected = getSelectedItems();
      const bookingDate = bookingDateEl ? bookingDateEl.value : "";
      const bookingTime = bookingTimeEl ? bookingTimeEl.value : "";

      // 1. Validasi pemilihan layanan
      if (!selected.length) {
        alert("Pilih minimal 1 layanan kecantikan dulu ya.");
        return;
      }

      // 2. Validasi Tanggal & Waktu
      if (!bookingDate) {
        alert("Silakan tentukan tanggal booking.");
        bookingDateEl && bookingDateEl.focus();
        return;
      }
      if (!bookingTime) {
        alert("Silakan tentukan jam booking.");
        bookingTimeEl && bookingTimeEl.focus();
        return;
      }

      // 3. Validasi Informasi Guest (jika tidak login)
      let guestName = "";
      let guestPhone = "";
      if (!currentUser) {
        guestName = guestNameEl ? guestNameEl.value.trim() : "";
        guestPhone = guestPhoneEl ? guestPhoneEl.value.trim() : "";

        if (!guestName) {
          alert("Silakan isi Nama Anda untuk pemesanan Guest.");
          guestNameEl && guestNameEl.focus();
          return;
        }
        if (!guestPhone) {
          alert("Silakan isi Nomor WhatsApp Anda.");
          guestPhoneEl && guestPhoneEl.focus();
          return;
        }
      }

      try {
        // 4. CEK BENTROK JADWAL (Server-side real-time check)
        const checkConflictResponse = await fetch(`${API_URL}/api/bookings/check-conflict?date=${bookingDate}&time=${bookingTime}`);
        if (!checkConflictResponse.ok) throw new Error("Gagal memeriksa konflik jadwal.");
        
        const conflictData = await checkConflictResponse.json();
        if (conflictData.conflict) {
          alert("Maaf, jam reservasi tersebut sudah dipesan pelanggan lain di sistem. Silakan pilih jam kunjungan lainnya!");
          bookingTimeEl && bookingTimeEl.focus();
          return;
        }

        // 5. KIRIM DATA KE BACKEND API
        const token = localStorage.getItem("humaira_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const payload = {
          booking_date: bookingDate,
          booking_time: bookingTime,
          items: selected.map(item => ({ id: item.id, qty: item.qty })),
          customer_name: currentUser ? currentUser.name : guestName,
          customer_phone: currentUser ? currentUser.phone : guestPhone
        };

        const response = await fetch(`${API_URL}/api/bookings`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || "Gagal menyimpan pesanan.");

        // 6. SUKSES! FORMAT PESAN DAN REDIRECT KE WHATSAPP (Sesuai Permintaan)
        const lines = selected.map(
          (item) => `- ${item.name} x${item.qty} = ${formatRupiah(item.subtotal)}`
        );

        const waMessage = [
          "Halo Humaira Salon & Wedding, saya mau konfirmasi reservasi booking.",
          "",
          `📌 *ID Booking* : #HMS-${resData.bookingId}`,
          `👤 *Nama* : ${resData.customerName}`,
          `📞 *WhatsApp* : ${resData.customerPhone}`,
          `📅 *Tanggal* : ${formatDateID(bookingDate)}`,
          `⏰ *Waktu* : ${bookingTime} WIB`,
          "",
          "*Layanan Perawatan Dipesan* :",
          ...lines,
          "",
          `💵 *Total Pembayaran* : *${formatRupiah(resData.totalPrice)}*`,
          "",
          "Mohon konfirmasi ketersediaan slotnya ya. Terima kasih! ✨"
        ].join("\n");

        alert("Reservasi tersimpan di sistem salon! Halaman akan otomatis diarahkan ke WhatsApp untuk mengirim bukti reservasi ke Admin.");

        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;
        
        // Reset form inputs & kuantitas secara manual agar bersih ketika pengguna menekan tombol kembali
        bookingDateEl.value = "";
        bookingTimeEl.value = "";
        const nameInput = document.getElementById("customerName");
        const phoneInput = document.getElementById("customerPhone");
        if (nameInput) nameInput.value = "";
        if (phoneInput) phoneInput.value = "";
        document.querySelectorAll(".qty-input").forEach((input) => {
          input.value = "0";
        });
        document.querySelectorAll(".service-card").forEach((card) => {
          card.classList.remove("selected");
        });
        
        // Gunakan window.location.href alih-alih window.open agar tidak diblokir oleh Popup Blocker browser setelah aksi asinkron (fetch)
        window.location.href = waUrl;

      } catch (error) {
        alert("Gagal melakukan reservasi: " + error.message);
      }
    });
  }

  // Jalankan inisialisasi awal
  init();
})();