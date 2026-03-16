const express = require('express');
const router = express.Router();
const { createPost, updatePost, getFeed, likePost, commentPost, updateComment, deleteComment, deletePost } = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route prefixes will be setup in server.js as /api/posts
router.post('/create', protect, upload.single('image'), createPost);
router.get('/feed', protect, getFeed);
router.post('/like/:postId', protect, likePost);
router.post('/comment/:postId', protect, commentPost);
router.put('/:postId/comment/:commentId', protect, updateComment);
router.delete('/:postId/comment/:commentId', protect, deleteComment);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);

module.exports = router;
