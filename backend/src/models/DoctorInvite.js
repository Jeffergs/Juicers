import mongoose from "mongoose";

const doctorInviteSchema = new mongoose.Schema(
  {
    patientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    patientEmail: {
      type: String,
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

doctorInviteSchema.index({ patientUserId: 1 });
export default mongoose.model("DoctorInvite", doctorInviteSchema);
