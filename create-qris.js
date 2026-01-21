let internalStock = {
  "reseller-panel": 50,
  "tangan-kanan-panel": 25
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  
  try {
    const { amount, order_id, product_id } = req.body || {};

    if (amount < 1000) return res.status(400).json({ error: "Minimal Rp 1.000" });
    if (!internalStock[product_id] || internalStock[product_id] <= 0) {
      return res.status(400).json({ error: "Stok habis!" });
    }

    const project = "fishit-market";
    const api_key = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9";

    const response = await fetch("https://app.pakasir.com/api/transactioncreate/qris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, api_key, order_id, amount })
    });

    const data = await response.json();
    if (response.ok) internalStock[product_id] -= 1;

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server Error" });
  }
}
