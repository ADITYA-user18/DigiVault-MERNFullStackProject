import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import OtpModel from "../models/otp.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { sendOtpEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 1. IMPORT 2FA LIBRARIES
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const SECRET_KEY = process.env.SECRET_KEY;

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
 * 1️⃣ SEND OTP + SAVE TEMP PASSWORD (SIGNUP)
 */
export const sendOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered. Please login." });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    await OtpModel.findOneAndUpdate(
      { email },
      {
        otp: hashedOtp,
        tempPassword: hashedPassword,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent to email!" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

/**
 * 2️⃣ VERIFY OTP (COMPLETE SIGNUP)
 */
export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required" });

    otp = otp.toString().trim();
    email = email.trim();

    const otpRecord = await OtpModel.findOne({ email });
    if (!otpRecord) return res.status(400).json({ success: false, message: "OTP expired or not found" });

    if (otpRecord.expiresAt < new Date()) {
      await OtpModel.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    const newUser = await User.create({
      email: otpRecord.email,
      password: otpRecord.tempPassword,
      name: otpRecord.email.split("@")[0],
    });

    await OtpModel.deleteOne({ email });

    const token = generateTokenAndSetCookie(res, newUser);

    res.json({
      success: true,
      message: "Signup successful!",
      token,
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 3️⃣ LOGIN VIA EMAIL + PASSWORD (UPDATED FOR 2FA)
 */
export const verifyViaPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password" });

    // --- 🚀 2FA CHECK ---
    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        success: true,
        message: "2FA Required",
        require2FA: true,
        userId: user._id 
      });
    }
    // --- END 2FA CHECK ---

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
 * 4️⃣ LOGIN - SEND OTP
 */
export const loginSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await OtpModel.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent for login!" });
  } catch (error) {
    console.error("Login OTP send error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 5️⃣ LOGIN - VERIFY OTP (UPDATED FOR RECOVERY)
 */
export const loginVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const otpRecord = await OtpModel.findOne({ email });
    if (!otpRecord) return res.status(400).json({ success: false, message: "OTP expired or not found" });

    if (otpRecord.expiresAt < new Date()) {
      await OtpModel.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    await OtpModel.deleteOne({ email }); 

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User record missing" });

    // --- RECOVERY LOGIC ---
    // If the user verifies email OTP, we bypass 2FA (Recovery Mode).
    
    const token = generateTokenAndSetCookie(res, user);

    res.json({
      success: true,
      message: "Login successful (Recovery Mode)!",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login OTP verify error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 6️⃣ GET USER DATA (Protected Route)
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
      user: { id: user._id, email: user.email, name: user.name, isTwoFactorEnabled: user.isTwoFactorEnabled },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ success: false, message: "Invalid token", error: error.message });
  }
};

/**
 * 7️⃣ LOGOUT
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

/**
 * 🚀 8️⃣ 2FA SETUP (GENERATE QR)
 */
export const setup2FA = async (req, res) => {
  try {
    // req.user comes from middlewareAuth
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    // Create temp secret
    const secret = speakeasy.generateSecret({ name: `DigiVault (${userEmail})` });

    // Save secret to DB (2FA is NOT enabled yet, just preparing)
    await User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });

    // Generate QR
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ message: "QR generation failed" });
      
      res.json({ 
        success: true, 
        qrCode: data_url, 
        secret: secret.base32 
      });
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🚀 9️⃣ 2FA VERIFY & ENABLE
 */
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token 
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: "2FA Enabled Successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Code" });
    }
  } catch (error) {
    console.error("2FA Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🚀 🔟 LOGIN WITH 2FA (STEP 2)
 */
export const loginVerify2FA = async (req, res) => {
  try {
    const { userId, token: otpCode } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otpCode
    });

    if (verified) {
      // Code is correct -> Issue JWT Cookie
      const token = generateTokenAndSetCookie(res, user);
      
      return res.json({ 
        success: true, 
        message: "Welcome back!", 
        user: { id: user._id, email: user.email, name: user.name }
      });
    } else {
      return res.status(400).json({ message: "Invalid Authenticator Code" });
    }
  } catch (error) {
    console.error("2FA Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};