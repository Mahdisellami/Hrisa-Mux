import { Router } from 'express';
import { soundcloudController } from '../controllers/soundcloud.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Search for tracks (public)
router.get('/search', soundcloudController.search.bind(soundcloudController));

// Get stream URL for a track (public)
router.get('/stream/:trackId', soundcloudController.getStreamUrl.bind(soundcloudController));

// Get track metadata (public)
router.get('/metadata/:trackId', soundcloudController.getMetadata.bind(soundcloudController));

// Validate track ID (public)
router.get('/validate/:trackId', soundcloudController.validate.bind(soundcloudController));

// Resolve SoundCloud URL to track info (public)
router.post('/resolve', soundcloudController.resolveUrl.bind(soundcloudController));

// Add track to user's library (protected)
router.post('/library', authenticate, soundcloudController.addToLibrary.bind(soundcloudController));

export default router;
