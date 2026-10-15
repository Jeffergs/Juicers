import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Exam from '../src/models/Exam.js';
import Patient from '../src/models/Patient.js';
import Doctor from '../src/models/Doctor.js';
import User from '../src/models/User.js';
import { getExamFile, pdfFileName } from '../src/controllers/examFileController.js';
import { importExamPdf } from '../src/services/examImportService.js';

const examId = '507f1f77bcf86cd799439011';
const patientId = '507f1f77bcf86cd799439012';
const doctorId = '507f1f77bcf86cd799439013';
const bytes = Buffer.from('%PDF-1.4 synthetic test');
function response() { return { code: 200, status(code) { this.code = code; return this }, json(body) { this.body = body; return this }, set(headers) { this.headers = headers; return this }, send(body) { this.body = body; return this } }; }
function mockFile(t, originalPdf = bytes) {
  t.mock.method(Exam, 'findOne', filter => {
    assert.deepEqual(filter, { _id: examId, patientId });
    return { select: async fields => { assert.equal(fields, '+originalPdf'); return { originalPdf, originalFileName: 'laudo médico.pdf' } } };
  });
}
test('PDFs are excluded from ordinary projections and all JSON serialization', () => {
  assert.equal(Exam.schema.path('originalPdf').options.select, false);
  const exam = new Exam({ patientId, examDate: '2026-01-01', originalPdf: bytes, hasOriginalPdf: true });
  assert.equal(exam.toJSON().originalPdf, undefined);
  assert.equal(exam.toObject().originalPdf, undefined);
  assert.equal(exam.toJSON().hasOriginalPdf, true);
});
test('a patient can download only their own PDF, with private cache and safe filename headers', async t => {
  t.mock.method(Patient, 'findOne', async filter => { assert.deepEqual(filter, { userId: 'owner' }); return { _id: patientId } });
  mockFile(t);
  const res = response();
  await getExamFile({ user: { role: 'patient', id: 'owner' }, params: { id: examId }, query: { download: '1' } }, res);
  assert.equal(res.code, 200); assert.deepEqual(res.body, bytes);
  assert.equal(res.headers['Content-Type'], 'application/pdf');
  assert.equal(res.headers['Cache-Control'], 'no-store, private');
  assert.match(res.headers['Content-Disposition'], /^attachment;/);
  assert.match(res.headers['Content-Disposition'], /laudo%20m%C3%A9dico.pdf/);
});
test('a linked doctor can read the same original PDF', async t => {
  t.mock.method(Doctor, 'findOne', async filter => { assert.equal(filter.userId, 'doctor'); return { _id: doctorId } });
  t.mock.method(Patient, 'findOne', async filter => { assert.deepEqual(filter, { _id: patientId, doctorId }); return { _id: patientId } });
  mockFile(t);
  const res = response();
  await getExamFile({ user: { role: 'doctor', id: 'doctor' }, params: { patientId, examId }, query: {} }, res);
  assert.equal(res.code, 200); assert.match(res.headers['Content-Disposition'], /^inline;/);
});
test('a revoked or unrelated doctor cannot read PDF bytes', async t => {
  t.mock.method(Doctor, 'findOne', async () => ({ _id: doctorId }));
  t.mock.method(Patient, 'findOne', async () => null);
  t.mock.method(Exam, 'findOne', () => assert.fail('must not retrieve PDF without patient access'));
  const res = response();
  await getExamFile({ user: { role: 'doctor', id: 'other' }, params: { patientId, examId }, query: {} }, res);
  assert.equal(res.code, 404);
});
test('an exam belonging to another patient is not exposed', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId }));
  t.mock.method(Exam, 'findOne', filter => { assert.equal(filter.patientId, patientId); return { select: async () => null } });
  const res = response();
  await getExamFile({ user: { role: 'patient', id: 'owner' }, params: { id: examId }, query: {} }, res);
  assert.equal(res.code, 404);
});
test('legacy exams without an original file report a reupload message', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId })); mockFile(t, null);
  const res = response();
  await getExamFile({ user: { role: 'patient', id: 'owner' }, params: { id: examId }, query: {} }, res);
  assert.equal(res.code, 404); assert.match(res.body.message, /Reenvie/);
});
test('filenames cannot include paths or header control characters', () => {
  assert.equal(pdfFileName('../../pasta/laudo\r\n.pdf'), 'laudo.pdf');
  assert.equal(pdfFileName('C:\\exames\\teste.pdf'), 'teste.pdf');
});
test('oversized PDF imports are rejected before parsing or storage', async () => {
  const buffer = Buffer.alloc(5 * 1024 * 1024 + 1); buffer.write('%PDF-');
  await assert.rejects(importExamPdf({ file: { buffer }, parsePdf: () => assert.fail('must not parse oversized file') }), /5 MB/);
});
test('reuploading an old hashed exam stores its PDF without creating a duplicate', async t => {
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(Patient, 'findById', () => ({ session: async () => ({ userId: 'owner', save: async () => {} }) }));
  t.mock.method(User, 'findOneAndUpdate', async () => ({ _id: 'owner' }));
  const exam = { _id: examId, markers: { hdl: 25 }, hasOriginalPdf: false };
  t.mock.method(Exam, 'findOne', () => ({ session: async () => exam }));
  t.mock.method(Exam, 'create', () => assert.fail('must reuse original exam'));
  let saved = false;
  t.mock.method(Exam, 'updateOne', async (filter, update, options) => { assert.deepEqual(filter, { _id: examId, patientId }); assert.deepEqual(update.$set.originalPdf, bytes); assert.equal(options.session, session); saved = true });
  const result = await importExamPdf({ patientId, file: { buffer: bytes }, parsePdf: async () => ({ text: 'Coletado em: 01/01/2026\nHDL 25 mg/dL' }) });
  assert.equal(saved, true); assert.equal(result.duplicate, true); assert.equal(result.exam.hasOriginalPdf, true);
});
test('a new import stores the exact PDF bytes but does not include them in the JSON response', async t => {
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(Patient, 'findById', () => ({ session: async () => ({ userId: 'owner', save: async () => {} }) }));
  t.mock.method(User, 'findOneAndUpdate', async () => ({ _id: 'owner' }));
  t.mock.method(Exam, 'findOne', () => ({ session: async () => null }));
  t.mock.method(Exam, 'create', async (documents, options) => {
    assert.equal(options.session, session); assert.deepEqual(documents[0].originalPdf, bytes);
    assert.equal(documents[0].hasOriginalPdf, true);
    return [new Exam(documents[0])];
  });
  const result = await importExamPdf({ patientId, file: { buffer: bytes, originalname: 'original.pdf' }, parsePdf: async () => ({ text: 'Coletado em: 01/01/2026\nHDL 25 mg/dL' }) });
  assert.equal(result.duplicate, false); assert.equal(result.exam.toJSON().hasOriginalPdf, true);
  assert.equal(result.exam.toJSON().originalPdf, undefined);
});
