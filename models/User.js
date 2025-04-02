import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uuid: { type: String, unique: true, required: true },
  userAgent: { type: String, required: true },
  ip: { type: String, required: true },
  blockedUsers: [
    {
      username: String,
    },
  ],
  logs: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
