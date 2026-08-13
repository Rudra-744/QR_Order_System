const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    currency: {
        type: String,
        default: 'USD'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'trial'],
        default: 'trial'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
