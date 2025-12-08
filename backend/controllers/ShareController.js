import ShareLink from "../models/ShareLink.js";
import FileModel from '../models/File.js';
import AccessLog from "../models/AccessLog.js"; 
import crypto from "crypto";
import bcrypt from "bcryptjs";

// 1. GENERATE SHARE LINK (Updated with Password Hashing)
export const generateShareLink = async (req, res) => {
  try {
    const { fileId, expiresIn, canDownload, password } = req.body; // Added password
    const userId = req.user.id;

    // A. Verify the file actually belongs to the user
    const vault = await FileModel.findOne({ userId });
    if (!vault) return res.status(404).json({ message: "Vault not found" });

    // Check if file exists in the user's files array
    const fileExists = vault.files.id(fileId);
    if (!fileExists) return res.status(404).json({ message: "File not found" });

    // B. Calculate Expiry Date
    let expiryDate = null;
    if (expiresIn && expiresIn !== "never") {
      const now = new Date();
      if (expiresIn === "1h") expiryDate = new Date(now.getTime() + 60 * 60 * 1000);
      else if (expiresIn === "24h") expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      else if (expiresIn === "7d") expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // C. Generate Unique Token
    const token = crypto.randomBytes(16).toString("hex");

    // D. Hash Password (If provided)
    let passwordHash = null;
    if (password && password.trim().length > 0) {
        passwordHash = await bcrypt.hash(password, 10);
    }

    // E. Save to DB
    const newLink = await ShareLink.create({
      fileId,
      userId,
      token,
      expiresAt: expiryDate,
      canDownload: canDownload !== undefined ? canDownload : true,
      passwordHash: passwordHash, // Save the hash
    });

    return res.status(201).json({
      success: true,
      message: "Link generated successfully",
      link: `/share/${token}`,
      token: token,
      expiresAt: expiryDate
    });

  } catch (error) {
    console.error("Generate Link Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. GET PUBLIC FILE (Updated with Password Verification)
export const getPublicFile = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Check for password in headers
    const providedPassword = req.headers['x-share-password']; 

    // A. Find the link
    const link = await ShareLink.findOne({ token });

    if (!link) {
      return res.status(404).json({ success: false, message: "Link invalid or deleted" });
    }

    // B. Check Expiry
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ success: false, message: "This link has expired" });
    }

    // --- 🔒 PASSWORD CHECK LOGIC START ---
    if (link.passwordHash) {
        // 1. If user hasn't sent a password yet, tell frontend it's locked
        if (!providedPassword) {
            return res.status(401).json({ 
                success: false, 
                isLocked: true, 
                message: "Password Required" 
            });
        }

        // 2. If user sent a password, verify it
        const isMatch = await bcrypt.compare(providedPassword, link.passwordHash);
        if (!isMatch) {
            return res.status(403).json({ 
                success: false, 
                isLocked: true, 
                message: "Incorrect Password" 
            });
        }
    }
    // --- PASSWORD CHECK LOGIC END ---

    // C. Fetch the actual file details from the owner's vault
    const vault = await FileModel.findOne({ userId: link.userId });
    if (!vault) return res.status(404).json({ message: "Owner vault not found" });

    const file = vault.files.id(link.fileId);
    if (!file) return res.status(404).json({ message: "Original file was deleted" });

    // --- 🛡️ LOGGING LOGIC ---
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      await AccessLog.create({
        fileId: link.fileId,
        ownerId: link.userId,
        ipAddress: ip,
        userAgent: userAgent,
        accessedAt: new Date()
      });
      
      console.log(`📝 Logged access for file: ${file.filename}`);
    } catch (logErr) {
      console.error("Logging failed (Non-fatal):", logErr);
    }

    // D. Return safe data
    return res.status(200).json({
      success: true,
      file: {
        filename: file.filename,
        url: file.url,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt
      },
      permissions: {
        canDownload: link.canDownload
      }
    });

  } catch (error) {
    console.error("Public Access Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. GET ACTIVE LINKS
export const getActiveLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await ShareLink.find({ userId })
      .populate("fileId", "filename mimeType") 
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      links: links.map(link => ({
        _id: link._id,
        file: link.fileId,
        token: link.token,
        expiresAt: link.expiresAt,
        isSecured: !!link.passwordHash, // Inform frontend if it's password protected
        views: link.views || 0
      }))
    });

  } catch (error) {
    console.error("Get Active Links Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. REVOKE LINK
export const revokeLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user.id;

    const link = await ShareLink.findOneAndDelete({
      _id: linkId,
      userId: userId
    });

    if (!link) {
      return res.status(404).json({ success: false, message: "Link not found or permission denied" });
    }

    return res.status(200).json({ success: true, message: "Link revoked successfully" });

  } catch (error) {
    console.error("Revoke Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. GET ACCESS LOGS
export const getAccessLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const logs = await AccessLog.find({ ownerId: userId })
      .sort({ accessedAt: -1 })
      .limit(50);

    const vault = await FileModel.findOne({ userId });
    
    const enrichedLogs = logs.map(log => {
      const fileDetails = vault ? vault.files.id(log.fileId) : null;
      
      return {
        _id: log._id,
        filename: fileDetails ? fileDetails.filename : "Unknown/Deleted File",
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        accessedAt: log.accessedAt
      };
    });

    res.json({ success: true, logs: enrichedLogs });
  } catch (error) {
    console.error("Get Logs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};