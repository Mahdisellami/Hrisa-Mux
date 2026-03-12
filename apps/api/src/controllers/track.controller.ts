import { Request, Response, NextFunction } from 'express';
import { trackService } from '../services/track.service';
import { logger } from '../utils/logger';

export class TrackController {
  async getTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const track = await trackService.getTrackById(id);

      res.status(200).json({
        status: 'success',
        data: { track },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTracks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const tracks = await trackService.getUserTracks(userId);

      res.status(200).json({
        status: 'success',
        data: { tracks },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { title, artist, album, duration, sourceType, sourceId, sourceUrl, thumbnailUrl, metadata } = req.body;

      const track = await trackService.findOrCreateTrack(userId, {
        title,
        artist,
        album,
        duration,
        sourceType,
        sourceId,
        sourceUrl,
        thumbnailUrl,
        metadata,
      });

      logger.info('Track created or found', { trackId: track.id, userId });

      res.status(201).json({
        status: 'success',
        data: { track },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;
      const { title, artist, album, thumbnailUrl, metadata } = req.body;

      const track = await trackService.updateTrack(id, userId, {
        title,
        artist,
        album,
        thumbnailUrl,
        metadata,
      });

      logger.info('Track updated', { trackId: id, userId });

      res.status(200).json({
        status: 'success',
        data: { track },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;

      await trackService.deleteTrack(id, userId);

      logger.info('Track deleted', { trackId: id, userId });

      res.status(200).json({
        status: 'success',
        message: 'Track deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchTracks(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, sourceType } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "q" is required',
        });
      }

      const tracks = await trackService.searchTracks(q, sourceType as string | undefined);

      res.status(200).json({
        status: 'success',
        data: { tracks },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const trackController = new TrackController();
