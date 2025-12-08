import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
const isProd = process.env.NODE_ENV === "production";

if (!SECRET_KEY) {
  console.error("SECRET_KEY is not defined in .env!");
  process.exit(1);
}

// 🔐 JWT GENERATOR UTILITY (DEPLOYMENT SAFE VERSION)
const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  // ⚠️ CRITICAL DEPLOYMENT SETTINGS
  // We force 'secure: true' and 'sameSite: none' because Vercel (Frontend)
  // and Render (Backend) are on different domains using HTTPS.
  res.cookie("token", token, {
    httpOnly: true,      // Prevents XSS attacks
    secure: true,        // REQUIRED for Vercel/Render (HTTPS)
    sameSite: "none",    // REQUIRED for Cross-Origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    path: "/",
  });

  return token;
};

/**
 * 1️⃣ REGISTER USER (Name, Email, Password)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateTokenAndSetCookie(res, newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 2️⃣ LOGIN USER (Email, Password)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password" });

    const token = generateTokenAndSetCookie(res, user);

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 3️⃣ GET USER DATA (Protected Route)
 */
export const GetNameEmail = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ success: false, message: "Invalid token", error: error.message });
  }
};

/**
 * 4️⃣ LOGOUT
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,     // Force Secure for deployment
      sameSite: "none", // Force None for deployment
      path: "/",
    });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};