require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  // Delete everything
  const u = await db.collection("users").deleteMany({});
  const r = await db.collection("restaurants").deleteMany({});
  const o = await db.collection("orders").deleteMany({});
  const t = await db.collection("tables").deleteMany({});
  const m = await db.collection("menuitems").deleteMany({});

  console.log("✅ Cleanup done:");
  console.log("   Users deleted:", u.deletedCount);
  console.log("   Restaurants deleted:", r.deletedCount);
  console.log("   Orders deleted:", o.deletedCount);
  console.log("   Tables deleted:", t.deletedCount);
  console.log("   Menu items deleted:", m.deletedCount);
  console.log("\n👉 Ab signup karo: http://localhost:5173/signup");
  process.exit();
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
