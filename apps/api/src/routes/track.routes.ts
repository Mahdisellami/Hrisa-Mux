import { Router } from 'express';
import { z } from 'zod';
import { trackController } from '../controllers/track.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

const createTrackSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    artist: z.string().max(255).optional(),
    album: z.string().max(255).optional(),
    duration: z.number().int().positive('Duration must be positive'),
    sourceType: z.enum(['youtube', 'soundcloud', 'local']),
    sourceId: z.string().min(1, 'Source ID is required'),
    sourceUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const updateTrackSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    artist: z.string().max(255).optional(),
    album: z.string().max(255).optional(),
    thumbnailUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Public routes
router.get('/search', trackController.searchTracks.bind(trackController));

router.get('/:id', trackController.getTrack.bind(trackController));

// Protected routes
router.get('/me/library', authenticate, trackController.getUserTracks.bind(trackController));

router.post(
  '/',
  optionalAuth,
  validateRequest(createTrackSchema),
  trackController.createTrack.bind(trackController)
);

router.put(
  '/:id',
  authenticate,
  validateRequest(updateTrackSchema),
  trackController.updateTrack.bind(trackController)
);

router.delete('/:id', authenticate, trackController.deleteTrack.bind(trackController));

export default router;
