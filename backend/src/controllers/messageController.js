const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get message history between current user and another user
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat history

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
};

// Get list of conversations with last message and unread count
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", currentUserId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", currentUserId] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    'user.password': 0,
                    'user.mobile': 0,
                    'user.email': 0,
                    'user.__v': 0
                }
            },
            { $sort: { 'lastMessage.createdAt': -1 } }
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching conversations", error: error.message });
    }
};

// Mark messages from a specific user as read
exports.markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        await Message.updateMany(
            { sender: userId, receiver: currentUserId, read: false },
            { read: true }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking messages as read", error: error.message });
    }
};

// Get total unread message count
exports.getTotalUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.userId, read: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching unread count", error: error.message });
    }
};
