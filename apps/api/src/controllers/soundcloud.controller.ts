import { Request, Response, NextFunction } from 'express';
import { soundcloudService } from '../services/soundcloud.service';
import { trackService } from '../services/track.service';
import { logger } from '../utils/logger';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  maxResults: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

const trackIdSchema = z.object({
  trackId: z.string().min(1, 'Track ID is required'),
});

const addToLibrarySchema = z.object({
  trackId: z.string().min(1, 'Track ID is required'),
  title: z.string().optional(),
  artist: z.string().optional(),
});

const urlSchema = z.object({
  url: z.string().url('Valid SoundCloud URL is required'),
});

class SoundCloudController {
  /**
   * Search for SoundCloud tracks
   * GET /api/soundcloud/search?q=query&maxResults=20
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, maxResults } = searchQuerySchema.parse(req.query);

      const results = await soundcloudService.search(q, maxResults);

      res.json({
        success: true,
        data: {
          results,
          count: results.length,
        },
      });
    } catch (error: any) {
      logger.error('SoundCloud search error', { error: error.message });
      next(error);
    }
  }

  /**
   * Get stream URL for a SoundCloud track
   * GET /api/soundcloud/stream/:trackId
   */
  async getStreamUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = trackIdSchema.parse(req.params);

      const streamInfo = await soundcloudService.getStreamUrl(trackId);

      res.json({
        success: true,
        data: streamInfo,
      });
    } catch (error: any) {
      logger.error('SoundCloud stream URL error', { error: error.message });
      next(error);
    }
  }

  /**
   * Get track metadata
   * GET /api/soundcloud/metadata/:trackId
   */
  async getMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = trackIdSchema.parse(req.params);

      const metadata = await soundcloudService.getTrackMetadata(trackId);

      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: 'Track not found',
        });
      }

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error: any) {
      logger.error('SoundCloud metadata error', { error: error.message });
      next(error);
    }
  }

  /**
   * Get track info from URL
   * POST /api/soundcloud/resolve
   */
  async resolveUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = urlSchema.parse(req.body);

      const track = await soundcloudService.getTrackByUrl(url);

      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found',
        });
      }

      res.json({
        success: true,
        data: track,
      });
    } catch (error: any) {
      logger.error('SoundCloud URL resolve error', { error: error.message });
      next(error);
    }
  }

  /**
   * Add SoundCloud track to user's library
   * POST /api/soundcloud/library
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

      const { trackId, title, artist } = addToLibrarySchema.parse(req.body);

      // Get track metadata if title/artist not provided
      let metadata = null;
      if (!title || !artist) {
        metadata = await soundcloudService.getTrackMetadata(trackId);
        if (!metadata) {
          return res.status(404).json({
            success: false,
            error: 'Track not found',
          });
        }
      }

      // Check if track already exists for this user
      const existingTrack = await trackService.findBySourceId(userId, trackId);
      if (existingTrack) {
        return res.status(409).json({
          success: false,
          error: 'Track already in library',
          data: existingTrack,
        });
      }

      // Create track in database
      const track = await trackService.createTrack(userId, {
        title: title || metadata!.title,
        artist: artist || metadata!.artist,
        album: undefined,
        duration: metadata!.duration,
        sourceType: 'soundcloud',
        sourceId: trackId,
        sourceUrl: `https://soundcloud.com/${trackId}`,
        thumbnailUrl: metadata!.thumbnailUrl,
        metadata: {
          playCount: metadata!.playCount,
        },
      });

      logger.info('SoundCloud track added to library', { userId, trackId, trackId: track.id });

      res.status(201).json({
        success: true,
        data: track,
      });
    } catch (error: any) {
      logger.error('Add SoundCloud to library error', { error: error.message });
      next(error);
    }
  }

  /**
   * Validate track ID
   * GET /api/soundcloud/validate/:trackId
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = trackIdSchema.parse(req.params);

      const isValid = await soundcloudService.validateTrackId(trackId);

      res.json({
        success: true,
        data: {
          trackId,
          isValid,
        },
      });
    } catch (error: any) {
      logger.error('SoundCloud validation error', { error: error.message });
      next(error);
    }
  }
}

export const soundcloudController = new SoundCloudController();
