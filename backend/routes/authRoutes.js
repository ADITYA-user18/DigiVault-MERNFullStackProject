import express from "express";
import { 
  sendOtp, 
  verifyOtp, 
  verifyViaPassword, 
  loginSendOtp, 
  loginVerifyOtp, 
  GetNameEmail, 
  logout,
  // 🚀 New Imports
  setup2FA,
  verify2FA,
  loginVerify2FA
} from "../controllers/authController.js";
import middlewareAuth from "../middleware/middlewareAuth.js";

const router = express.Router();

// Signup
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Login (Step 1)
router.post('/verify-pass', verifyViaPassword); // Checks Pass + 2FA Status
router.post('/send-login-otp', loginSendOtp);
router.post('/verify-login-otp', loginVerifyOtp); // Checks OTP + 2FA Status

// 🚀 2FA Routes (Step 2 & Setup)
router.post("/2fa/setup", middlewareAuth, setup2FA);   // Generate QR (Protected)
router.post("/2fa/verify", middlewareAuth, verify2FA); // Enable 2FA (Protected)
router.post("/2fa/login", loginVerify2FA);             // Verify Code to Login (Public)

// User Info & Logout
router.get('/me', middlewareAuth, GetNameEmail);
router.post('/logout', logout);

export default router;