require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🌱 Seeding Menu...");

    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    if (users.length === 0) {
      console.log("❌ No user found. Please signup first!");
      process.exit(1);
    }
    const restaurantId = users[0].restaurantId;

    await MenuItem.deleteMany({});

    const items = [
      {
        name: "OG Laphing",
        price: 109,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Mayo Laphing",
        price: 129,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Cheesy Laphing",
        price: 149,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Soupy Laphing",
        price: 139,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Soup Laphing",
        price: 159,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Peri Peri Laphing",
        price: 179,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Mayo Peri Peri Laphing",
        price: 219,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Cheesy Peri Peri Laphing",
        price: 239,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Nachos Laphing",
        price: 229,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Mayo Nachos Laphing",
        price: 239,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Cheesy Nachos Laphing",
        price: 259,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "Peri Peri Nachos Laphing",
        price: 299,
        category: "Laphing",
        isAvailable: true,
      },
      {
        name: "White Laphing",
        price: 209,
        category: "Laphing",
        isAvailable: true,
      },

      { name: "Veg Ramen", price: 199, category: "Noodles", isAvailable: true },
      {
        name: "Kimchi Ramen",
        price: 199,
        category: "Noodles",
        isAvailable: true,
      },
      {
        name: "Cheesy Ramen",
        price: 199,
        category: "Noodles",
        isAvailable: true,
      },
      {
        name: "Plain Maggi",
        price: 69,
        category: "Noodles",
        isAvailable: true,
      },
      {
        name: "Masala Maggi",
        price: 89,
        category: "Noodles",
        isAvailable: true,
      },
      {
        name: "Cheese Maggi",
        price: 99,
        category: "Noodles",
        isAvailable: true,
      },

      {
        name: "Peri Peri Momos",
        price: 149,
        category: "Momos",
        isAvailable: true,
      },
      {
        name: "Paneer Momos",
        price: 149,
        category: "Momos",
        isAvailable: true,
      },
      {
        name: "Cheese & Corn Momos",
        price: 149,
        category: "Momos",
        isAvailable: true,
      },
      { name: "Jain Momos", price: 149, category: "Momos", isAvailable: true },
      {
        name: "Pan Fry Momos",
        price: 169,
        category: "Momos",
        isAvailable: true,
      },
      { name: "Jhol Momos", price: 199, category: "Momos", isAvailable: true },
      { name: "Soupy Momos", price: 199, category: "Momos", isAvailable: true },
      {
        name: "Cheezy Momos",
        price: 199,
        category: "Momos",
        isAvailable: true,
      },
      {
        name: "Chilli Momos",
        price: 289,
        category: "Momos",
        isAvailable: true,
      },
      {
        name: "Schezwan Momos",
        price: 289,
        category: "Momos",
        isAvailable: true,
      },

      { name: "Masala Corn", price: 179, category: "Sides", isAvailable: true },
      {
        name: "Garlic Bread",
        price: 279,
        category: "Sides",
        isAvailable: true,
      },
      {
        name: "Jalapeno & Cheese Garlic Bread",
        price: 299,
        category: "Sides",
        isAvailable: true,
      },
      {
        name: "Paneer Tikka Garlic Bread",
        price: 299,
        category: "Sides",
        isAvailable: true,
      },
      {
        name: "Peri Peri French Fries",
        price: 219,
        category: "Sides",
        isAvailable: true,
      },
      { name: "Saucy Fries", price: 249, category: "Sides", isAvailable: true },
      { name: "Spring Roll", price: 229, category: "Sides", isAvailable: true },
      { name: "Ramen Wrap", price: 499, category: "Sides", isAvailable: true },
      { name: "Nachos", price: 249, category: "Sides", isAvailable: true },
      {
        name: "Nachos Chaat",
        price: 399,
        category: "Sides",
        isAvailable: true,
      },

      {
        name: "Hazelnut Brownie",
        price: 199,
        category: "Desserts",
        isAvailable: true,
      },
      {
        name: "Brownie w/ Icecream",
        price: 299,
        category: "Desserts",
        isAvailable: true,
      },
      {
        name: "Choco Lava",
        price: 199,
        category: "Desserts",
        isAvailable: true,
      },

      {
        name: "Masala Coke",
        price: 149,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Shikanji",
        price: 149,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Cold Coffee",
        price: 159,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Cold Coffee w/ Icecream",
        price: 199,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Strawberry Cold Coffee",
        price: 299,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Nutella Cold Coffee",
        price: 299,
        category: "Beverages",
        isAvailable: true,
      },
      {
        name: "Hot Coffee",
        price: 109,
        category: "Beverages",
        isAvailable: true,
      },
    ];

    const itemsWithRestaurant = items.map(item => ({
      ...item,
      restaurantId: restaurantId
    }));

    await MenuItem.insertMany(itemsWithRestaurant);
    console.log("✅ Menu Loaded Successfully! Total items:", itemsWithRestaurant.length);
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err);
    process.exit(1);
  });
