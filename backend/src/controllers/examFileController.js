import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

export function pdfFileName(name) {
  const leaf = String(name || 'exame.pdf').split(/[\\/]/).at(-1);
  const base = Array.from(leaf).filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join('').trim().slice(0, 150) || 'exame.pdf';
  return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}

export async function getExamFile(req, res) {
  try {
    const examId = req.params.examId || req.params.id;
    if (!mongoose.isValidObjectId(examId)) return res.status(404).json({ message: 'Arquivo não encontrado.' });
    let patient;
    if (req.user.role === 'patient') {
      patient = await Patient.findOne({ userId: req.user.id });
    } else if (req.user.role === 'doctor') {
      if (!mongoose.isValidObjectId(req.params.patientId)) return res.status(404).json({ message: 'Arquivo não encontrado.' });
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor) patient = await Patient.findOne({ _id: req.params.patientId, doctorId: doctor._id });
    } else return res.status(403).json({ message: 'Acesso não permitido.' });
    if (!patient) return res.status(404).json({ message: 'Arquivo não encontrado.' });
    const exam = await Exam.findOne({ _id: examId, patientId: patient._id }).select('+originalPdf');
    if (!exam) return res.status(404).json({ message: 'Arquivo não encontrado.' });
    if (!exam.originalPdf?.length) return res.status(404).json({ message: 'O PDF original deste exame não foi armazenado. Reenvie o arquivo para disponibilizá-lo.' });
    const name = encodeURIComponent(pdfFileName(exam.originalFileName)).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="exame.pdf"; filename*=UTF-8''${name}`,
      'Content-Length': String(exam.originalPdf.length),
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "sandbox; default-src 'none'",
    });
    return res.status(200).send(exam.originalPdf);
  } catch { return res.status(503).json({ message: 'Não foi possível carregar o PDF. Tente novamente.' }); }
}
