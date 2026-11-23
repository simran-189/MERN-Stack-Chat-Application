import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:3000",
    process.env.REACT_APP_API_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const userSocketMap = {};

export const getRecieverSocketId = (recieverId) => {
    return userSocketMap[recieverId];
};

console.log("Socket IO initialized");

io.on("connection", (socket) => {

    const userId = socket.handshake.query.userId;

    console.log("User connected:", socket.id);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Send call request
    socket.on("callUser", ({ to, offer, callerName, callType }) => {
        const receiverSocketId = userSocketMap[to];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", {
                from: userId,
                offer,
                callerName,
                callType
            });
        }
    });

    // Accept call
    socket.on("answerCall", ({ to, answer }) => {
        const receiverSocketId = userSocketMap[to];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callAccepted", {
                answer,
                from: userId
            });
        }
    });

    // Exchange ICE candidates
    socket.on("iceCandidate", ({ to, candidate }) => {
        const receiverSocketId = userSocketMap[to];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("iceCandidate", {
                candidate,
                from: userId
            });
        }
    });

    // End call
    socket.on("endCall", ({ to }) => {
        const receiverSocketId = userSocketMap[to];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callEnded");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };