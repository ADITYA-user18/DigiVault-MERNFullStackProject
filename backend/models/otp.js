import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Ensure one active OTP per email
  otp: { type: String, required: true },
  tempPassword: { type: String }, // Store hashed password temporarily (only for signup)
  expiresAt: { type: Date, required: true },
});

// Auto-delete documents after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
