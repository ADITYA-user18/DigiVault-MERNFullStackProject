import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch fresh user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // Attach clean user object
    req.user = {
      id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
