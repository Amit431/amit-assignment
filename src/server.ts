import http from "http";
import { Server } from "socket.io";
import app from "./app";
import chatSocket from "./sockets";
import connectDB from "./config/db";

// Initialize MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Setup chat WebSocket
chatSocket(io);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
