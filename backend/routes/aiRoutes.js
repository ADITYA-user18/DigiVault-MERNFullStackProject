import express from "express";
import middlewareAuth from "../middleware/middlewareAuth.js"; // Adjust path if needed
import { chatWithDocument } from "../controllers/aiController.js";
const router = express.Router();


// Protected Route (User must be logged in)
router.post("/chat", middlewareAuth, chatWithDocument);

export default router;