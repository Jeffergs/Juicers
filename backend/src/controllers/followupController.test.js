import test from 'node:test';
import assert from 'node:assert/strict';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import ClinicalNote from '../models/ClinicalNote.js';
import RequestedExam from '../models/RequestedExam.js';
import FollowupInteraction from '../models/FollowupInteraction.js';
import { patientFollowupAction, doctorFollowupAction, submitRequestedResult } from './followupController.js';
import { getMyDoctorPatients } from './doctorController.js';

const patientId = '507f1f77bcf86cd799439011';
const doctorId = '507f1f77bcf86cd799439012';
const itemId = '507f1f77bcf86cd799439013';
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
test('patient without linked doctor cannot send messages', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId }));
  const res = response();
  await patientFollowupAction({ user: { id: 'user' }, body: { kind: 'question', text: 'Dúvida' } }, res);
  assert.equal(res.code, 403);
});
test('patient cannot reference another patient’s note', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(ClinicalNote, 'exists', async scope => {
    assert.equal(scope.patientId, patientId);
    assert.equal(scope.doctorId, doctorId);
    return null;
  });
  const res = response();
  await patientFollowupAction({ user: { id: 'user' }, body: { kind: 'read', noteId: itemId } }, res);
  assert.equal(res.code, 404);
});
test('invalid mood and oversized questions are rejected', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  for (const body of [{ kind: 'checkin', mood: 'invalid', text: '' }, { kind: 'question', text: 'a'.repeat(501) }]) {
    const res = response();
    await patientFollowupAction({ user: { id: 'user' }, body }, res);
    assert.equal(res.code, 400);
  }
});
test('question persists with server-derived patient and doctor', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(FollowupInteraction, 'create', async payload => {
    assert.equal(payload.patientId, patientId);
    assert.equal(payload.doctorId, doctorId);
    assert.equal(payload.kind, 'question');
    return payload;
  });
  const res = response();
  await patientFollowupAction({ user: { id: 'user' }, body: { kind: 'question', text: 'Posso enviar PDF?', doctorId: itemId } }, res);
  assert.equal(res.code, 201);
});
test('doctor cannot reply to an unlinked patient', async t => {
  t.mock.method(Doctor, 'findOne', async () => ({ _id: doctorId }));
  t.mock.method(Patient, 'findOne', async scope => {
    assert.equal(scope.doctorId, doctorId);
    return null;
  });
  const res = response();
  await doctorFollowupAction({ user: { id: 'user' }, params: { id: patientId, itemId }, body: { reply: 'Resposta' } }, res);
  assert.equal(res.code, 404);
});
test('review is scoped and requires a submitted result', async t => {
  t.mock.method(Doctor, 'findOne', async () => ({ _id: doctorId }));
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId }));
  t.mock.method(RequestedExam, 'findOneAndUpdate', async scope => {
    assert.equal(scope.patientId, patientId);
    assert.equal(scope.doctorId, doctorId);
    assert.deepEqual(scope.submittedAt, { $ne: null });
    return null;
  });
  const res = response();
  await doctorFollowupAction({ user: { id: 'user' }, params: { id: patientId, itemId }, body: { kind: 'review' } }, res);
  assert.equal(res.code, 404);
});
test('result upload cannot target another patient’s request', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(RequestedExam, 'findOne', async scope => {
    assert.equal(scope.patientId, patientId);
    assert.equal(scope.doctorId, doctorId);
    assert.equal(scope.isActive, true);
    return null;
  });
  const res = response();
  await submitRequestedResult({ user: { id: 'user' }, params: { id: itemId } }, res);
  assert.equal(res.code, 404);
});
test('performed date rejects future and impossible calendar dates', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(RequestedExam, 'exists', async () => true);
  for (const performedDate of ['2099-01-01', '2026-02-30']) {
    const res = response();
    await patientFollowupAction({ user: { id: 'user' }, body: { kind: 'performed', requestedExamId: itemId, performedDate } }, res);
    assert.equal(res.code, 400);
  }
});
test('performed date updates only the linked active request', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(RequestedExam, 'exists', async () => true);
  t.mock.method(RequestedExam, 'updateOne', async (scope, update) => {
    assert.equal(scope.patientId, patientId);
    assert.equal(scope.doctorId, doctorId);
    assert.equal(scope.isActive, true);
    assert.equal(update.performedAt.toISOString(), '2026-01-10T15:00:00.000Z');
  });
  const res = response();
  await patientFollowupAction({ user: { id: 'user' }, body: { kind: 'performed', requestedExamId: itemId, performedDate: '2026-01-10' } }, res);
  assert.equal(res.code, 200);
});

