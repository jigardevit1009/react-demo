import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/errorMiddleware";
import { initSocket } from "./config/socket";
import { startReportWorker } from "./modules/reports/report.worker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create Native HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);
startReportWorker();

// Global Express Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// API Routes
app.use("/api", apiRouter);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
    error: "Not Found",
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

// Start HTTP + WebSocket Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints live at http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.IO listening for real-time WebSocket events`);
});
