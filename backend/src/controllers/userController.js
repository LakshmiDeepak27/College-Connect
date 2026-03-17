const User = require('../models/User');
const Connection = require('../models/Connection');

// Get generic profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('connections', 'username email profilePicture role');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        // req.userId from auth middleware
        const userId = req.userId;
        const { role, department, graduationYear, bio, skills, profilePicture } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role, department, graduationYear, bio, skills, profilePicture },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user connections
exports.getUserConnections = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('connections', 'username email profilePicture role department');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.connections);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get connection suggestions
exports.getUserSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        // Exclude current user and already connected users
        const excludedIds = [currentUser._id, ...currentUser.connections];

        // Also exclude pending requests sent by current user
        const sentRequests = await Connection.find({ sender: req.userId, status: 'pending' });
        const pendingReceiverIds = sentRequests.map(req => req.receiver);
        
        const finalExcludedIds = [...excludedIds, ...pendingReceiverIds];

        const suggestions = await User.find({ _id: { $nin: finalExcludedIds } })
            .select('username profilePicture role department')
            .limit(5);

        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search users with filters
exports.searchUsers = async (req, res) => {
    try {
        const { query, department, graduationYear, role } = req.query;
        const filter = { _id: { $ne: req.userId } };

        if (query) {
            filter.username = { $regex: query, $options: 'i' };
        }
        if (department) {
            filter.department = department;
        }
        if (graduationYear) {
            filter.graduationYear = Number(graduationYear);
        }
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select('username profilePicture role department graduationYear')
            .limit(20);

        // Map users to include connection status
        const usersWithStatus = await Promise.all(users.map(async (user) => {
            const connection = await Connection.findOne({
                $or: [
                    { sender: req.userId, receiver: user._id },
                    { sender: user._id, receiver: req.userId }
                ]
            });
            
            return {
                ...user.toObject(),
                connectionStatus: connection ? connection.status : 'none',
                isSender: connection && connection.sender.toString() === req.userId.toString()
            };
        }));
            
        res.status(200).json(usersWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
