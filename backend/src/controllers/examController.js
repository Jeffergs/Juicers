import Exam from "../models/Exam.js";
import Patient from "../models/Patient.js";
import { validateExamPayload } from '../utils/examValidation.js';

export const createExam = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    const payload = validateExamPayload(req.body);

    const exam = await Exam.create({
      patientId: patient._id,
      ...payload,
      source: 'manual',
    });

    return res.status(201).json({
      message: "Exame cadastrado com sucesso",
      exam,
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};

export const getMyExams = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    const exams = await Exam.find({ patientId: patient._id }).sort({
      examDate: -1,
    });

    return res.status(200).json({
      exams,
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};

export const getExamById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    const exam = await Exam.findOne({
      _id: id,
      patientId: patient._id,
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exame não encontrado",
      });
    }

    return res.status(200).json({
      exam,
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};

export const updateExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    const payload = validateExamPayload(req.body);

    const exam = await Exam.findOneAndUpdate(
      {
        _id: id,
        patientId: patient._id,
      },
      {
        ...payload,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!exam) {
      return res.status(404).json({
        message: "Exame não encontrado",
      });
    }

    return res.status(200).json({
      message: "Exame atualizado com sucesso",
      exam,
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        message: "Perfil de paciente não encontrado",
      });
    }

    const exam = await Exam.findOneAndDelete({
      _id: id,
      patientId: patient._id,
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exame não encontrado",
      });
    }

    return res.status(200).json({
      message: "Exame deletado com sucesso",
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};
