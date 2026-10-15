import mongoose from "mongoose";

const clinicalNoteSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    readAt: Date,
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

clinicalNoteSchema.index({ doctorId: 1, patientId: 1, createdAt: -1 });
export default mongoose.model("ClinicalNote", clinicalNoteSchema);
