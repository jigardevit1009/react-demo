import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// 1. Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());



// 4. Server Listener
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 Express Server running on: http://localhost:${PORT}`);
  console.log(`☁️ Database: Supabase Cloud Database`);
  console.log(`🔐 Auth: JWT Authentication Enabled`);
  console.log(`==============================================\n`);
});

