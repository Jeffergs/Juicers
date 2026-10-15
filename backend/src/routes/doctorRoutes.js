import { Router } from "express";
import {
  createDoctorInvite,
  getMyDoctorPatients,
  removeDoctorPatient,
  getMyDoctorPatientById,
  getMyDoctorPatientExams,
  uploadPatientExamPdf,
  deleteDoctorPatientExam,
  getDoctorPatientFollowup,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
  toggleRequestedExam,
  getMyDoctorProfile,
  getInviteByToken,
  acceptInvite,
} from "../controllers/doctorController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { verifiedDoctorMiddleware } from "../middlewares/verifiedDoctorMiddleware.js";
import { singleExamPdf } from "../middlewares/uploadMiddleware.js";
import { doctorFollowupAction } from '../controllers/followupController.js';
import { atomicAction } from '../middlewares/atomicAction.js';

const router = Router();
import { getExamFile } from '../controllers/examFileController.js';

router.get("/me", authMiddleware, verifiedDoctorMiddleware, getMyDoctorProfile);

router.post("/invites", authMiddleware, verifiedDoctorMiddleware, createDoctorInvite);

router.get("/patients", authMiddleware, verifiedDoctorMiddleware, getMyDoctorPatients);
router.delete("/patients/:id", authMiddleware, verifiedDoctorMiddleware, removeDoctorPatient);
router.get("/patients/:id", authMiddleware, verifiedDoctorMiddleware, getMyDoctorPatientById);
router.get("/patients/:id/exams", authMiddleware, verifiedDoctorMiddleware, getMyDoctorPatientExams);
router.get('/patients/:patientId/exams/:examId/file', authMiddleware, verifiedDoctorMiddleware, getExamFile);

router.post(
  "/patients/:id/exams/upload",
  authMiddleware,
  verifiedDoctorMiddleware,
  singleExamPdf,
  uploadPatientExamPdf
);

router.delete(
  "/patients/:patientId/exams/:examId",
  authMiddleware,
  verifiedDoctorMiddleware,
  atomicAction(deleteDoctorPatientExam)
);

router.get("/patients/:id/followup", authMiddleware, verifiedDoctorMiddleware, getDoctorPatientFollowup);
router.post('/patients/:id/followup/:itemId', authMiddleware, verifiedDoctorMiddleware, atomicAction(doctorFollowupAction));
router.post("/patients/:id/notes", authMiddleware, verifiedDoctorMiddleware, atomicAction(createClinicalNote));
router.post("/patients/:id/requested-exams", authMiddleware, verifiedDoctorMiddleware, atomicAction(toggleRequestedExam));

router.put("/notes/:noteId", authMiddleware, verifiedDoctorMiddleware, atomicAction(updateClinicalNote));
router.delete("/notes/:noteId", authMiddleware, verifiedDoctorMiddleware, atomicAction(deleteClinicalNote));

router.get("/invites/:token", getInviteByToken);
router.post("/invites/:token/accept", authMiddleware, atomicAction(acceptInvite));

export default router;
