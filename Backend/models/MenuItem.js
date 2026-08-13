const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  isBestseller: { type: Boolean, default: false }
});

MenuItemSchema.index({ restaurantId: 1, category: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);