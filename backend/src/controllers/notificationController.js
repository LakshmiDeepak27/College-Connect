const Notification = require('../models/Notification');

// Fetch all notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// Mark a notification or all notifications as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (notificationId) {
            // Mark specific
            await Notification.findOneAndUpdate(
                { _id: notificationId, user: req.userId },
                { read: true }
            );
        } else {
            // Mark all
            await Notification.updateMany(
                { user: req.userId, read: false },
                { read: true }
            );
        }

        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
};

// Internal Helper method to create a notification (called from other controllers like logic/posts)
exports.createStaticNotification = async (userId, message, actionUrl = "") => {
    try {
        const newNotification = new Notification({
            user: userId,
            message,
            actionUrl
        });
        await newNotification.save();

        // Emit via socket
        try {
            const { getIo } = require('../socket');
            const io = getIo();
            io.to(userId.toString()).emit("new_notification", newNotification);
        } catch (socketError) {
            console.log("Socket emit skipped or failed:", socketError.message);
        }

    } catch (error) {
        console.error("Failed to create internal notification:", error);
    }
};
