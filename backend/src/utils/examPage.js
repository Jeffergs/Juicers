import { isValidObjectId } from 'mongoose';
import { validateExamDate } from './examValidation.js';

export function examPage(query = {}) {
  if (!query.limit && !query.cursor) return null;
  const limit = Number(query.limit || 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Object.assign(new Error('O limite deve estar entre 1 e 100.'), { status: 400 });
  let filter = {};
  if (query.cursor) {
    if (typeof query.cursor !== 'string' || query.cursor.length > 300) throw Object.assign(new Error('Página inválida.'), { status: 400 });
    try {
      const cursor = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'));
      validateExamDate(cursor.date);
      if (!isValidObjectId(cursor.id)) throw new Error();
      filter = { $or: [{ examDate: { $lt: cursor.date } }, { examDate: cursor.date, _id: { $lt: cursor.id } }] };
    } catch { throw Object.assign(new Error('Página inválida.'), { status: 400 }); }
  }
  return { limit, filter };
}
export function nextExamCursor(exam) { return Buffer.from(JSON.stringify({ date: exam.examDate, id: String(exam._id) })).toString('base64url'); }
