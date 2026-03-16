const Post = require('../models/Post');
const User = require('../models/User');
const { createStaticNotification } = require('./notificationController');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = req.body.image || null;

        if (req.file) {
            imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
        }

        const newPost = new Post({
            author: req.userId,
            content,
            image: imageUrl
        });

        const savedPost = await newPost.save();
        await savedPost.populate('author', 'username profilePicture role department');

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { content, image } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        post.content = content !== undefined ? content : post.content;
        post.image = image !== undefined ? image : post.image;
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture role department')
            .populate('comments.user', 'username profilePicture');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// Get feed (all posts sorted by newest)
exports.getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePicture role department')
            .populate('comments.user', 'username profilePicture');

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feed', error: error.message });
    }
};

// Like/Unlike a post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if post has already been liked by this user
        const isLiked = post.likes.includes(req.userId);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.userId);
        } else {
            // Like
            post.likes.push(req.userId);

            // Notify author if it's someone else liking
            if (post.author.toString() !== req.userId) {
                const liker = await User.findById(req.userId);
                await createStaticNotification(post.author, `${liker.username} liked your post.`);
            }
        }

        await post.save();
        res.status(200).json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
};

// Comment on a post
exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.userId,
            text
        };

        post.comments.push(newComment);
        await post.save();

        // Notify author if it's someone else commenting
        if (post.author.toString() !== req.userId) {
            const commenter = await User.findById(req.userId);
            await createStaticNotification(post.author, `${commenter.username} commented on your post: "${text.substring(0, 20)}..."`);
        }

        // Return fully populated post
        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture role department')
            .populate('comments.user', 'username profilePicture');

        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.text = text;
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture role department')
            .populate('comments.user', 'username profilePicture');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Ensure user is comment author OR post author 
        if (comment.user.toString() !== req.userId && post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Use array filter to pull the comment out
        post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture role department')
            .populate('comments.user', 'username profilePicture');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};
