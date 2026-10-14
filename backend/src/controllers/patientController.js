import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import ClinicalNote from "../models/ClinicalNote.js";
import RequestedExam from "../models/RequestedExam.js";
import FollowupInteraction from '../models/FollowupInteraction.js';

export const createOrUpdatePatient = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      birthDate,
      age,
      biologicalSex,
      weight,
      height,
      cycleStatus,
      weeklyDosage,
      cycleTime,
      examStatus,
      lastExamDate,
      lastName,
      substances,
      healthConditions,
    } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { userId },
      {
        birthDate,
        age,
        lastName,
        biologicalSex,
        weight,
        height,
        cycleStatus,
        weeklyDosage,
        cycleTime,
        examStatus,
        lastExamDate,
        substances,
        healthConditions,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    )
      .populate("userId", "name email role")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email role",
        },
      });

    return res.status(200).json({
      message: "Dados do paciente salvos com sucesso",
      patient,
    });
  } catch (error) {
    return res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({
      message: error.message,
    });
  }
};

export const getMyPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId })
      .populate("userId", "name email role")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email role",
        },
      });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    return res.status(200).json({
      patient,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyFollowup = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId }).populate({
      path: "doctorId",
      populate: {
        path: "userId",
        select: "name email role",
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    if (!patient.doctorId) {
      return res.status(200).json({
        doctor: null,
        notes: [],
        requestedExams: [],
      });
    }

    const doctor = patient.doctorId;
    const interactions = await FollowupInteraction.find({ patientId: patient._id, doctorId: doctor._id }).sort({ createdAt: -1 });

    const notes = await ClinicalNote.find({
      doctorId: doctor._id,
      patientId: patient._id,
    }).sort({ createdAt: -1 });

    const requestedExams = await RequestedExam.find({
      doctorId: doctor._id,
      patientId: patient._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      doctor,
      interactions,
      notes,
      requestedExams,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
