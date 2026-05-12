(function () {
  const phoneNumber = "6289646946880"; // GANTI NOMOR WA BOT
  const serviceItems = document.querySelectorAll(".service-item");
  const totalEl = document.getElementById("grandTotal");
  const bookingBtn = document.getElementById("bookingBtn");
  const bookingDateEl = document.getElementById("bookingDate");
  const bookingTimeEl = document.getElementById("bookingTime");

  if (!serviceItems.length || !totalEl || !bookingBtn) return;

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

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

  function getSelectedItems() {
    const selected = [];
    serviceItems.forEach((item) => {
      const name = item.dataset.name;
      const price = Number(item.dataset.price || 0);
      const qtyEl = item.querySelector(".qty");
      const qty = Number(qtyEl ? qtyEl.textContent : 0);

      if (qty > 0) {
        selected.push({
          name,
          price,
          qty,
          subtotal: price * qty
        });
      }
    });
    return selected;
  }

  function updateTotal() {
    const selected = getSelectedItems();
    const total = selected.reduce((sum, item) => sum + item.subtotal, 0);
    totalEl.textContent = formatRupiah(total);
  }

  serviceItems.forEach((item) => {
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

  bookingBtn.addEventListener("click", () => {
    const selected = getSelectedItems();
    const bookingDate = bookingDateEl ? bookingDateEl.value : "";
    const bookingTime = bookingTimeEl ? bookingTimeEl.value : "";

    if (!selected.length) {
      alert("Pilih minimal 1 layanan dulu ya.");
      return;
    }

    if (!bookingDate) {
      alert("Silakan pilih tanggal booking.");
      bookingDateEl && bookingDateEl.focus();
      return;
    }

    if (!bookingTime) {
      alert("Silakan pilih jam booking.");
      bookingTimeEl && bookingTimeEl.focus();
      return;
    }

    const total = selected.reduce((sum, item) => sum + item.subtotal, 0);
    const lines = selected.map(
      (item) => `- ${item.name} x${item.qty} = ${formatRupiah(item.subtotal)}`
    );

    const message = [
      "Halo, aku mau booking salon.",
      "",
      `Tanggal: ${formatDateID(bookingDate)}`,
      `Jam: ${bookingTime}`,
      "",
      "Pilihan layanan:",
      ...lines,
      "",
      `Total: ${formatRupiah(total)}`,
      "",
      "Terima kasih."
    ].join("\n");

    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  });

  updateTotal();
})();