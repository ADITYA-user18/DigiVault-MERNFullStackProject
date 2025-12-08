import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema({
  // The file being shared (references the subDocument ID in your FileModel)
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // The owner of the file (for security checks)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The unique URL token (e.g., "a1b2c3d4...")
  token: {
    type: String,
    required: true,
    unique: true,
  },
  // When this link dies. If null, it never expires.
  expiresAt: {
    type: Date,
    default: null, 
  },
  // Permissions
  canDownload: {
    type: Boolean,
    default: true, // Default to allow download
  },
   passwordHash: {
    type: String, 
    default: null // Null means "Public Link"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast lookups by token
shareLinkSchema.index({ token: 1 });

export default mongoose.model("ShareLink", shareLinkSchema);