const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: false // Super admins might not have a restaurantId
    },
    role: {
        type: String,
        enum: ['superadmin', 'restaurant_admin'],
        default: 'restaurant_admin'
    }
});

module.exports = mongoose.model('Admin', AdminSchema);
