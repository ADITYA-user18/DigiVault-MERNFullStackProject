import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";



export const sendExpiryAlert = async (email, userName, files) => {
  try {
    const fileListHtml = files.map(f => `<li><strong>${f.filename}</strong></li>`).join("");

    await axios.post(
      BREVO_URL,
      {
        sender: { name: "DigiVault Alerts", email: process.env.EMAIL_USER },
        to: [{ email: email }],
        subject: "⚠️ Documents Expiring Soon",
        htmlContent: `
          <div>
            <h3>Hello ${userName},</h3>
            <p>These documents are expiring soon:</p>
            <ul>${fileListHtml}</ul>
            <a href="https://your-frontend-link.com">Go to Dashboard</a>
          </div>
        `
      },
      {
        headers: {
          "api-key": process.env.EMAIL_PASS,
          "Content-Type": "application/json",
          "accept": "application/json"
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Expiry Email Error:", error.response?.data || error.message);
    return false;
  }
};