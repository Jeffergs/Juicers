import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { patientFollowupAction, submitRequestedResult } from '../controllers/followupController.js';
import { uploadPdf } from '../middlewares/uploadMiddleware.js';
import {
  createOrUpdatePatient,
  getMyPatientProfile,
  deleteMyPatientProfile,
  getMyFollowup,
} from "../controllers/patientController.js";

const router = Router();

router.post("/", authMiddleware, createOrUpdatePatient);

router.get("/me", authMiddleware, getMyPatientProfile);

router.get("/me/followup", authMiddleware, getMyFollowup);
router.post('/me/followup/interactions', authMiddleware, patientFollowupAction);
router.post('/me/followup/requests/:id/result', authMiddleware, (req, res, next) => {
  uploadPdf.single('examPdf')(req, res, error => {
    if (error) return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'O PDF deve ter até 5 MB.' : 'Envie apenas um arquivo PDF válido.' });
    next();
  });
}, submitRequestedResult);

router.delete("/me", authMiddleware, deleteMyPatientProfile);

export default router;