test('patient cannot retrieve doctor message counters', async t => {
  t.mock.method(Doctor, 'findOne', async () => assert.fail('Must not query a doctor for a patient account'));
  const res = response();
  await getMyDoctorPatients({ user: { id: 'user', role: 'patient' } }, res);
  assert.equal(res.code, 403);
});

test('doctor counters only include pending messages for currently linked patients', async t => {
  t.mock.method(Doctor, 'findOne', async () => ({ _id: doctorId }));
  t.mock.method(Patient, 'find', scope => {
    assert.equal(scope.doctorId, doctorId);
    return { populate: () => ({ sort: async () => [{ _id: patientId, toObject: () => ({ _id: patientId, userId: { name: 'Paciente' } }) }] }) };
  });
  t.mock.method(FollowupInteraction, 'aggregate', async pipeline => {
    assert.equal(pipeline[0].$match.doctorId, doctorId);
    assert.deepEqual(pipeline[0].$match.patientId.$in, [patientId]);
    assert.equal(pipeline[0].$match.reply, '');
    return [{ _id: patientId, count: 2 }];
  });
  const res = response();
  await getMyDoctorPatients({ user: { id: 'user', role: 'doctor' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.patients.length, 1);
  assert.equal(res.body.patients[0].pendingMessageCount, 2);
});

test('reply is saved against the authenticated doctor and linked patient', async t => {
  t.mock.method(Doctor, 'findOne', async () => ({ _id: doctorId }));
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId }));
  t.mock.method(FollowupInteraction, 'findOneAndUpdate', async (scope, update) => {
    assert.equal(scope.doctorId, doctorId);
    assert.equal(scope.patientId, patientId);
    assert.equal(scope._id, itemId);
    assert.equal(update.reply, 'Pode enviar pelo acompanhamento.');
    assert.equal(update.replyReadAt, null);
    assert.ok(update.repliedAt instanceof Date);
    return { _id: itemId, reply: update.reply };
  });
  const res = response();
  await doctorFollowupAction({ user: { id: 'user' }, params: { id: patientId, itemId }, body: { reply: ' Pode enviar pelo acompanhamento. ' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.interaction.reply, 'Pode enviar pelo acompanhamento.');
});

test('patient read receipt is restricted to their doctor and exact reply version', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(FollowupInteraction, 'findOneAndUpdate', async (scope, update) => {
    assert.equal(scope.patientId, patientId);
    assert.equal(scope.doctorId, doctorId);
    assert.equal(scope._id, itemId);
    assert.equal(scope.repliedAt.toISOString(), '2026-10-13T14:00:00.000Z');
    assert.ok(update.replyReadAt instanceof Date);
    return { _id: itemId, replyReadAt: update.replyReadAt };
  });
  const res = response();
  await patientFollowupAction({ user: { id: 'patient' }, body: { kind: 'reply-read', interactionId: itemId, repliedAt: '2026-10-13T14:00:00.000Z' } }, res);
  assert.equal(res.code, 200);
});

test('read receipt cannot mark an unavailable or newer reply as read', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  t.mock.method(FollowupInteraction, 'findOneAndUpdate', async () => null);
  const res = response();
  await patientFollowupAction({ user: { id: 'patient' }, body: { kind: 'reply-read', interactionId: itemId, repliedAt: '2026-10-13T14:00:00.000Z' } }, res);
  assert.equal(res.code, 409);
});

test('read receipt rejects invalid reply timestamp', async t => {
  t.mock.method(Patient, 'findOne', async () => ({ _id: patientId, doctorId }));
  const res = response();
  await patientFollowupAction({ user: { id: 'patient' }, body: { kind: 'reply-read', interactionId: itemId, repliedAt: 'invalid' } }, res);
  assert.equal(res.code, 400);
});
