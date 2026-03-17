const { Server } = require("socket.io");
const Message = require('../models/Message');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        let connectedUserId;
        console.log("User connected:", socket.id);

        // Join a private room with a specific user
        socket.on("join_room", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        // Register user for receiving personal notifications and messages
        socket.on("register_user", (userId) => {
            connectedUserId = userId;
            onlineUsers.set(userId, socket.id);
            socket.join(userId);
            // Broadcast online status
            io.emit("user_status", { userId, status: "online" });
            console.log(`User ${userId} registered and online`);
        });

        // Handle sending messages
        socket.on("send_message", async (data) => {
            const { room, sender, receiver, text } = data;

            try {
                // Save message to MongoDB
                const newMessage = new Message({
                    sender,
                    receiver,
                    text
                });
                await newMessage.save();

                // Broadcast message to the room
                io.to(room).emit("receive_message", newMessage);
            } catch (error) {
                console.error("Error saving message", error);
            }
        });

        // Typing indicators
        socket.on("typing", (data) => {
            socket.to(data.room).emit("typing", data);
        });

        socket.on("stop_typing", (data) => {
            socket.to(data.room).emit("stop_typing", data);
        });

        // Handle message read
        socket.on("message_read", ({ messageId, senderId, receiverId }) => {
            // Notify the sender that the message was read
            io.to(senderId).emit("message_read", { messageId, receiverId });
        });

        socket.on("disconnect", () => {
            if (connectedUserId) {
                onlineUsers.delete(connectedUserId);
                io.emit("user_status", { userId: connectedUserId, status: "offline" });
                console.log(`User ${connectedUserId} offline`);
            }
            console.log("User disconnected:", socket.id);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
