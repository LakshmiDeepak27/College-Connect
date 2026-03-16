const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ""
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema]
}, { timestamps: true });

// Index for getting feed sorted by newest
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
