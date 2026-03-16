const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String, // Can be physical address or virtual link
        required: true
    },
    type: {
        type: String,
        enum: ['Virtual', 'In-Person'],
        default: 'Virtual'
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
