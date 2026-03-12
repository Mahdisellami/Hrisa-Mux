import { Request, Response, NextFunction } from 'express';
import { parseBuffer } from 'music-metadata';
import { storageService } from '../services/storage.service';
import { trackService } from '../services/track.service';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

export class UploadController {
  async uploadTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      if (!req.file) {
        throw new AppError(400, 'No file uploaded');
      }

      const file = req.file;

      // Extract metadata from audio file
      logger.info('Extracting metadata from audio file', { filename: file.originalname });

      const metadata = await parseBuffer(file.buffer, { mimeType: file.mimetype });

      const title = metadata.common.title || path.parse(file.originalname).name;
      const artist = metadata.common.artist || metadata.common.albumartist || 'Unknown Artist';
      const album = metadata.common.album;
      const duration = Math.floor(metadata.format.duration || 0);

      // Upload file to storage
      logger.info('Uploading file to storage', { userId, filename: file.originalname });

      const uploadResult = await storageService.uploadFile(file, userId);

      // Create track in database
      const track = await trackService.createTrack(userId, {
        title,
        artist,
        album,
        duration,
        sourceType: 'local',
        sourceId: uploadResult.key,
        sourceUrl: uploadResult.url,
        metadata: {
          format: metadata.format.container,
          bitrate: metadata.format.bitrate,
          sampleRate: metadata.format.sampleRate,
          numberOfChannels: metadata.format.numberOfChannels,
          codec: metadata.format.codec,
          fileSize: uploadResult.size,
        },
      });

      logger.info('Track uploaded successfully', { trackId: track.id, userId });

      res.status(201).json({
        status: 'success',
        data: { track },
      });
    } catch (error) {
      logger.error('Upload failed:', error);
      next(error);
    }
  }

  async streamTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;

      if (!key) {
        throw new AppError(400, 'File key is required');
      }

      // Decode the key
      const decodedKey = decodeURIComponent(key);

      logger.info('Streaming track', { key: decodedKey });

      if (config.storage.type === 's3') {
        // For S3, redirect to signed URL or stream from S3
        const stream = await storageService.getFileStream(decodedKey);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');

        if (stream instanceof Buffer) {
          res.send(stream);
        } else {
          stream.pipe(res);
        }
      } else {
        // For local storage, stream the file
        const filepath = storageService.getLocalFilePath(decodedKey);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
          throw new AppError(404, 'File not found');
        }

        const stat = fs.statSync(filepath);
        const fileSize = stat.size;

        // Handle range requests for seeking
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = end - start + 1;

          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Length', chunkSize);
          res.setHeader('Content-Type', 'audio/mpeg');

          const stream = fs.createReadStream(filepath, { start, end });
          stream.pipe(res);
        } else {
          res.setHeader('Content-Length', fileSize);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Accept-Ranges', 'bytes');

          const stream = fs.createReadStream(filepath);
          stream.pipe(res);
        }
      }
    } catch (error) {
      logger.error('Streaming failed:', error);
      next(error);
    }
  }

  async deleteTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      // Get track to find the file key
      const track = await trackService.getTrackById(id);

      if (track.sourceType !== 'local') {
        throw new AppError(400, 'Can only delete local tracks');
      }

      if (track.uploadedBy !== userId) {
        throw new AppError(403, 'You do not have permission to delete this track');
      }

      // Delete file from storage
      await storageService.deleteFile(track.sourceId);

      // Delete track from database
      await trackService.deleteTrack(id, userId);

      logger.info('Track deleted successfully', { trackId: id, userId });

      res.status(200).json({
        status: 'success',
        message: 'Track deleted successfully',
      });
    } catch (error) {
      logger.error('Delete failed:', error);
      next(error);
    }
  }
}

export const uploadController = new UploadController();
