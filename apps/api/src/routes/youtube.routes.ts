import { Router } from 'express';
import { youtubeController } from '../controllers/youtube.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Search for videos (public)
router.get('/search', youtubeController.search.bind(youtubeController));

// Get stream URL for a video (public)
router.get('/stream/:videoId', youtubeController.getStreamUrl.bind(youtubeController));

// Get video metadata (public)
router.get('/metadata/:videoId', youtubeController.getMetadata.bind(youtubeController));

// Validate video ID (public)
router.get('/validate/:videoId', youtubeController.validate.bind(youtubeController));

// Add video to user's library (protected)
router.post('/library', authenticate, youtubeController.addToLibrary.bind(youtubeController));

export default router;
