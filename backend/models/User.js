import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        // 2. The Secret Key (Used to generate/verify codes)
        twoFactorSecret: {
            type: String,
        },
    },

    { timestamps: true }
);

export default mongoose.model("User", userSchema);
