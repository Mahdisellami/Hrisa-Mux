import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// Upload a new track
router.post(
  '/',
  authenticate,
  upload.single('file'),
  handleUploadError,
  uploadController.uploadTrack.bind(uploadController)
);

// Stream a track (supports range requests for seeking)
router.get(
  '/stream/:key(*)',
  uploadController.streamTrack.bind(uploadController)
);

// Delete a track
router.delete(
  '/:id',
  authenticate,
  uploadController.deleteTrack.bind(uploadController)
);

export default router;
