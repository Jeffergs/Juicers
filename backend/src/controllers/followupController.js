import { createRequire } from 'node:module';
import { isValidObjectId } from 'mongoose';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import ClinicalNote from '../models/ClinicalNote.js';
import RequestedExam from '../models/RequestedExam.js';
import FollowupInteraction from '../models/FollowupInteraction.js';
import Exam from '../models/Exam.js';
import { parseExamPdfText } from '../utils/examPdfParser.js';
const pdfParse = createRequire(import.meta.url)('pdf-parse');

export async function patientFollowupAction(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient?.doctorId) return res.status(403).json({ message: 'Vincule-se a um médico para interagir.' });
    const scope = { patientId: patient._id, doctorId: patient.doctorId };
    const { kind, text, mood, noteId, requestedExamId, interactionId } = req.body;
    for (const id of [noteId, requestedExamId, interactionId].filter(Boolean)) {
      if (!isValidObjectId(id)) return res.status(400).json({ message: 'Referência inválida.' });
    }
    if (kind === 'reply-read' && interactionId) {
      const repliedAt = new Date(req.body.repliedAt);
      if (!req.body.repliedAt || Number.isNaN(repliedAt.getTime())) return res.status(400).json({ message: 'Resposta inválida.' });
      const interaction = await FollowupInteraction.findOneAndUpdate({ _id: interactionId, ...scope, repliedAt, reply: { $ne: '' } }, { replyReadAt: new Date() }, { returnDocument: 'after' });
      if (!interaction) return res.status(409).json({ message: 'A resposta foi atualizada ou não está disponível. Atualize a conversa.' });
      return res.json({ interaction, message: 'Resposta marcada como lida.' });
    }
    if (noteId && !await ClinicalNote.exists({ _id: noteId, ...scope })) return res.status(404).json({ message: 'Orientação não encontrada.' });
    if (requestedExamId && !await RequestedExam.exists({ _id: requestedExamId, ...scope, isActive: true })) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    if (kind === 'performed' && requestedExamId) {
      const value = req.body.performedDate;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value > new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })) return res.status(400).json({ message: 'Informe uma data válida de realização, até hoje.' });
      await RequestedExam.updateOne({ _id: requestedExamId, ...scope, isActive: true }, { performedAt: new Date(`${value}T12:00:00-03:00`) });
      return res.json({ message: 'Realização registrada.' });
    }
    if (kind === 'read' && noteId) {
      await ClinicalNote.updateOne({ _id: noteId, ...scope, readAt: null }, { $set: { readAt: new Date() } });
      return res.json({ message: 'Leitura confirmada.' });
    }
    if (!['question', 'checkin'].includes(kind) || typeof text !== 'string' || text.length > 500 || (kind === 'question' && !text.trim()) || (kind === 'checkin' && !['Bem', 'Regular', 'Com dificuldade'].includes(mood))) {
      return res.status(400).json({ message: 'Confira a mensagem e o estado selecionado (máximo de 500 caracteres).' });
    }
    const interaction = await FollowupInteraction.create({ ...scope, kind, text, ...(kind === 'checkin' ? { mood } : {}), noteId, requestedExamId });
    return res.status(201).json({ interaction });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function submitRequestedResult(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Solicitação inválida.' });
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient?.doctorId) return res.status(403).json({ message: 'Nenhum médico vinculado.' });
    const request = await RequestedExam.findOne({ _id: req.params.id, patientId: patient._id, doctorId: patient.doctorId, isActive: true });
    if (!request) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    if (!req.file) return res.status(400).json({ message: 'Selecione um PDF de até 5 MB.' });
    const pdf = await pdfParse(req.file.buffer);
    const parsed = parseExamPdfText(pdf.text || '');
    if (!Object.keys(parsed.markers || {}).length) return res.status(422).json({ message: 'Não foi possível ler os indicadores. Envie o laudo original com texto selecionável.' });
    const exam = await Exam.create({ patientId: patient._id, ...parsed, source: 'pdf', originalFileName: req.file.originalname });
    request.resultExamId = exam._id;
    request.submittedAt = new Date();
    if (!request.performedAt) request.performedAt = new Date(`${parsed.examDate}T12:00:00-03:00`);
    request.reviewedAt = undefined;
    await request.save();
    patient.lastExamDate = parsed.examDate;
    patient.examStatus = 'recentes';
    await patient.save();
    return res.status(201).json({ exam, message: 'Resultado enviado ao médico.' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function doctorFollowupAction(req, res) {
  try {
    const { id, itemId } = req.params;
    if (![id, itemId].every(isValidObjectId)) return res.status(400).json({ message: 'Referência inválida.' });
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const patient = doctor && await Patient.findOne({ _id: id, doctorId: doctor._id });
    if (!patient) return res.status(404).json({ message: 'Paciente não vinculado a este médico.' });
    const scope = { _id: itemId, patientId: patient._id, doctorId: doctor._id };
    if (req.body.kind === 'plan') {
      const { reason, dueDate } = req.body;
      if (typeof reason !== 'string' || reason.length > 2000 || (dueDate && (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate))) return res.status(400).json({ message: 'Confira o motivo e o prazo do exame.' });
      const request = await RequestedExam.findOneAndUpdate({ ...scope, isActive: true }, { reason: reason.trim(), dueDate: dueDate ? new Date(`${dueDate}T12:00:00-03:00`) : null }, { returnDocument: 'after', runValidators: true });
      if (!request) return res.status(404).json({ message: 'Solicitação não encontrada.' });
      return res.json({ request });
    }
    if (req.body.kind === 'review') {
      const request = await RequestedExam.findOneAndUpdate({ ...scope, submittedAt: { $ne: null } }, { reviewedAt: new Date() }, { returnDocument: 'after' });
      if (!request) return res.status(404).json({ message: 'Resultado não encontrado.' });
      return res.json({ request });
    }
    const { reply } = req.body;
    if (typeof reply !== 'string' || !reply.trim() || reply.length > 2000) return res.status(400).json({ message: 'Informe uma resposta de até 2000 caracteres.' });
    const interaction = await FollowupInteraction.findOneAndUpdate(scope, { reply: reply.trim(), repliedAt: new Date(), replyReadAt: null }, { returnDocument: 'after', runValidators: true });
    if (!interaction) return res.status(404).json({ message: 'Mensagem não encontrada.' });
    return res.json({ interaction });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}
