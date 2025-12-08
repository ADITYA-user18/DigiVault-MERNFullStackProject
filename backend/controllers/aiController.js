import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const chatWithDocument = async (req, res) => {
  try {
    const { fileUrl, question, mimeType } = req.body;

    if (!fileUrl || !question) {
      return res.status(400).json({
        success: false,
        message: "Missing file or question",
      });
    }

    // Download PDF
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data);

    let docText = "";

    if (mimeType === "application/pdf") {
      try {
        const parser = new PDFParse(new Uint8Array(fileBuffer));
        const data = await parser.getText();
        docText = data.text;
      } catch (parseError) {
        console.error("PDF Parse Error:", parseError);
        return res.status(400).json({
          success: false,
          message: "Could not extract PDF text.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are supported.",
      });
    }

    if (!docText || docText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF has no readable text — probably scanned.",
      });
    }

    const truncatedText = docText.substring(0, 30000);

const prompt = `
You are DocuAssist — an intelligent assistant that answers questions about documents in a clear, professional, and human-readable format.

DOCUMENT CONTENT:
${truncatedText}

USER QUESTION:
${question}

📌 RESPONSE RULES:

1) First sentence: give a concise direct answer to the user's question.
2) Use plain text for structure — no Markdown symbols like ###, *, or _.
3) Organize your answer into clear sections with uppercase titles, line breaks, and bullets where appropriate.
4) Sections can include (if applicable):
   - Technical/Skills Overview
   - Project/Experience Highlights
   - Education & Certifications
   - Professional Contact/Portfolio
   - Final Impression
5) Make it conversational and professional — readable in a chat window.
6) If the document does not contain the requested information, do NOT say "I cannot find it". Instead, say: 
   "The document does not explicitly mention this, but here are relevant points from the content:" followed by useful information.
7) Keep it concise, factual, and structured for easy reading.
`;




    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.json({
      success: true,
      answer,
    });

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze document.",
    });
  }
};
