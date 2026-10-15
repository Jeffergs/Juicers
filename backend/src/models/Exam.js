import mongoose from "mongoose";
import { validateExamDate, validateMarkers, classifyMarkers } from '../utils/examValidation.js';

const examSchema = new mongoose.Schema(
  {
    rulesVersion: { type: String },
    fileHash: { type: String },
    hasOriginalPdf: { type: Boolean, default: false },
    originalPdf: { type: Buffer, select: false },
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
examSchema.index({ patientId: 1, examDate: -1, _id: -1 });
// Original files are available only through the authenticated file endpoint.
function hideOriginalPdf(_doc, result) { delete result.originalPdf; return result; }
examSchema.set('toJSON', { transform: hideOriginalPdf });
examSchema.set('toObject', { transform: hideOriginalPdf });
examSchema.index({ patientId: 1, fileHash: 1 }, { unique: true, partialFilterExpression: { fileHash: { $type: 'string' } } });

export default mongoose.model("Exam", examSchema);
