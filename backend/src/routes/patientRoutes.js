import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { patientFollowupAction, submitRequestedResult } from '../controllers/followupController.js';
import { singleExamPdf } from '../middlewares/uploadMiddleware.js';
import { deletePatientAccount } from '../controllers/accountDataController.js';
import { authRateLimit } from '../middlewares/authRateLimit.js';
import { atomicAction } from '../middlewares/atomicAction.js';
import {
  createOrUpdatePatient,
  getMyPatientProfile,
  getMyFollowup,
} from "../controllers/patientController.js";

const router = Router();

router.post("/", authMiddleware, atomicAction(createOrUpdatePatient));

router.get("/me", authMiddleware, getMyPatientProfile);

router.get("/me/followup", authMiddleware, getMyFollowup);
router.post('/me/followup/interactions', authMiddleware, atomicAction(patientFollowupAction));
router.post('/me/followup/requests/:id/result', authMiddleware, singleExamPdf, submitRequestedResult);

// Keep the legacy URL consistent with account deletion; it must never orphan records.
router.delete('/me', authMiddleware, authRateLimit(), deletePatientAccount);

export default router;
