import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export default async function auth(req, res, next) {
  try {
    // 1. Check for token in Cookies OR Headers
    let token = req.cookies?.token;

    // If no cookie, check Authorization Header (Format: "Bearer <token>")
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2) {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // 3. Fetch User (Optional but safer)
    // We select only needed fields to keep it fast
    const user = await User.findById(decoded.id).select("_id email name");

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
    }

    // 4. Attach to Request
    req.user = {
      id: user._id.toString(), // Ensures controllers using req.user.id work
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    // console.error("Auth Error:", error.message); // Uncomment for debugging
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}