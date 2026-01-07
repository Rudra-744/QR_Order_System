const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true
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

module.exports = mongoose.model('Table', TableSchema);
