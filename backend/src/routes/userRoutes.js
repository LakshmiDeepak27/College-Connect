const express = require('express');
const router = express.Router();
const { getProfile } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware');

const { getUserProfile, updateUserProfile, getUserConnections, getUserSuggestions } = require('../controllers/userController');

// The existing profile route comes from authController currently, keeping it for backward compatibility if needed, 
// but adding the new ones
router.get("/profile", protect, getProfile);

// New unified profile routes
router.get("/suggestions", protect, getUserSuggestions);
router.get("/:id", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.get("/connections/:id", protect, getUserConnections);

// Picture upload route
router.post("/upload-profile-picture", protect, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct public URL
        const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
        user.profilePicture = imageUrl;
        await user.save();

        res.status(200).json({ 
            message: 'Profile picture updated', 
            user: { ...user.toObject(), profilePicture: imageUrl } // explicitly returning updated user
        });
    } catch (error) {
        console.error('Error in upload route', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

module.exports = router;