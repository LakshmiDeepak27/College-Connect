const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectdb = require('./src/config/db')
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const postRoutes = require('./src/routes/postRoutes');
const connectionRoutes = require('./src/routes/connectionRoutes');
const opportunityRoutes = require('./src/routes/opportunityRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
dotenv.config();

//data base - mongodb connection 
connectdb();

const app = express();

const PORT = process.env.PORT || 5000;

const rateLimit = require('express-rate-limit');

app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window`
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
const http = require('http');
const path = require('path');
const { initSocket } = require('./src/socket');
const messageRoutes = require('./src/routes/messageRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
// Removed duplicate import for opportunityRoutes

// Removed duplicate import for eventRoutes

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ... existing code ...
app.use("/api/posts", postRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/events", eventRoutes);

app.get('/', (req, res) => {
    res.send("Backend started running");
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`server started at port: ${PORT}`);
});

