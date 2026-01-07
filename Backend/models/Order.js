const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
  note: { type: String, default: '' }, // 👈 YE LINE ADD KARO
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);