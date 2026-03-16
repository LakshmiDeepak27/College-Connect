const { Server } = require("socket.io");
const Message = require('../models/Message');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join a private room with a specific user
        socket.on("join_room", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
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

        socket.on("disconnect", () => {
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
