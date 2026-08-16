const mongoose = require('mongoose');
require('dotenv').config();

async function getRestaurantId() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Restaurant = require('./models/Restaurant');
    const r = await Restaurant.findOne();
    if (r) {
      console.log('FOUND:', r._id.toString());
    } else {
      console.log('NO RESTAURANTS FOUND');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

getRestaurantId();
