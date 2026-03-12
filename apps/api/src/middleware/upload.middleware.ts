import multer from 'multer';
import { config } from '../config/env';
import { AppError } from './error.middleware';

// File filter to only accept audio files
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = config.upload.allowedTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, `File type ${file.mimetype} is not supported. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer for memory storage (we'll handle the actual storage in the service)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter,
});

// Middleware to handle multer errors
export function handleUploadError(
  err: any,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: `File too large. Maximum size is ${config.upload.maxFileSize / (1024 * 1024)}MB`,
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  next(err);
}
