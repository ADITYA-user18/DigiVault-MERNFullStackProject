import FileModel from '../models/File.js'
import cloudinary from '../services/cloudinary.js'
import mongoose from 'mongoose';
import { detectExpiryDate } from '../utils/ocrService.js'; 

// 1. UPLOAD FILE
export const uploadFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file provided" });

    // Determine resource_type
    const mime = req.file.mimetype;

    // Sanitize filename
    const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const extension = req.file.originalname.split('.').pop().toLowerCase();

    // Robust Detection: Check MIME OR Extension
    const isPdf = mime === "application/pdf" || extension === "pdf";
    const isDoc =
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword" ||
      extension === "docx" ||
      extension === "doc";

    let resourceType = "image";
    let isRaw = false;

    if (isDoc || isPdf) {
      resourceType = "raw";
      isRaw = true;
    }

    console.log(`Uploading: ${sanitizedFilename} (Ext: ${extension}) as ${resourceType}`);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {

      const uploadOptions = {
        folder: `vault/${req.user.id}`,
        resource_type: resourceType,
      };

      const uniqueId = `${Date.now()}_${sanitizedFilename}`;

      if (isRaw) {
        // RAW FILES (PDF, DOCX)
        uploadOptions.public_id = uniqueId;
        uploadOptions.use_filename = false;
        uploadOptions.unique_filename = false;
      } else {
        // IMAGES
        uploadOptions.public_id = uniqueId.replace(/\.[^/.]+$/, "");
        uploadOptions.use_filename = true;
        uploadOptions.unique_filename = true;
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // --- 🚀 NEW: AUTO-EXPIRY DETECTION LOGIC START ---
    
    let detectedExpiry = null;
    let isAutoDetected = false;

    // We only run OCR on images because Tesseract works best on them.
    // If it is a PDF ('raw'), we skip auto-detection for now.
    if (resourceType === 'image') {
        console.log("🤖 Starting Smart Scan on image...");
        detectedExpiry = await detectExpiryDate(result.secure_url);
        
        if (detectedExpiry) {
            isAutoDetected = true;
            console.log("✅ Smart Scan found date:", detectedExpiry);
        } else {
            console.log("❌ Smart Scan found no dates.");
        }
    }

    // DECISION LOGIC:
    // 1. If user selected a date manually in UI, that takes priority.
    // 2. If not, use the auto-detected date.
    // 3. Otherwise, null.
    let finalExpiry = null;

    if (req.body.expiryDate) {
        finalExpiry = new Date(req.body.expiryDate);
        // If user manually set it, we don't count it as "auto detected" for the UI badge
        isAutoDetected = false; 
    } else if (detectedExpiry) {
        finalExpiry = detectedExpiry;
    }

    // --- AUTO-EXPIRY DETECTION LOGIC END ---

    const category = req.body.category || 'Others';

    const fileData = {
      filename: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      category: category,
      uploadedAt: new Date(),
      // Save the new fields
      expiryDate: finalExpiry,
      isAutoDetected: isAutoDetected
    };

    // Find and update, or create new vault if not exists
    const updatedVault = await FileModel.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { files: fileData } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Get the specific file object we just pushed to return its full data (including _id)
    const savedFile = updatedVault.files[updatedVault.files.length - 1];

    return res.json({
      success: true,
      message: isAutoDetected 
        ? "File uploaded & expiry detected!" 
        : "File uploaded successfully",
      file: savedFile,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// 2. GET FILES
export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const vault = await FileModel.findOne({ userId });

    if (!vault || !vault.files) {
      return res.status(200).json({
        success: true,
        files: []
      });
    }

    // Sort files by newest first
    const sortedFiles = vault.files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({
      success: true,
      files: sortedFiles
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// 3. DELETE FILE
export const deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ success: false, message: "File ID is required" });
    }

    const vault = await FileModel.findOne({ userId });

    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault not found" });
    }

    const fileToDelete = vault.files.id(fileId);

    if (!fileToDelete) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Determine resource_type for Cloudinary deletion
    const mime = fileToDelete.mimeType;
    const isDoc =
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword";
    const isPdf = mime === "application/pdf";

    let resourceType = "image";
    if (isDoc || isPdf) {
      resourceType = "raw";
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(fileToDelete.publicId, { resource_type: resourceType });

    // Remove from database
    vault.files.pull(fileId);
    await vault.save();

    return res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting file"
    });
  }
};

// 4. RENAME FILE (NEW FEATURE)
export const renameFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileId, newFilename } = req.body;

    // Basic Validation
    if (!fileId || !newFilename) {
      return res.status(400).json({
        success: false,
        message: "File ID and new filename are required",
      });
    }

    // Find the user's vault
    const vault = await FileModel.findOne({ userId });

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Vault not found",
      });
    }

    // Find the specific subdocument inside the files array
    // Mongoose arrays have an .id() method to find subdocs by _id
    const fileToUpdate = vault.files.id(fileId);

    if (!fileToUpdate) {
      return res.status(404).json({
        success: false,
        message: "File not found in your vault",
      });
    }

    // Update the filename
    fileToUpdate.filename = newFilename;

    // Save the parent document (the vault)
    await vault.save();

    return res.status(200).json({
      success: true,
      message: "File renamed successfully",
      file: fileToUpdate, // Return the updated file object
    });

  } catch (error) {
    console.error("Rename Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




// ... existing imports

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email; // Assuming middleware adds name to req.user

    const vault = await FileModel.findOne({ userId });

    if (!vault || !vault.files) {
      return res.status(200).json({
        success: true,
        userEmail,
        stats: { total: 0, images: 0, pdfs: 0, docs: 0 },
        recentFiles: []
      });
    }

    const files = vault.files;

    // 1. Calculate Stats
    const stats = {
      total: files.length,
      images: files.filter(f => f.mimeType.startsWith('image/')).length,
      pdfs: files.filter(f => f.mimeType === 'application/pdf').length,
      docs: files.filter(f => 
        f.mimeType.includes('word') || 
        f.mimeType.includes('document') ||
        f.mimeType.includes('text')
      ).length
    };

    // 2. Get Recent Files (Sort desc by date -> take top 5)
    const recentFiles = [...files]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      userEmail,
      stats,
      recentFiles
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};