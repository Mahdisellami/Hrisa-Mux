import { Request, Response, NextFunction } from 'express';
import { trackService } from '../services/track.service';
import { logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

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

  async streamTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Get track from database
      const track = await trackService.getTrackById(id);

      // Check if track belongs to user (only users can stream their own tracks)
      if (track.userId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only stream tracks from your library',
        });
      }

      // Check if track is local (downloaded)
      if (track.sourceType !== 'local') {
        return res.status(400).json({
          status: 'error',
          message: 'Track must be added to library before streaming',
        });
      }

      // Get file path
      const filePath = path.join('/app', 'uploads', track.sourceId);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.error('Track file not found', { trackId: id, filePath });
        return res.status(404).json({
          status: 'error',
          message: 'Track file not found',
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Handle range requests (for seeking)
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });

        file.pipe(res);
      } else {
        // No range, stream entire file
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });

        fs.createReadStream(filePath).pipe(res);
      }

      logger.info('Track streamed', { trackId: id, userId });
    } catch (error) {
      next(error);
    }
  }
}

export const trackController = new TrackController();
