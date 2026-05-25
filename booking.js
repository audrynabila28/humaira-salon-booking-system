(function () {
  const phoneNumber = "6289646946880"; // Nomor WhatsApp Humaira Salon
  const API_URL = ''; // Relative path ke API server (Vercel/Localhost)

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

  const cartItemsListEl = document.getElementById("cartItemsList");

  // State Management
  let allServices = [];           // Menyimpan data semua layanan dari server
  let selectedQuantities = {};    // Object key-value { serviceId: quantity }
  let activeCategory = 'rambut';   // Default kategori aktif
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
    // 1. Cek parameter URL untuk menentukan tab aktif awal
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam === 'rambut' || categoryParam === 'spa' || categoryParam === 'wedding') {
      activeCategory = categoryParam;
    }

    // 2. Set status tab aktif di HTML
    updateActiveTabUI();

    // 3. Pasang event listener untuk Tab Kategori
    setupTabListeners();

    // 4. Cek status autentikasi pelanggan
    await checkMemberAuth();

    // 5. Muat data semua layanan dari API backend
    await loadAllServices();
  }

  // UPDATE ACTIVE TAB CLASS DI UI
  function updateActiveTabUI() {
    const tabs = document.querySelectorAll(".category-tab");
    tabs.forEach(tab => {
      if (tab.dataset.category === activeCategory) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  // SETUP EVENT LISTENERS PADA TAB KATEGORI
  function setupTabListeners() {
    const tabs = document.querySelectorAll(".category-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        activeCategory = tab.dataset.category;
        updateActiveTabUI();
        renderServices();
      });
    });
  }

  // MEMERIKSA STATUS LOGIN MEMBER
  async function checkMemberAuth() {
    const token = localStorage.getItem("humaira_token");
    if (!token) {
      if (guestInfoSection) guestInfoSection.style.display = "flex";
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
          if (guestInfoSection) guestInfoSection.style.display = "none";
          if (memberWelcome) {
            memberWelcome.style.display = "block";
            memberWelcome.innerHTML = `Memesan sebagai member: <strong>${currentUser.name}</strong> (${currentUser.phone}) - <a href="profile.html" style="color: var(--accent-gold-glow); text-decoration: underline; font-weight: 600;">Detail Akun</a>`;
          }
        } else {
          if (guestInfoSection) guestInfoSection.style.display = "flex";
          if (memberWelcome) memberWelcome.style.display = "none";
        }
      } else {
        localStorage.removeItem("humaira_token");
      }
    } catch (e) {
      console.error("Gagal verifikasi auth member:", e);
    }
  }

  // LOAD SEMUA LAYANAN DARI API
  async function loadAllServices() {
    if (!serviceListEl) return;

    try {
      const response = await fetch(`${API_URL}/api/services`);
      if (!response.ok) throw new Error("Gagal mengambil data katalog layanan.");

      allServices = await response.json();
      renderServices();
      updateCheckout();

    } catch (error) {
      serviceListEl.innerHTML = `<p style="text-align: center; padding: 20px; color: #ff8b8b;">${error.message}</p>`;
    }
  }

  // RENDER DAFTAR LAYANAN SESUAI KATEGORI AKTIF
  function renderServices() {
    if (!serviceListEl) return;

    // Filter berdasarkan kategori aktif
    const filtered = allServices.filter(s => s.category === activeCategory);

    if (filtered.length === 0) {
      serviceListEl.innerHTML = `<p style="text-align: center; padding: 30px; opacity: 0.8; font-style: italic;">Belum ada layanan tersedia pada kategori ini.</p>`;
      return;
    }

    // Render HTML
    serviceListEl.innerHTML = filtered.map(s => {
      const qty = selectedQuantities[s.id] || 0;
      return `
        <div class="service-item" data-id="${s.id}">
          <div class="service-info">
            <h3>${s.name}</h3>
            <p>${formatRupiah(s.price)}</p>
            ${s.description ? `<p style="font-size: 13px; opacity: 0.8; margin-top: 4px; font-weight: 300; line-height: 1.4;">${s.description}</p>` : ''}
          </div>
          <div class="qty-control">
            <button class="qty-btn btn-minus" data-id="${s.id}" type="button">-</button>
            <span class="qty">${qty}</span>
            <button class="qty-btn btn-plus" data-id="${s.id}" type="button">+</button>
          </div>
        </div>
      `;
    }).join('');

    // Pasang Event Listener Qty Control
    attachQtyListeners();
  }

  // ATTACH PLUS & MINUS BUTTON CLICK HANDLERS
  function attachQtyListeners() {
    const items = serviceListEl.querySelectorAll(".service-item");
    items.forEach(item => {
      const serviceId = Number(item.dataset.id);
      const minusBtn = item.querySelector(".btn-minus");
      const plusBtn = item.querySelector(".btn-plus");
      const qtyEl = item.querySelector(".qty");

      plusBtn.addEventListener("click", () => {
        const currentQty = selectedQuantities[serviceId] || 0;
        selectedQuantities[serviceId] = currentQty + 1;
        qtyEl.textContent = String(selectedQuantities[serviceId]);
        updateCheckout();
      });

      minusBtn.addEventListener("click", () => {
        const currentQty = selectedQuantities[serviceId] || 0;
        if (currentQty > 0) {
          selectedQuantities[serviceId] = currentQty - 1;
          if (selectedQuantities[serviceId] === 0) {
            delete selectedQuantities[serviceId];
          }
          qtyEl.textContent = String(selectedQuantities[serviceId] || 0);
          updateCheckout();
        }
      });
    });
  }

  // DAPATKAN DAFTAR LAYANAN YANG TERPILIH DI CART
  function getSelectedItems() {
    const selected = [];
    Object.keys(selectedQuantities).forEach(idKey => {
      const id = Number(idKey);
      const qty = selectedQuantities[id];
      const service = allServices.find(s => s.id === id);
      if (service && qty > 0) {
        selected.push({
          id: service.id,
          name: service.name,
          category: service.category,
          price: service.price,
          qty: qty,
          subtotal: service.price * qty
        });
      }
    });
    return selected;
  }

  // UPDATE LIVE CHECKOUT PANEL (TOTAL BIAYA & CART SUMMARY LIST)
  function updateCheckout() {
    const selected = getSelectedItems();
    const total = selected.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Update Total Biaya
    if (totalEl) {
      totalEl.textContent = formatRupiah(total);
    }

    // Render Cart Summary List
    if (!cartItemsListEl) return;

    if (selected.length === 0) {
      cartItemsListEl.innerHTML = `<p style="font-size: 13px; opacity: 0.6; font-style: italic;">Belum ada layanan yang dipilih</p>`;
      return;
    }

    cartItemsListEl.innerHTML = selected.map(item => {
      const catPrefix = item.category === 'rambut' ? '💇‍♀️' : (item.category === 'spa' ? '🌸' : '💍');
      return `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-qty">${item.qty}x ${catPrefix} (${formatRupiah(item.price)})</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="cart-item-price">${formatRupiah(item.subtotal)}</span>
            <button class="cart-item-delete" data-id="${item.id}" type="button" title="Hapus Layanan">×</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach listener untuk tombol hapus cepat di keranjang
    const deleteBtns = cartItemsListEl.querySelectorAll(".cart-item-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        delete selectedQuantities[id];
        renderServices(); // Update tampilan list layanan di tab kiri jika sedang aktif
        updateCheckout(); // Update ulang keranjang
      });
    });
  }

  // SUBMIT BOOKING RESERVASI
  if (bookingBtn) {
    bookingBtn.addEventListener("click", async () => {
      const selected = getSelectedItems();
      const bookingDate = bookingDateEl ? bookingDateEl.value : "";
      const bookingTime = bookingTimeEl ? bookingTimeEl.value : "";

      // 1. Validasi minimal memilih 1 layanan
      if (!selected.length) {
        alert("Pilih minimal 1 layanan kecantikan dulu ya.");
        return;
      }

      // 2. Validasi tanggal & jam
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

      // 3. Validasi info Guest (jika belum login)
      let guestName = "";
      let guestPhone = "";
      if (!currentUser) {
        guestName = guestNameEl ? guestNameEl.value.trim() : "";
        guestPhone = guestPhoneEl ? guestPhoneEl.value.trim() : "";

        if (!guestName) {
          alert("Silakan isi Nama Anda untuk pemesanan.");
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
        if (!checkConflictResponse.ok) throw new Error("Gagal memeriksa bentrok jadwal.");
        
        const conflictData = await checkConflictResponse.json();
        if (conflictData.conflict) {
          alert("Maaf, jam reservasi tersebut sudah dipesan pelanggan lain di sistem. Silakan pilih jam kunjungan lainnya!");
          bookingTimeEl && bookingTimeEl.focus();
          return;
        }

        // 5. POST DATA KE BACKEND API
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
        if (!response.ok) throw new Error(resData.message || "Gagal menyimpan reservasi.");

        // 6. FORMAT PESAN WHATSAPP & REDIRECT INSTAN
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
        
        // Reset state & form inputs
        selectedQuantities = {};
        if (bookingDateEl) bookingDateEl.value = "";
        if (bookingTimeEl) bookingTimeEl.value = "";
        if (guestNameEl) guestNameEl.value = "";
        if (guestPhoneEl) guestPhoneEl.value = "";

        renderServices();
        updateCheckout();

        // Redirect langsung ke WhatsApp
        window.location.href = waUrl;

      } catch (error) {
        alert("Gagal melakukan reservasi: " + error.message);
      }
    });
  }

  // Jalankan inisialisasi awal
  init();
})();