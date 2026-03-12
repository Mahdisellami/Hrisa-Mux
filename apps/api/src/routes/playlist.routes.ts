import { Router } from 'express';
import { z } from 'zod';
import { playlistController } from '../controllers/playlist.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

const createPlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
  }),
});

const updatePlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
    coverImageUrl: z.string().url().optional(),
  }),
});

const addTrackSchema = z.object({
  body: z.object({
    trackId: z.string().uuid('Invalid track ID'),
  }),
});

const reorderTracksSchema = z.object({
  body: z.object({
    trackOrders: z.array(
      z.object({
        trackId: z.string().uuid(),
        position: z.number().int().nonnegative(),
      })
    ),
  }),
});

// Public routes
router.get('/public', playlistController.getPublicPlaylists.bind(playlistController));

// Protected routes
router.get('/me', authenticate, playlistController.getUserPlaylists.bind(playlistController));

router.post(
  '/',
  authenticate,
  validateRequest(createPlaylistSchema),
  playlistController.createPlaylist.bind(playlistController)
);

router.get(
  '/:id',
  optionalAuth,
  playlistController.getPlaylist.bind(playlistController)
);

router.put(
  '/:id',
  authenticate,
  validateRequest(updatePlaylistSchema),
  playlistController.updatePlaylist.bind(playlistController)
);

router.delete(
  '/:id',
  authenticate,
  playlistController.deletePlaylist.bind(playlistController)
);

router.post(
  '/:id/tracks',
  authenticate,
  validateRequest(addTrackSchema),
  playlistController.addTrack.bind(playlistController)
);

router.delete(
  '/:id/tracks/:trackId',
  authenticate,
  playlistController.removeTrack.bind(playlistController)
);

router.put(
  '/:id/reorder',
  authenticate,
  validateRequest(reorderTracksSchema),
  playlistController.reorderTracks.bind(playlistController)
);

export default router;
