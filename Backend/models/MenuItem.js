const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  isBestseller: { type: Boolean, default: false }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);