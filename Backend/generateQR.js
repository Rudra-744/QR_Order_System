require("dotenv").config();
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// ── CONFIG — Change these ─────────────────────────────────────────────────────
const FRONTEND_URL = "http://192.168.1.7:5173"; // Local IP — phone same WiFi pe ho
const TABLES = [1, 2, 3, 4, 5]; // kitne tables chahiye
const OUTPUT_DIR = path.join(__dirname, "..", "QR-Code");
// ─────────────────────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  // Get the first (and only) user's restaurantId
  const users = await db.collection("users").find({}).toArray();

  if (users.length === 0) {
    console.log("❌ Koi user nahi mila! Pehle signup karo:");
    console.log("   http://localhost:5173/signup");
    process.exit(1);
  }

  const user = users[0];
  const restaurantId = user.restaurantId;

  console.log(`\n✅ User found: ${user.username}`);
  console.log(`📍 Restaurant ID: ${restaurantId}`);
  console.log(`\n🔄 Generating QR codes for ${TABLES.length} tables...\n`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate QR for each table
  for (const table of TABLES) {
    const url = `${FRONTEND_URL}/menu?restaurantId=${restaurantId}&table=${table}`;
    const filePath = path.join(OUTPUT_DIR, `Table-${table}.png`);

    await QRCode.toFile(filePath, url, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    console.log(`  ✅ Table ${table} → ${filePath}`);
    console.log(`     URL: ${url}`);
  }

  console.log(`\n🎉 Done! QR codes saved in: ${OUTPUT_DIR}`);
  console.log(`\n📱 Customer URL for Table 1:`);
  console.log(`   ${FRONTEND_URL}/menu?restaurantId=${restaurantId}&table=1`);
  process.exit();
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
