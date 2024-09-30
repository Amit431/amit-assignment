import { Server, Socket } from "socket.io";

const chatSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        socket.on("chat message", (msg) => {
            io.emit("chat message", msg); // Broadcast message to all connected clients
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export default chatSocket;
