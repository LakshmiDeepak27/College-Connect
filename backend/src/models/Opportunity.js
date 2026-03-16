const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String, // e.g., 'Full-time', 'Part-time', 'Internship', 'Freelance'
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    applicationLink: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
module.exports = Opportunity;
