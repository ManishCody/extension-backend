import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postUrl: { type: String, required: true },
    reason: { type: String, required: true },
    screenshot: String,
    createdAt: { type: Date, default: Date.now },
});

export const Report = mongoose.model("Report", reportSchema);
