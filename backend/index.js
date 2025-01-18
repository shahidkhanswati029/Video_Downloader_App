import express from "express";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import dotenv from "dotenv";
import { initSocket } from "./controllers/videoController.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Create HTTP server
const server = http.createServer(app);

// Initialize `Socket.IO` with the server


// Pass the server to your custom `initSocket` function
initSocket(server);

// Routes
app.use("/api/videos", videoRoutes);

const PORT = process.env.PORT || 8000;

// Start the server
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
