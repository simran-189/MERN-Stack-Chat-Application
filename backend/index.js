import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import cookieParser from "cookie-parser";

import express from "express";
import "dotenv/config";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 8080;

//middleware
app.use(express.json({extended:true}))
app.use(cookieParser());
const corsOption ={
    origin:'http://localhost:3000',
    credentials:true
};
app.use(cors(corsOption))
//routes
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/message",messageRoutes);
//https:localhost:8080/api/v1/user/register

server.listen(PORT, async () => {
    console.log(`Server listen at port ${PORT}`);

    try {
        await connectDB();
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
});


