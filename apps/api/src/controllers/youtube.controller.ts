import { Request, Response, NextFunction } from 'express';
import { youtubeService } from '../services/youtube.service';
import { trackService } from '../services/track.service';
import { downloadService } from '../services/download.service';
import { logger } from '../utils/logger';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  maxResults: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

const videoIdSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
});

const addToLibrarySchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  title: z.string().optional(),
  artist: z.string().optional(),
});

class YouTubeController {
  /**
   * Search for YouTube videos
   * GET /api/youtube/search?q=query&maxResults=20
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, maxResults } = searchQuerySchema.parse(req.query);

      const results = await youtubeService.search(q, maxResults);

      res.json({
        success: true,
        data: {
          results,
          count: results.length,
        },
      });
    } catch (error: any) {
      logger.error('YouTube search error', { error: error.message });
      next(error);
    }
  }

  /**
   * Get stream URL for a YouTube video
   * GET /api/youtube/stream/:videoId
   */
  async getStreamUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = videoIdSchema.parse(req.params);

      const streamInfo = await youtubeService.getStreamUrl(videoId);

      res.json({
        success: true,
        data: streamInfo,
      });
    } catch (error: any) {
      logger.error('YouTube stream URL error', { error: error.message });
      next(error);
    }
  }

  /**
   * Get video metadata
   * GET /api/youtube/metadata/:videoId
   */
  async getMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = videoIdSchema.parse(req.params);

      const metadata = await youtubeService.getVideoMetadata(videoId);

      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: 'Video not found',
        });
      }

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error: any) {
      logger.error('YouTube metadata error', { error: error.message });
      next(error);
    }
  }

  /**
   * Add YouTube video to user's library
   * POST /api/youtube/library
   */
  async addToLibrary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { videoId, title, artist } = addToLibrarySchema.parse(req.body);

      // Get video metadata if title/artist not provided
      let metadata = null;
      if (!title || !artist) {
        metadata = await youtubeService.getVideoMetadata(videoId);
        if (!metadata) {
          return res.status(404).json({
            success: false,
            error: 'Video not found',
          });
        }
      }

      // Check if track already exists for this user
      const existingTrack = await trackService.findBySourceId(userId, videoId);
      if (existingTrack) {
        return res.status(409).json({
          success: false,
          error: 'Track already in library',
          data: existingTrack,
        });
      }

      // Download MP3 file
      logger.info('Downloading YouTube audio', { userId, videoId });
      const downloadResult = await downloadService.downloadYouTube(videoId);

      // Create track in database with local file path
      const track = await trackService.createTrack(userId, {
        title: title || metadata!.title,
        artist: artist || metadata!.artist,
        album: undefined,
        duration: metadata!.duration,
        sourceType: 'local', // Changed from 'youtube' to 'local'
        sourceId: downloadResult.fileName, // Store filename instead of videoId
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: metadata!.thumbnailUrl,
        metadata: {
          viewCount: metadata!.viewCount,
          originalSource: 'youtube',
          youtubeVideoId: videoId,
          fileSize: downloadResult.fileSize,
        },
      });

      logger.info('YouTube track added to library', { userId, videoId, trackId: track.id, fileName: downloadResult.fileName });

      res.status(201).json({
        success: true,
        data: track,
      });
    } catch (error: any) {
      logger.error('Add YouTube to library error', { error: error.message });
      next(error);
    }
  }

  /**
   * Validate video ID
   * GET /api/youtube/validate/:videoId
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = videoIdSchema.parse(req.params);

      const isValid = await youtubeService.validateVideoId(videoId);

      res.json({
        success: true,
        data: {
          videoId,
          isValid,
        },
      });
    } catch (error: any) {
      logger.error('YouTube validation error', { error: error.message });
      next(error);
    }
  }
}

export const youtubeController = new YouTubeController();
