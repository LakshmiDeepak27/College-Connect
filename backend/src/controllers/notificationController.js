const Notification = require('../models/Notification');

// Fetch all notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId })
            .populate('relatedUserId', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// Mark a notification as read (or all)
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params; // Using id from PATCH /read/:id

        if (id) {
            // Mark specific
            await Notification.findOneAndUpdate(
                { _id: id, userId: req.userId },
                { isRead: true }
            );
        } else {
            return res.status(400).json({ message: "No notification ID provided" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.userId, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
};

// Internal Helper method to create a notification (called from other controllers like logic/posts)
exports.createStaticNotification = async (userId, message, type = "general", relatedUserId = null, actionUrl = "") => {
    try {
        const newNotification = new Notification({
            userId,
            type,
            message,
            relatedUserId,
            actionUrl
        });
        await newNotification.save();

        // Emit via socket
        try {
            const { getIo } = require('../socket');
            const io = getIo();
            // Populate related user for realtime client
            const populatedNotif = await Notification.findById(newNotification._id).populate('relatedUserId', 'username profilePicture');
            io.to(userId.toString()).emit("new_notification", populatedNotif);
        } catch (socketError) {
            console.log("Socket emit skipped or failed:", socketError.message);
        }

    } catch (error) {
        console.error("Failed to create internal notification:", error);
    }
};
