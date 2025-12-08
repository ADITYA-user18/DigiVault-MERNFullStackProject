import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  files: [
    {
      filename: { type: String, required: true },
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      mimeType: { type: String },
      category: {
        type: String,
        enum: ['Identity', 'Medical', 'Education', 'Work', 'Financial', 'Others'],
        default: 'Others'
      },
      uploadedAt: { type: Date, default: Date.now },
      expiryDate: { type: Date, default: null },
      isAutoDetected: { type: Boolean, default: false }
    }
  ]
});

export default mongoose.model("File", fileSchema);
