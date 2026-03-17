const Connection = require('../models/Connection');
const User = require('../models/User');
const { createStaticNotification } = require('./notificationController');

// Send connection request
exports.sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.userId;

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot connect with yourself" });
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({ message: "Connection or request already exists" });
        }

        const newConnection = new Connection({
            sender: senderId,
            receiver: receiverId
        });

        await newConnection.save();

        // Notify receiver
        const sender = await User.findById(senderId);
        await createStaticNotification(receiverId, `${sender.username} sent you a connection request.`, 'connection_request', senderId, `/connections`);

        res.status(201).json({ message: "Connection request sent", connection: newConnection });
    } catch (error) {
        res.status(500).json({ message: "Error sending request", error: error.message });
    }
};

// Accept connection request
exports.acceptRequest = async (req, res) => {
    try {
        const { connectionId } = req.body; // Changed from req.params to req.body
        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if (connection.receiver.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to accept this request" });
        }

        connection.status = 'accepted';
        await connection.save();

        // Add to both users' connections arrays
        await User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: connection.receiver } });
        await User.findByIdAndUpdate(connection.receiver, { $addToSet: { connections: connection.sender } });

        // Notify sender that their request was accepted
        const receiver = await User.findById(connection.receiver);
        await createStaticNotification(connection.sender, `${receiver.username} accepted your connection request.`, 'connection_accept', receiver._id, `/connections`);

        res.status(200).json({ message: "Connection accepted", connection });
    } catch (error) {
        res.status(500).json({ message: "Error accepting request", error: error.message });
    }
};

// Reject connection request
exports.rejectRequest = async (req, res) => {
    try {
        const { connectionId } = req.body; // Changed from req.params to req.body
        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if (connection.receiver.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to reject this request" });
        }

        // We can either delete the request or set status to rejected. We'll delete it to allow future requests.
        await Connection.findByIdAndDelete(connectionId);

        res.status(200).json({ message: "Connection request rejected" });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting request", error: error.message });
    }
};

// Get user's connection requests (Pending received)
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await Connection.find({ receiver: req.userId, status: 'pending' })
            .populate('sender', 'username profilePicture role department');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests", error: error.message });
    }
};

// Check connection status with another user
exports.checkStatus = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.userId;

        if (currentUserId === targetUserId) {
            return res.status(200).json({ status: 'self' });
        }

        const connection = await Connection.findOne({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId }
            ]
        });

        if (!connection) {
            return res.status(200).json({ status: 'not_connected' });
        }

        if (connection.status === 'accepted') {
            return res.status(200).json({ status: 'connected', connectionId: connection._id });
        }

        if (connection.status === 'pending') {
            if (connection.sender.toString() === currentUserId) {
                return res.status(200).json({ status: 'request_sent', connectionId: connection._id });
            } else {
                return res.status(200).json({ status: 'request_received', connectionId: connection._id });
            }
        }

        return res.status(200).json({ status: connection.status });

    } catch (error) {
        res.status(500).json({ message: "Error checking status", error: error.message });
    }
};

// Get connected users
exports.getConnectionsList = async (req, res) => {
    try {
        const currentUserId = req.userId;
        
        // Find accepted connections where current user is either sender or receiver
        const connections = await Connection.find({
            $or: [
                { sender: currentUserId },
                { receiver: currentUserId }
            ],
            status: 'accepted'
        }).populate('sender', 'username profilePicture role department')
          .populate('receiver', 'username profilePicture role department');

        // Format to return just the connected users, not the connection objects
        const connectedUsers = connections.map(conn => {
            if (conn.sender._id.toString() === currentUserId) {
                return conn.receiver;
            } else {
                return conn.sender;
            }
        });

        res.status(200).json(connectedUsers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching connections", error: error.message });
    }
};
