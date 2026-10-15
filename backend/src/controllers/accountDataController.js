import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Exam from '../models/Exam.js';
import ClinicalNote from '../models/ClinicalNote.js';
import RequestedExam from '../models/RequestedExam.js';
import FollowupInteraction from '../models/FollowupInteraction.js';
import DoctorInvite from '../models/DoctorInvite.js';
import { clearSession } from '../utils/session.js';

const emailScope = (email, userId) => ({ $or: [{ patientUserId: userId }, { patientEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] });

export async function exportPatientData(req, res) {
  if (req.user.role !== 'patient') return res.status(403).json({ message: 'Operação disponível para a conta do paciente.' });
  try {
    const user = await User.findById(req.user.id).select('name email role createdAt updatedAt').lean();
    if (!user) return res.status(401).json({ code: 'SESSION_EXPIRED', message: 'Entre novamente.' });
    const patient = await Patient.findOne({ userId: req.user.id }).lean();
    const data = { user, patient, exportedAt: new Date().toISOString() };
    if (patient) {
      for (const [key, Model] of [['exams', Exam], ['notes', ClinicalNote], ['requestedExams', RequestedExam], ['interactions', FollowupInteraction]]) data[key] = await Model.find({ patientId: patient._id }).lean();
    }
    data.invites = await DoctorInvite.find(emailScope(user.email, req.user.id)).select('doctorId patientName patientEmail status expiresAt acceptedAt createdAt').lean();
    res.setHeader('Content-Disposition', 'attachment; filename="juicers-meus-dados.json"');
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Não foi possível exportar os dados.' }); }
}

export async function deletePatientAccount(req, res) {
  if (req.user.role !== 'patient') return res.status(403).json({ message: 'Operação disponível para a conta do paciente.' });
  if (req.body?.confirmation !== 'EXCLUIR') return res.status(400).json({ message: 'Digite EXCLUIR para confirmar a exclusão definitiva.' });
  let session;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ code: 'SESSION_EXPIRED', message: 'Entre novamente.' });
    if (user.password) {
      const password = req.body.currentPassword;
      if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72 || !await bcrypt.compare(password, user.password)) return res.status(403).json({ message: 'Confirme sua senha atual para excluir a conta.' });
    } else if (!req.user.authTime || Date.now() / 1000 - req.user.authTime > 15 * 60) {
      return res.status(403).json({ message: 'Entre novamente com o Google antes de excluir a conta.', code: 'REAUTH_REQUIRED' });
    }
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const currentUser = await User.findById(req.user.id).session(session);
      if (!currentUser || (currentUser.sessionVersion || 0) !== (req.user.version || 0)) throw new Error('SESSION_CHANGED');
      const patient = await Patient.findOne({ userId: req.user.id }).session(session);
      if (patient) {
        for (const Model of [Exam, ClinicalNote, RequestedExam, FollowupInteraction]) await Model.deleteMany({ patientId: patient._id }, { session });
        await Patient.deleteOne({ _id: patient._id, userId: req.user.id }, { session });
      }
      await DoctorInvite.deleteMany(emailScope(currentUser.email, req.user.id), { session });
      await User.deleteOne({ _id: req.user.id }, { session });
    });
    clearSession(res);
    return res.json({ message: 'Conta, perfil, exames, mensagens, orientações e convites vinculados foram excluídos.' });
  } catch (error) {
    // Never fall back to partial deletion if the database does not support transactions.
    if (error.message === 'SESSION_CHANGED') return res.status(409).json({ message: 'Sua sessão mudou. Entre novamente antes de excluir a conta.' });
    return res.status(503).json({ message: 'Não foi possível concluir a exclusão. Nenhuma exclusão parcial foi confirmada; tente novamente ou contate o suporte.' });
  } finally { if (session) await session.endSession(); }
}
