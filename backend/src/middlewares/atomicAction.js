import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import ClinicalNote from '../models/ClinicalNote.js';

// Queries made by a controller inherit the transaction, including nested helpers.
mongoose.set('transactionAsyncLocalStorage', true);

export function atomicAction(controller, { registration = false } = {}) {
  return async (req, res) => {
    let status = 200;
    let body;
    const deferred = Object.create(res);
    deferred.status = code => { status = code; return deferred };
    deferred.json = value => { body = value; return deferred };
    try {
      await mongoose.connection.transaction(async () => {
        if (!registration) {
          const user = await User.findOneAndUpdate({ _id: req.user.id, $expr: { $eq: [{ $ifNull: ['$sessionVersion', 0] }, req.user.version || 0] } }, { $inc: { dataRevision: 1 } });
          if (!user) throw Object.assign(new Error('Sua sessão mudou. Entre novamente.'), { status: 401, code: 'SESSION_EXPIRED' });
          // Lock the owner of a patient's data as well as the authenticated doctor.
          // A concurrent account deletion must conflict, rather than leaving orphan records.
          if (req.user.role === 'doctor') {
            let patientId = req.params.patientId || req.params.id;
            if (req.params.noteId) patientId = (await ClinicalNote.findById(req.params.noteId))?.patientId;
            if (patientId && mongoose.isValidObjectId(patientId)) {
              const patient = await Patient.findById(patientId);
              if (patient && !await User.findOneAndUpdate({ _id: patient.userId }, { $inc: { dataRevision: 1 } })) throw Object.assign(new Error('Conta do paciente indisponível.'), { status: 404 });
            }
          }
        }
        await controller(req, deferred);
        if (body === undefined) throw new Error('Controller did not finish');
        if (status >= 400) throw Object.assign(new Error('Action rejected'), { responseBody: body, status });
      });
      return res.status(status).json(body);
    } catch (error) {
      return res.status(error.status || 503).json(error.responseBody || { message: error.status ? error.message : 'Não foi possível concluir a operação. Nenhuma alteração parcial foi confirmada.', ...(error.code ? { code: error.code } : {}) });
    }
  };
}
