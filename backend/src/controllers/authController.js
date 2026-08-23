import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "super_secret_jwt_key_react_demo_2026";

/**
 * @desc    Login user with genuine signed JWT token
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required", 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !dbUser) {
      return sendError(
        res,
        "Invalid email or password. Please verify your credentials or register a new account.",
        401,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) {
      return sendError(
        res,
        "Invalid email or password. Please verify your credentials or register a new account.",
        401,
      );
    }

    const authenticatedUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    // Generate signed JWT token (valid for 7 days)
    const token = jwt.sign(
      {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return sendSuccess(
      res,
      { user: authenticatedUser, token },
      "Logged in successfully with genuine JWT",
      200,
    );
  } catch (error) {
    return sendError(res, "Login process error", 500, error);
  }
};

/**
 * @desc    Register a new user in Supabase
 * @route   POST /api/auth/register
 */
export const register = async (req, res) => {
  const { name, email, password, role = "Developer" } = req.body;

  if (!name || !email || !password) {
    return sendError(res, "Full name, email, and password are required", 400);
  }

  if (password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long", 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return sendError(
        res,
        "An account with this email already exists. Please sign in.",
        409,
      );
    }

    // 2. Hash password with bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into Supabase users table
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role,
        },
      ])
      .select("id, name, email, role")
      .single();

    if (error || !newUser) {
      return sendError(
        res,
        "Failed to create account in database: " + (error?.message || "Unknown error"),
        500,
        error,
      );
    }

    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: "7d" });

    return sendSuccess(
      res,
      { user: newUser, token },
      "Account registered successfully",
      201,
    );
  } catch (error) {
    return sendError(res, "Registration failed", 500, error);
  }
};

/**
 * @desc    Reset / Forgot Password for existing user
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return sendError(res, "Email and new password are required", 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, "New password must be at least 6 characters long", 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findError || !existingUser) {
      return sendError(res, "No account found with this email address", 404);
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update password in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword, updated_at: new Date() })
      .eq("id", existingUser.id);

    if (updateError) {
      return sendError(res, "Failed to update password in database", 500, updateError);
    }

    return sendSuccess(
      res,
      { email: existingUser.email },
      "Password has been reset successfully. You can now log in with your new password.",
      200,
    );
  } catch (error) {
    return sendError(res, "Password reset failed", 500, error);
  }
};

/**
 * @desc    Verify current JWT
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return sendSuccess(res, req.user, "User profile verified via JWT", 200);
};
