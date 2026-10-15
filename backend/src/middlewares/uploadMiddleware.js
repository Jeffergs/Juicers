import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Apenas arquivos PDF são permitidos"), false);
  }

  cb(null, true);
};

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export function singleExamPdf(req, res, next) {
  uploadPdf.single('examPdf')(req, res, error => {
    if (error) return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'O PDF deve ter até 5 MB.' : 'Envie apenas um arquivo PDF válido.' });
    return next();
  });
}
