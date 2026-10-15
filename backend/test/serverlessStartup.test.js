import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { importExamPdf } from '../src/services/examImportService.js';

test('serverless health and unauthenticated routes survive an unavailable PDF parser', async () => {
  const script = `
    import { registerHooks, createRequire } from 'node:module';
    import { createServer } from 'node:http';
    const mongoose = createRequire(new URL('./backend/src/config/database.js', import.meta.url))('mongoose');
    registerHooks({ resolve(specifier, context, next) {
      if (specifier.startsWith('pdf-parse')) throw Object.assign(new Error('Parser unavailable in deployment'), { code: 'MODULE_NOT_FOUND' });
      return next(specifier, context);
    } });
    mongoose.connect = async () => mongoose.connection;
    process.env.MONGO_URI = 'mongodb://fixture.invalid/never-connected';
    const { default: handler } = await import('./api/index.js');
    const server = createServer(handler);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const base = 'http://127.0.0.1:' + server.address().port;
      const health = await fetch(base + '/api/index?path=health');
      const profile = await fetch(base + '/api/index?path=users/profile');
      console.log(JSON.stringify({ health: health.status, healthBody: await health.json(), profile: profile.status, profileBody: await profile.json() }));
    } finally { await new Promise(resolve => server.close(resolve)); }
  `;
  const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('../../', import.meta.url), timeout: 30000 });
  const result = JSON.parse(stdout.trim());
  assert.equal(result.health, 200); assert.equal(result.healthBody.status, 'ok');
  assert.equal(result.profile, 401); assert.equal(result.profileBody.code, 'AUTH_REQUIRED');
});

test('the production parser reads a valid non-clinical PDF and reaches exam validation', async t => {
  // pdf-parse ships this public fixture with the installed package. It is not
  // a patient's document and has no collection date or laboratory markers.
  const packagePath = createRequire(import.meta.url).resolve('pdf-parse/package.json');
  const buffer = await readFile(new URL('./test/data/01-valid.pdf', pathToFileURL(packagePath)));
  t.mock.method(mongoose, 'startSession', () => assert.fail('non-clinical fixture must not reach the database'));
  await assert.rejects(importExamPdf({ patientId: '507f1f77bcf86cd799439012', file: { buffer, originalname: 'fixture.pdf' } }), error => error.status === 400 && /data de coleta/.test(error.message));
});
