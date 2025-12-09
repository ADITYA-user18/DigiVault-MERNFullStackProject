import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendExpiryAlert = async (email, userName, files) => {
  try {
    // UPDATED: Now shows filename AND the expiry date
    const fileListHtml = files.map(f => 
      `<li style="margin-bottom: 5px;">
         <strong>${f.filename}</strong> 
         <span style="color: #dc2626;">(Expires: ${new Date(f.expiryDate).toLocaleDateString()})</span>
       </li>`
    ).join("");

    const mailOptions = {
      from: `"DigiVault Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⚠️ Action Required: ${files.length} Documents Expiring Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h3>Hello ${userName},</h3>
          <p>We noticed the following documents in your vault are expiring soon:</p>
          <ul>${fileListHtml}</ul>
          <p>Please renew them or update your records.</p>
          <br/>
          <a href="https://digi-vault-mern-full-stack-project.vercel.app/"}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Go to Dashboard
          </a>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Expiry Alert sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Expiry Email Error:", error);
    return false;
  }
};