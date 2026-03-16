const Message = require('../models/Message');

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
