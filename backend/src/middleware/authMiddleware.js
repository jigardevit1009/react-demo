import jwt from "jsonwebtoken";
import { sendError } from "../utils/responseHandler.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return sendError(res, "Access denied. Authentication token required.", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret_2026"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 403, error);
  }
};
