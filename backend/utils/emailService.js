import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export const sendOtpEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      BREVO_URL,
      {
        sender: { name: "DigiVault Security", email: process.env.EMAIL_USER }, // Must be your verified Brevo email
        to: [{ email: email }],
        subject: "Your OTP Code",
        htmlContent: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>DigiVault Verification</h2>
            <p>Your One-Time Password is:</p>
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p style="color: #666; font-size: 12px;">This code is valid for 5 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.EMAIL_PASS, // The xkeysib-... key
          "Content-Type": "application/json",
          "accept": "application/json"
        },
      }
    );

    console.log("✅ Email API Response:", response.data);
    return true;

  } catch (error) {
    // This logs the REAL reason Brevo rejected it
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    return false;
  }
};

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