import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Exam from '../src/models/Exam.js';
import ClinicalNote from '../src/models/ClinicalNote.js';
import RequestedExam from '../src/models/RequestedExam.js';
import FollowupInteraction from '../src/models/FollowupInteraction.js';
import DoctorInvite from '../src/models/DoctorInvite.js';
import AuthAttempt from '../src/models/AuthAttempt.js';
import { authMiddleware } from '../src/middlewares/authMiddleware.js';
import { requestOrigin } from '../src/middlewares/requestOrigin.js';
import { authRateLimit } from '../src/middlewares/authRateLimit.js';
import { issueSession, validPassword, normalizeEmail } from '../src/utils/session.js';
import { validateExamPayload } from '../src/utils/examValidation.js';
import { getExamRiskLevel } from '../../src/data/markers.js';
import { deletePatientAccount } from '../src/controllers/accountDataController.js';
import { changePassword, createUser } from '../src/controllers/userController.js';
import { createExam } from '../src/controllers/examController.js';
import { importExamPdf } from '../src/services/examImportService.js';
import { examPage, nextExamCursor } from '../src/utils/examPage.js';
import { atomicAction } from '../src/middlewares/atomicAction.js';
import express from 'express';
import { loginUser } from '../src/controllers/userController.js';

const id = '507f1f77bcf86cd799439011';
const patientId = '507f1f77bcf86cd799439012';
function response() { return { code: 200, status(code) { this.code = code; return this }, json(body) { this.body = body; return this }, cookie(name, token, options) { this.cookieData = { name, token, options } }, clearCookie() { this.cleared = true }, setHeader() {} } }
function secret(t) { const old = process.env.JWT_SECRET; process.env.JWT_SECRET = 'test-only-secret-not-a-live-credential'; t.after(() => { if (old === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old }) }

test('session cookies are HttpOnly and password revocation rejects old tokens', async t => {
  secret(t);
  const res = response(); issueSession(res, { _id: id, role: 'patient', sessionVersion: 2 });
  assert.equal(res.cookieData.options.httpOnly, true); assert.equal(res.cookieData.options.sameSite, 'strict');
  t.mock.method(User, 'findById', () => ({ select: async () => ({ role: 'patient', sessionVersion: 3 }) }));
  await authMiddleware({ headers: { cookie: `juicers_session=${res.cookieData.token}` } }, res, () => assert.fail('revoked token passed'));
  assert.equal(res.code, 401); assert.equal(res.body.code, 'SESSION_EXPIRED');
});
test('valid sessions use the current server role; deleted accounts cannot authenticate', async t => {
  secret(t); const res = response();
  const token = jwt.sign({ id, role: 'patient', version: 0 }, process.env.JWT_SECRET);
  t.mock.method(User, 'findById', () => ({ select: async () => null }));
  await authMiddleware({ headers: { authorization: `Bearer ${token}` } }, res, () => assert.fail());
  assert.equal(res.code, 401);
});
test('cookie requests from other origins cannot mutate data', () => {
  const res = response(); requestOrigin({ method: 'POST', headers: { origin: 'https://other.example', cookie: 'juicers_session=x' }, protocol: 'https', get: () => 'juicers.example' }, res, () => assert.fail()); assert.equal(res.code, 403);
});
test('password policy rejects short and bcrypt-truncated passwords', () => {
  assert.equal(validPassword('123456'), false); assert.equal(validPassword('a'.repeat(73)), false); assert.equal(validPassword('á'.repeat(37)), false); assert.equal(validPassword('correct-password'), true); assert.equal(normalizeEmail('  NAME@EXAMPLE.COM '), 'name@example.com');
});
test('registration rejects invalid credentials before writing a user', async t => {
  t.mock.method(User, 'create', () => assert.fail()); const res = response();
  await createUser({ body: { name: 'Example', email: { $ne: null }, password: '123456' } }, res); assert.equal(res.code, 400);
});
test('password change increments the session version atomically', async t => {
  t.mock.method(User, 'findById', async () => ({ password: 'hash' })); t.mock.method(bcrypt, 'compare', async () => true); t.mock.method(bcrypt, 'hash', async () => 'new-hash');
  t.mock.method(User, 'updateOne', async (scope, updates) => { assert.equal(scope.password, 'hash'); assert.equal(updates.$inc.sessionVersion, 1); return { matchedCount: 1 } });
  const res = response(); await changePassword({ user: { id }, body: { currentPassword: 'old-password', newPassword: 'new-password' } }, res); assert.equal(res.body.sessionExpired, true); assert.equal(res.cleared, true);
});
test('rate limiting is persisted rather than stored in a serverless process', async t => {
  t.mock.method(AuthAttempt, 'findOneAndUpdate', async (scope, updates) => { assert.match(scope.key, /^[a-f0-9]{64}$/); assert.equal(updates.$inc.count, 1); return { count: 16 } });
  const res = response(); await authRateLimit()({ ip: '127.0.0.1', body: { email: 'test@example.com' }, headers: {} }, res, () => assert.fail()); assert.equal(res.code, 429);
});
test('exam payloads reject invalid dates, units, unknown markers and non-finite values', () => {
  for (const body of [{ examDate: '2026-02-30', markers: { hdl: 50 } }, { examDate: '2999-01-01', markers: { hdl: 50 } }, { examDate: '2026-01-01', markers: { hdl: { value: 1, unit: 'mmol/L' } } }, { examDate: '2026-01-01', markers: { unknown: 10 } }, { examDate: '2026-01-01', markers: { hdl: Infinity } }, { examDate: '2026-01-01', markers: {} }]) assert.throws(() => validateExamPayload(body));
});
test('API classification ignores forged alerts and matches the dashboard', async t => {
  const payload = validateExamPayload({ examDate: '2026-01-01', markers: { colesterol_hdl: '25,5' }, riskLevel: 'normal', alerts: [] });
  assert.equal(payload.markers.hdl, 25.5); assert.equal(payload.riskLevel, 'high'); assert.equal(payload.riskLevel, getExamRiskLevel(payload.markers));
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, save: async () => {} }));
  t.mock.method(Exam, 'create', async data => { assert.equal(data.riskLevel, 'high'); assert.notDeepEqual(data.alerts, []); return data });
  const res = response(); await createExam({ user: { id }, body: { examDate: '2026-01-01', markers: { hdl: 25 }, riskLevel: 'normal', alerts: [] } }, res); assert.equal(res.code, 201);
});
test('account deletion requires confirmation and recent Google authentication', async t => {
  let res = response(); await deletePatientAccount({ user: { id, role: 'patient' }, body: {} }, res); assert.equal(res.code, 400);
  t.mock.method(User, 'findById', async () => ({ password: null })); res = response(); await deletePatientAccount({ user: { id, role: 'patient', authTime: 1 }, body: { confirmation: 'EXCLUIR' } }, res); assert.equal(res.body.code, 'REAUTH_REQUIRED');
});
test('account deletion scopes every record and commits in one transaction', async t => {
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  t.mock.method(mongoose, 'startSession', async () => session);
  const user = { _id: id, password: null, email: 'user@example.com', sessionVersion: 0 };
  t.mock.method(User, 'findById', () => ({ then: resolve => resolve(user), session: async s => { assert.equal(s, session); return user } }));
  t.mock.method(Patient, 'findOne', () => ({ session: async () => ({ _id: patientId }) }));
  const writes = [];
  for (const Model of [Exam, ClinicalNote, RequestedExam, FollowupInteraction]) t.mock.method(Model, 'deleteMany', async (scope, options) => { assert.deepEqual(scope, { patientId }); assert.equal(options.session, session); writes.push(Model.modelName) });
  t.mock.method(Patient, 'deleteOne', async (scope, options) => { assert.equal(scope.userId, id); assert.equal(options.session, session); writes.push('Patient') });
  t.mock.method(DoctorInvite, 'deleteMany', async (scope, options) => { assert.equal(scope.$or[0].patientUserId, id); assert.equal(scope.$or[1].patientEmail.test(user.email), true); assert.equal(scope.$or[1].patientEmail.test('other@example.com'), false); assert.equal(options.session, session) });
  t.mock.method(User, 'deleteOne', async (scope, options) => { assert.equal(scope._id, id); assert.equal(options.session, session); writes.push('User') });
  const res = response(); await deletePatientAccount({ user: { id, role: 'patient', authTime: Date.now() / 1000, version: 0 }, body: { confirmation: 'EXCLUIR' } }, res);
  assert.equal(res.code, 200); assert.equal(res.cleared, true); assert.equal(writes.length, 6);
});
test('transaction failure never falls back to partial account deletion', async t => {
  t.mock.method(User, 'findById', async () => ({ password: null }));
  t.mock.method(mongoose, 'startSession', async () => ({ withTransaction: async () => { throw new Error('transactions unavailable') }, endSession: async () => {} }));
  t.mock.method(Patient, 'deleteOne', () => assert.fail()); const res = response();
  await deletePatientAccount({ user: { id, role: 'patient', authTime: Date.now() / 1000 }, body: { confirmation: 'EXCLUIR' } }, res); assert.equal(res.code, 503); assert.equal(res.cleared, undefined);
});
test('PDF imports reject disguised files, scans and missing collection dates', async () => {
  const file = { buffer: Buffer.from('%PDF-1.4 test'), originalname: 'exam.pdf' };
  await assert.rejects(importExamPdf({ patientId, file: { buffer: Buffer.from('not a PDF') } }), /PDF válido/);
  await assert.rejects(importExamPdf({ patientId, file, parsePdf: async () => ({ text: '' }) }), /texto selecionável/);
  await assert.rejects(importExamPdf({ patientId, file, parsePdf: async () => ({ text: 'HDL 25 mg/dL' }) }), /data de coleta/);
});
test('history cursors are validated and break ties between exams on the same day', () => {
  const cursor = nextExamCursor({ examDate: '2026-01-01', _id: id });
  const page = examPage({ limit: '50', cursor });
  assert.equal(page.limit, 50); assert.equal(page.filter.$or[1].examDate, '2026-01-01'); assert.equal(page.filter.$or[1]._id.$lt, id);
  assert.throws(() => examPage({ limit: 100000 })); assert.throws(() => examPage({ cursor: 'invalid' }));
});
test('repeated PDFs reuse the stored exam and do not overwrite a newer collection date', async t => {
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  t.mock.method(mongoose, 'startSession', async () => session);
  const patient = { lastExamDate: '2026-04-01', save: async options => assert.equal(options.session, session) };
  const exam = { _id: id, markers: { hdl: 25 }, hasOriginalPdf: true };
  t.mock.method(Patient, 'findById', () => ({ session: async () => patient }));
  t.mock.method(User, 'findOneAndUpdate', async () => ({ _id: id }));
  t.mock.method(Exam, 'findOne', scope => { assert.equal(scope.patientId, patientId); assert.match(scope.fileHash, /^[a-f0-9]{64}$/); return { session: async () => exam } });
  t.mock.method(Exam, 'create', () => assert.fail('duplicate was inserted'));
  const result = await importExamPdf({ patientId, file: { buffer: Buffer.from('%PDF-1.4 test'), originalname: 'exam.pdf' }, parsePdf: async () => ({ text: 'Coletado em: 01/01/2026\nHDL 25 mg/dL' }) });
  assert.equal(result.duplicate, true); assert.equal(patient.lastExamDate, '2026-04-01');
});
test('atomic actions send success only after commit and do not expose a partial write', async t => {
  const events = [];
  t.mock.method(User, 'findOneAndUpdate', async () => ({ _id: id }));
  t.mock.method(mongoose.connection, 'transaction', async fn => { await fn(); events.push('commit') });
  const res = response(); const originalJson = res.json; res.json = function (body) { events.push('response'); return originalJson.call(this, body) };
  await atomicAction(async (_req, out) => out.status(201).json({ saved: true }))({ user: { id, role: 'patient' } }, res);
  assert.deepEqual(events, ['commit', 'response']);
  t.mock.method(mongoose.connection, 'transaction', async fn => { await fn(); throw new Error('commit failed') });
  const failed = response(); await atomicAction(async (_req, out) => out.json({ saved: true }))({ user: { id, role: 'patient' } }, failed);
  assert.equal(failed.code, 503); assert.equal(failed.body.saved, undefined);
});
test('HTTP login sets a cookie without exposing a token and revoked cookies fail', async t => {
  secret(t);
  const user = { _id: id, name: 'Fixture', email: 'fixture@example.com', role: 'patient', password: 'hash', sessionVersion: 0 };
  t.mock.method(User, 'findOne', async scope => { assert.equal(scope.email.test('fixture@example.com'), true); return user });
  t.mock.method(User, 'findById', () => ({ select: async () => user }));
  t.mock.method(bcrypt, 'compare', async () => true);
  const app = express(); app.use(express.json()); app.use(requestOrigin); app.post('/api/login', loginUser); app.get('/api/private', authMiddleware, (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  t.after(() => { server.closeAllConnections(); server.close() });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(`${base}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: '  FIXTURE@EXAMPLE.COM ', password: 'password' }) });
  assert.equal(login.status, 200); assert.equal((await login.json()).token, undefined);
  const cookie = login.headers.get('set-cookie'); assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Strict/i);
  assert.equal((await fetch(`${base}/api/private`, { headers: { cookie } })).status, 200);
  user.sessionVersion += 1;
  assert.equal((await fetch(`${base}/api/private`, { headers: { cookie } })).status, 401);
});
