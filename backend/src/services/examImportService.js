import mongoose from 'mongoose';
import { createHash } from 'node:crypto';
import Exam from '../models/Exam.js';
import Patient from '../models/Patient.js';
import RequestedExam from '../models/RequestedExam.js';
import User from '../models/User.js';
import { parseExamPdfText } from '../utils/examPdfParser.js';
import { validateExamPayload } from '../utils/examValidation.js';
// A literal import lets serverless tracing include the parser. Load only for
// uploads, and bypass pdf-parse's package entry point (which runs debug code).
async function pdfParse(buffer) {
  const { default: parse } = await import('pdf-parse/lib/pdf-parse.js');
  return parse(buffer);
}

export async function importExamPdf({ patientId, file, requestedExamId, doctorId, parsePdf = pdfParse }) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length > 5 * 1024 * 1024 || !file.buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
    const error = new Error('Envie um arquivo PDF válido de até 5 MB.'); error.status = 400; throw error;
  }
  let pdf;
  try { pdf = await parsePdf(file.buffer) } catch (cause) { const error = new Error('Não foi possível abrir o PDF. Confira se ele não está corrompido ou protegido por senha.', { cause }); error.status = 422; throw error }
  if (!pdf.text?.trim()) { const error = new Error('O PDF não contém texto selecionável. Envie o laudo original; PDFs escaneados como imagem não são reconhecidos.'); error.status = 422; throw error }
  const payload = validateExamPayload(parseExamPdfText(pdf.text));
  const fileHash = createHash('sha256').update(file.buffer).digest('hex');
  const session = await mongoose.startSession();
  let result;
  try {
    // Duplicate-key contention may happen when two devices upload the same file.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await session.withTransaction(async () => {
          const patient = await Patient.findById(patientId).session(session);
          if (!patient || (doctorId && String(patient.doctorId) !== String(doctorId))) { const error = new Error('Paciente não disponível ou vínculo alterado.'); error.status = 404; throw error }
          if (!await User.findOneAndUpdate({ _id: patient.userId }, { $inc: { dataRevision: 1 } }, { session })) { const error = new Error('Conta do paciente indisponível.'); error.status = 404; throw error }
          const request = requestedExamId ? await RequestedExam.findOne({ _id: requestedExamId, patientId, doctorId: patient.doctorId, isActive: true }).session(session) : null;
          if (requestedExamId && !request) { const error = new Error('Solicitação não disponível.'); error.status = 404; throw error }
          let exam = await Exam.findOne({ patientId, fileHash }).session(session);
          const duplicate = Boolean(exam);
          if (!exam) [exam] = await Exam.create([{ patientId, ...payload, source: 'pdf', originalFileName: file.originalname, fileHash, originalPdf: file.buffer, hasOriginalPdf: true }], { session });
          else if (!exam.hasOriginalPdf) {
            await Exam.updateOne({ _id: exam._id, patientId }, { $set: { originalPdf: file.buffer, hasOriginalPdf: true } }, { session });
            exam.hasOriginalPdf = true;
          }
          if (request && String(request.resultExamId || '') !== String(exam._id)) {
            request.resultExamId = exam._id; request.submittedAt = new Date(); request.reviewedAt = undefined;
            if (!request.performedAt) request.performedAt = new Date(`${payload.examDate}T12:00:00-03:00`);
            await request.save({ session });
          }
          if (!patient.lastExamDate || payload.examDate > patient.lastExamDate) patient.lastExamDate = payload.examDate;
          patient.examStatus = 'recentes'; await patient.save({ session });
          result = { exam, duplicate, extractedMarkers: exam.markers };
        });
        return result;
      } catch (error) { if (error.code !== 11000 || attempt === 1) throw error }
    }
  } finally { await session.endSession() }
}
