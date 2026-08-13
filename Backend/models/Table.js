const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    tableNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'payment_pending'],
        default: 'available'
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
});

TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', TableSchema);
