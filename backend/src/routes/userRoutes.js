import { Router } from "express";
import {
  createUser,
  loginUser,
  loginWithGoogle,
  reverifyDoctor,
  changePassword,
  updateUserProfile,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import User from '../models/User.js';
import { clearSession } from '../utils/session.js';
import { authRateLimit } from '../middlewares/authRateLimit.js';
import { deletePatientAccount, exportPatientData } from '../controllers/accountDataController.js';
import { atomicAction } from '../middlewares/atomicAction.js';

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Rota de usuários funcionando",
  });
});

router.post("/", authRateLimit(), atomicAction(createUser, { registration: true }));
router.post("/login", authRateLimit(), loginUser);
router.post("/google", authRateLimit(), loginWithGoogle);
router.post("/verify-doctor", authRateLimit(), reverifyDoctor);

router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role');
    if (!user) return res.status(401).json({ code: 'SESSION_EXPIRED', message: 'Entre novamente.' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, expiresAt: req.user.exp * 1000 });
  } catch (error) { next(error); }
});
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
    clearSession(res);
    res.json({ message: 'Sessões encerradas.' });
  } catch (error) { next(error); }
});

router.put("/profile", authMiddleware, atomicAction(updateUserProfile));
router.put("/password", authMiddleware, authRateLimit(), changePassword);
router.get('/me/data', authMiddleware, exportPatientData);
router.delete('/me', authMiddleware, authRateLimit(), deletePatientAccount);

export default router;
