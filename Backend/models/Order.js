const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  orderNumber: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: String,
      qty: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  note: { type: String, default: '' },
  idempotencyKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);