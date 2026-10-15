import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    sessionVersion: { type: Number, default: 0 },
    dataRevision: { type: Number, default: 0 },
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    role: {
      type: String,
      enum: ["doctor", "patient"],
      default: "patient",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
