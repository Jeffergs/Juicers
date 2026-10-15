import Exam from "../models/Exam.js";
import Patient from "../models/Patient.js";
import { validateExamPayload } from '../utils/examValidation.js';
import { importExamPdf } from '../services/examImportService.js';
import { examPage, nextExamCursor } from '../utils/examPage.js';
import RequestedExam from '../models/RequestedExam.js';

export async function uploadMyExam(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Operação disponível para pacientes.' });
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Perfil de paciente não encontrado.' });
    const result = await importExamPdf({ patientId: patient._id, file: req.file });
    return res.status(result.duplicate ? 200 : 201).json({ ...result, message: result.duplicate ? 'Este PDF já foi importado.' : 'PDF importado. Confira os valores extraídos com o laudo original.' });
  } catch (error) { return res.status(error.status || 503).json({ message: error.status ? error.message : 'Não foi possível concluir a importação. Tente novamente.' }); }
}

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
    if (!patient.lastExamDate || exam.examDate > patient.lastExamDate) patient.lastExamDate = exam.examDate;
    patient.examStatus = 'recentes'; await patient.save();

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

    const page = examPage(req.query);
    let query = Exam.find({ patientId: patient._id, ...page?.filter }).sort({ examDate: -1, _id: -1 });
    if (page) query = query.limit(page.limit + 1);
    const records = await query;
    const exams = page ? records.slice(0, page.limit) : records;
    let stats;
    if (page) [stats] = await Exam.aggregate([{ $match: { patientId: patient._id } }, { $group: { _id: null, total: { $sum: 1 }, highCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] }, 1, 0] } }, lastDate: { $max: '$examDate' } } }]);

    return res.status(200).json({
      exams,
      ...(page ? { nextCursor: records.length > page.limit ? nextExamCursor(exams.at(-1)) : null, stats: stats || { total: 0, highCount: 0, lastDate: null } } : {}),
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
    await RequestedExam.updateMany({ patientId: patient._id, resultExamId: exam._id }, { $unset: { resultExamId: '', submittedAt: '', reviewedAt: '' } });
    const latest = await Exam.findOne({ patientId: patient._id }).sort({ examDate: -1 });
    patient.lastExamDate = latest?.examDate || ''; patient.examStatus = latest ? 'recentes' : 'nunca'; await patient.save();

    return res.status(200).json({
      message: "Exame deletado com sucesso",
    });
  } catch (error) {
    return res.status(error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500)).json({
      message: error.message,
    });
  }
};
