import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Shared Transporter Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,             // <--- CHANGE TO 587
  secure: false,         // <--- MUST BE FALSE FOR 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // <--- Fixes "Self-signed certificate" errors on cloud
  },
  // Add timeouts so it fails fast instead of hanging for 5 mins
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 10000      // 10 seconds
});

// 1. Existing OTP Function
export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"DigiVault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your DigiVault Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP for verifying your email is:</p>
        <h1 style="color:blue;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log("Email Error:", error);
    return false;
  }
};

// 2. NEW: Expiry Alert Function
export const sendExpiryAlert = async (email, userName, files) => {
  try {
    // Create a list of files for the email body
    const fileListHtml = files
      .map(
        (f) =>
          `<li style="margin-bottom: 5px;">
             <strong>${f.filename}</strong> <br/>
             <span style="color: red; font-size: 12px;">Expires: ${new Date(f.expiryDate).toDateString()}</span>
           </li>`
      )
      .join("");

    const mailOptions = {
      from: `"DigiVault Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⚠️ Action Required: ${files.length} Documents Expiring Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h2 style="color: #d97706;">Document Expiry Alert</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>The following documents in your secure vault are expiring within the next <strong>3 days</strong>:</p>
          
          <ul style="background-color: #fff7ed; padding: 15px 30px; border-radius: 8px; border: 1px solid #ffedd5;">
            ${fileListHtml}
          </ul>

          <p>Please renew these documents or update your records to ensure your digital life remains organized.</p>
          
          <div style="margin-top: 20px;">
            <a href="http://localhost:5173/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to My Vault
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            You are receiving this email because you enabled expiry reminders in DigiVault.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Expiry alert sent to ${email}`);
    return true;
  } catch (error) {
    console.log("Expiry Email Error:", error);
    return false;
  }
};