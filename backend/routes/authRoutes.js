import express from "express";
import {
  register,
  login,
  GetNameEmail,
  logout
} from "../controllers/authController.js";
import middlewareAuth from "../middleware/middlewareAuth.js";

const router = express.Router();

// Auth Routes
router.post("/register", register);
router.post("/login", login);

// User Info & Logout
router.get('/me', middlewareAuth, GetNameEmail);
router.post('/logout', logout);

export default router;