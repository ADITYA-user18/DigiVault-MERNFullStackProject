import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,             // Back to standard TLS port
  secure: false,         // Must be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4,             // <--- 🔴 THE MAGIC FIX: Forces IPv4
  connectionTimeout: 10000 
});

export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"DigiVault Security" <${process.env.EMAIL_USER}>`, // Must match your verified Brevo email
      to: email,
      subject: "Your DigiVault Verification Code",
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>DigiVault Verification</h2>
          <p>Your One-Time Password is:</p>
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666; font-size: 12px;">This code is valid for 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email Sent via Brevo");
    return true;

  } catch (error) {
    console.error("❌ Email Error:", error);
    return false;
  }
};

// ... Include your sendExpiryAlert function here as well ...
export const sendExpiryAlert = async (email, userName, files) => {
    // ... keep existing logic, just ensure it uses the 'transporter' defined above ...
    try {
        const fileListHtml = files.map(f => `<li><strong>${f.filename}</strong></li>`).join("");
        await transporter.sendMail({
            from: `"DigiVault Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "⚠️ Documents Expiring Soon",
            html: `<h3>Hello ${userName}</h3><p>Expiring files:</p><ul>${fileListHtml}</ul>`
        });
        return true;
    } catch(err) {
        return false;
    }
}