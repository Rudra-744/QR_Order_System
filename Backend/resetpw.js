require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash("test1234", 10);
  const result = await db.collection("users").updateOne(
    { username: "testuser" },
    { $set: { password: hash } }
  );
  console.log("Password reset done:", result.modifiedCount, "user updated");
  console.log("Username: testuser");
  console.log("New Password: test1234");
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
