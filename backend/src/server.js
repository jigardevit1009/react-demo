import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { sendSuccess } from "./utils/responseHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// 2. REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);

// 3. Health Check Endpoint
app.get("/api/health", (req, res) => {
  return sendSuccess(
    res,
    {
      status: "online",
      database: "Supabase Cloud Database",
      auth: "JWT Authentication Enabled",
      port: PORT,
      timestamp: new Date().toISOString(),
    },
    "Employee & Task API Server is healthy and running",
    200
  );
});

// 4. Server Listener
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 Express Server running on: http://localhost:${PORT}`);
  console.log(`☁️ Database: Supabase Cloud Database`);
  console.log(`🔐 Auth: JWT Authentication Enabled`);
  console.log(`==============================================\n`);
});
