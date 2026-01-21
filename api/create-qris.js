// SIMPAN STOK DI SINI (Edit manual jika ingin menambah stok)
// Format -> "ID_PRODUK": JUMLAH_STOK
let internalStock = {
  "rbx_100": 50,  // Contoh: 100 Robux ada 50 stok
  "rbx_200": 25,  // Contoh: 200 Robux ada 25 stok
  "rbx_500": 10   // Contoh: 500 Robux ada 10 stok
};

export default async function handler(req, res) {
  // Pengaturan agar API bisa diakses dari file HTML (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request browser
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan metode POST" });
  }

  try {
    const { amount, order_id, product_id } = req.body || {};

    // 1. Validasi Input
    if (!amount || !order_id || !product_id) {
      return res.status(400).json({ error: "Data (amount, order_id, product_id) tidak lengkap" });
    }

    // 2. Cek Stok di Memori Server
    const currentStock = internalStock[product_id];
    if (currentStock === undefined) {
      return res.status(404).json({ error: "Produk tidak ditemukan di daftar stok" });
    }

    if (currentStock <= 0) {
      return res.status(400).json({ error: "Maaf, stok produk ini sudah habis!" });
    }

    // 3. Konfigurasi Pakasir
    const project = "fishit-market";
    const api_key = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9";

    // 4. Request QRIS ke Pakasir
    const pakasirRes = await fetch(
      "https://app.pakasir.com/api/transactioncreate/qris",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, api_key, order_id, amount })
      }
    );

    const data = await pakasirRes.json();

    if (pakasirRes.ok) {
      // 5. Kurangi stok jika QRIS berhasil dibuat
      internalStock[product_id] -= 1;
      
      // Tambahkan info sisa stok di respon (opsional)
      data.remaining_stock = internalStock[product_id];
      
      return res.status(200).json(data);
    } else {
      return res.status(pakasirRes.status).json({ 
        error: "Gagal dari Pakasir", 
        details: data 
      });
    }

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
}
