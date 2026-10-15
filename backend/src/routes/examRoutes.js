import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createExam,
  getMyExams,
  getExamById,
  updateExam,
  deleteExam,
  uploadMyExam,
} from "../controllers/examController.js";

const router = Router();
import { getExamFile } from '../controllers/examFileController.js';
import { singleExamPdf } from '../middlewares/uploadMiddleware.js';
import { atomicAction } from '../middlewares/atomicAction.js';

router.post("/", authMiddleware, atomicAction(createExam));
router.post('/upload', authMiddleware, singleExamPdf, uploadMyExam);
router.get("/", authMiddleware, getMyExams);
router.get('/:id/file', authMiddleware, getExamFile);
router.get("/:id", authMiddleware, getExamById);
router.put("/:id", authMiddleware, atomicAction(updateExam));
router.delete("/:id", authMiddleware, atomicAction(deleteExam));

export default router;
