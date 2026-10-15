import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    birthDate: {
      type: String,
    },

    biologicalSex: {
      type: String,
      enum: ["female", "male", "other"],
    },

    weight: {
      type: Number,
    },

    height: {
      type: Number,
    },

    cycleTime: {
      type: String,
    },

    substances: {
      // Keep existing string entries readable while storing name and dosage
      // together for the current registration/account forms.
      type: [mongoose.Schema.Types.Mixed],
      default: [],
      validate: {
        validator: items => items.every(item => {
          if (typeof item === 'string') return Boolean(item.trim());
          return item && typeof item.name === 'string' && Boolean(item.name.trim())
            && (item.weeklyDosage == null || (typeof item.weeklyDosage === 'number'
              && Number.isFinite(item.weeklyDosage) && item.weeklyDosage >= 0));
        }),
        message: 'Informe um nome válido e uma dosagem não negativa para cada composto.',
      },
    },

    healthConditions: {
      type: [String],
      default: [],
    },

    age: {
      type: Number,
    },

    cycleStatus: {
      type: String,
    },

    weeklyDosage: {
      type: Number,
    },

    examStatus: {
      type: String,
    },

    lastExamDate: {
      type: String,
    },

    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ doctorId: 1, createdAt: -1 });
export default mongoose.model("Patient", patientSchema);
