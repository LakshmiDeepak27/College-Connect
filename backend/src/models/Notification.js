const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
