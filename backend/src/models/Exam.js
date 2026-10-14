import mongoose from "mongoose";
import { validateExamDate, validateMarkers, classifyMarkers } from '../utils/examValidation.js';

const examSchema = new mongoose.Schema(
  {
    rulesVersion: { type: String },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    examDate: {
      type: String,
      required: true,
    },

    markers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    riskLevel: {
      type: String,
      enum: ["normal", "attention", "high"],
      default: "normal",
    },

    alerts: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: ["manual", "pdf"],
      default: "manual",
    },

    originalFileName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

examSchema.pre('validate', function () {
  this.examDate = validateExamDate(this.examDate);
  this.markers = validateMarkers(this.markers);
  Object.assign(this, classifyMarkers(this.markers));
});

export default mongoose.model("Exam", examSchema);
