import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  kind: { type: String, enum: ['question', 'checkin'], required: true },
  text: { type: String, trim: true, maxlength: 500, default: '' },
  mood: { type: String, enum: ['Bem', 'Regular', 'Com dificuldade'] },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicalNote' },
  requestedExamId: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestedExam' },
  reply: { type: String, trim: true, maxlength: 2000, default: '' },
  repliedAt: Date,
  replyReadAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ doctorId: 1, patientId: 1, createdAt: -1 });
export default mongoose.model('FollowupInteraction', schema);
