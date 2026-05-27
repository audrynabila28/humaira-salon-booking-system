(function () {
  const API_URL = ''; // Relative path ke API server
  const WHATSAPP_NUMBER = '6289646946880'; // Nomor WhatsApp Admin Humaira Salon

  // Jalankan ketika DOM siap
  document.addEventListener("DOMContentLoaded", () => {
    initNotifSystem();
  });

  function initNotifSystem() {
    // 1. Injeksi Elemen Lonceng Notifikasi ke dalam Navbar jika belum ada
    const nav = document.querySelector("header.navbar nav");
    if (!nav) return;

    // Pastikan tombol lonceng belum ada
    if (document.getElementById("notifBtn")) return;

    const notifBtn = document.createElement("button");
    notifBtn.className = "notif-btn";
    notifBtn.id = "notifBtn";
    notifBtn.type = "button";
    notifBtn.title = "Riwayat & Status Reservasi Anda";
    notifBtn.innerHTML = `
      <span class="bell-icon">🔔</span>
      <span class="notif-badge" id="notifBadge" style="display: none;">0</span>
    `;
    nav.appendChild(notifBtn);

    // 2. Injeksi Drawer Riwayat Booking ke dalam Body
    const drawerOverlay = document.createElement("div");
    drawerOverlay.className = "notif-drawer-overlay";
    drawerOverlay.id = "notifDrawerOverlay";
    document.body.appendChild(drawerOverlay);

    const drawer = document.createElement("div");
    drawer.className = "notif-drawer";
    drawer.id = "notifDrawer";
    drawer.innerHTML = `
      <div class="drawer-header">
        <h3>🔔 Riwayat Reservasi Anda</h3>
        <button class="drawer-close-btn" id="drawerCloseBtn" type="button">&times;</button>
      </div>
      <div class="drawer-body" id="drawerBody">
        <p style="text-align: center; padding: 30px; opacity: 0.7; font-style: italic;">Memuat riwayat reservasi...</p>
      </div>
    `;
    document.body.appendChild(drawer);

    // 3. Pasang Event Listener
    notifBtn.addEventListener("click", () => {
      openDrawer();
    });

    document.getElementById("drawerCloseBtn").addEventListener("click", () => {
      closeDrawer();
    });

    drawerOverlay.addEventListener("click", () => {
      closeDrawer();
    });

    // 4. Update Badge Lonceng Awal
    updateNotifBadge();
  }

  // BUKA DRAWER
  function openDrawer() {
    document.getElementById("notifDrawerOverlay").classList.add("active");
    document.getElementById("notifDrawer").classList.add("active");
    document.body.style.overflow = "hidden"; // Disable background scrolling
    loadBookingHistory();
  }

  // TUTUP DRAWER
  function closeDrawer() {
    document.getElementById("notifDrawerOverlay").classList.remove("active");
    document.getElementById("notifDrawer").classList.remove("active");
    document.body.style.overflow = ""; // Enable background scrolling
  }

  // FORMAT RUPIAH HELPER
  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  // FORMAT TANGGAL INDONESIA
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

  // AMBIL SEMUA DATA BOOKING (MEMBER & GUEST)
  async function fetchAllBookings() {
    let bookings = [];
    const token = localStorage.getItem("humaira_token");

    // 1. Ambil booking Member jika login
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/bookings/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const memberBookings = await response.json();
          bookings = [...memberBookings];
        }
      } catch (e) {
        console.error("Gagal mengambil booking member:", e);
      }
    }

    // 2. Ambil booking Guest dari localStorage
    let guestIds = [];
    try {
      const localData = localStorage.getItem("humaira_local_bookings");
      if (localData) {
        guestIds = JSON.parse(localData);
      }
    } catch (e) {
      console.error("Gagal membaca localStorage:", e);
    }

    if (guestIds && guestIds.length > 0) {
      try {
        const response = await fetch(`${API_URL}/api/bookings/track?ids=${guestIds.join(",")}`);
        if (response.ok) {
          const guestBookings = await response.json();
          // Gabungkan & filter duplikat
          guestBookings.forEach(gb => {
            if (!bookings.some(b => b.id === gb.id)) {
              bookings.push(gb);
            }
          });
        }
      } catch (e) {
        console.error("Gagal melacak booking guest:", e);
      }
    }

    // Urutkan berdasarkan ID desc (terbaru di atas)
    return bookings.sort((a, b) => b.id - a.id);
  }

  // UPDATE BADGE ANGKA LONCENG
  async function updateNotifBadge() {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;

    try {
      const bookings = await fetchAllBookings();
      // Hitung booking yang aktif (Pending atau Confirmed)
      const activeBookings = bookings.filter(b => b.status === "Pending" || b.status === "Confirmed");

      if (activeBookings.length > 0) {
        badge.textContent = String(activeBookings.length);
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    } catch (e) {
      console.error("Gagal memperbarui lencana notifikasi:", e);
    }
  }

  // RENDER RIWAYAT BOOKING DALAM DRAWER
  async function loadBookingHistory() {
    const body = document.getElementById("drawerBody");
    if (!body) return;

    body.innerHTML = `<div class="drawer-loading"><div class="spinner"></div><p>Memuat status reservasi...</p></div>`;

    try {
      const bookings = await fetchAllBookings();

      if (bookings.length === 0) {
        body.innerHTML = `
          <div class="empty-drawer">
            <span>📭</span>
            <p>Belum ada riwayat reservasi di perangkat ini.</p>
            <button class="drawer-cta" onclick="window.location.href='treatment.html'">Ayo Booking Treatment</button>
          </div>
        `;
        return;
      }

      body.innerHTML = bookings.map(b => {
        const itemsText = b.BookingItems && b.BookingItems.length > 0
          ? b.BookingItems.map(item => `${item.service_name} (x${item.qty})`).join(", ")
          : "Layanan tidak terdata";

        let statusClass = "pending";
        let statusLabel = "Menunggu";
        let statusDesc = "Menunggu konfirmasi slot dari admin.";

        if (b.status === "Confirmed") {
          statusClass = "confirmed";
          statusLabel = "Diterima";
          statusDesc = "Reservasi disetujui! Admin akan segera WhatsApp Anda untuk konfirmasi kehadiran.";
        } else if (b.status === "Done") {
          statusClass = "done";
          statusLabel = "Selesai";
          statusDesc = "Perawatan kecantikan Anda telah selesai. Terima kasih!";
        } else if (b.status === "Cancelled") {
          statusClass = "cancelled";
          statusLabel = "Ditolak";
          statusDesc = "Jadwal penuh / dibatalkan. Silakan lakukan booking ulang di jam lain.";
        }

        // WhatsApp message untuk tanya admin
        const waMsg = encodeURIComponent(
          `Halo Admin Humaira Salon & Wedding, saya ingin menanyakan perihal reservasi saya #HMS-${b.id} atas nama ${b.customer_name} pada tanggal ${formatDateID(b.booking_date)} jam ${b.booking_time} WIB. Bagaimana ketersediaannya?`
        );
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

        // Tombol aksi lokal (Hapus dari riwayat lokal khusus Guest jika dibatalkan/selesai)
        let deleteBtnHtml = "";
        const localData = localStorage.getItem("humaira_local_bookings");
        if (localData) {
          const guestIds = JSON.parse(localData);
          if (guestIds.includes(b.id) && (b.status === "Cancelled" || b.status === "Done")) {
            deleteBtnHtml = `<button class="drawer-card-delete-btn" data-id="${b.id}" title="Hapus dari riwayat lokal">&times;</button>`;
          }
        }

        return `
          <div class="drawer-card">
            ${deleteBtnHtml}
            <div class="drawer-card-header">
              <span class="booking-id">#HMS-${b.id}</span>
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="drawer-card-body">
              <div class="card-row"><strong>Tanggal</strong>: ${formatDateID(b.booking_date)}</div>
              <div class="card-row"><strong>Waktu</strong>: ${b.booking_time} WIB</div>
              <div class="card-row"><strong>Layanan</strong>: <span class="layanan-text">${itemsText}</span></div>
              <div class="card-row"><strong>Total</strong>: <span class="total-text">${formatRupiah(b.total_price)}</span></div>
              <p class="status-desc-text">${statusDesc}</p>
            </div>
            <div class="drawer-card-footer">
              <a href="${waLink}" target="_blank" class="drawer-wa-btn">💬 Tanya Admin via WhatsApp</a>
            </div>
          </div>
        `;
      }).join("");

      // Pasang listener untuk hapus riwayat lokal
      const delBtns = body.querySelectorAll(".drawer-card-delete-btn");
      delBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const idToRemove = Number(btn.dataset.id);
          removeGuestBookingId(idToRemove);
        });
      });

    } catch (error) {
      body.innerHTML = `<p style="text-align: center; color: #ff8b8b; padding: 20px;">Gagal memuat riwayat: ${error.message}</p>`;
    }
  }

  // HAPUS ID GUEST BOOKING DARI LOCAL STORAGE JIKA SUDAH SELESAI/DIBATALKAN
  function removeGuestBookingId(id) {
    if (!confirm("Hapus pesanan ini dari riwayat perangkat Anda?")) return;

    try {
      const localData = localStorage.getItem("humaira_local_bookings");
      if (localData) {
        let guestIds = JSON.parse(localData);
        guestIds = guestIds.filter(item => item !== id);
        localStorage.setItem("humaira_local_bookings", JSON.stringify(guestIds));
        
        // Refresh drawer & update badge
        loadBookingHistory();
        updateNotifBadge();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Ekspos fungsi reload secara global agar bisa di-call dari booking.js
  window.refreshBookingNotificationBadge = updateNotifBadge;

})();
