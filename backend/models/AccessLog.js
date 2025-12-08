import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ipAddress: String,
  userAgent: String, // Browser/Device info
  location: String,  // We'll approximate this or leave blank for now
  accessedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AccessLog", accessLogSchema);