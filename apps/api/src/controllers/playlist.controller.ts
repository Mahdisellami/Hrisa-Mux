import { Request, Response, NextFunction } from 'express';
import { playlistService } from '../services/playlist.service';
import { logger } from '../utils/logger';

export class PlaylistController {
  async getPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const playlist = await playlistService.getPlaylistById(id, userId);

      res.status(200).json({
        status: 'success',
        data: { playlist },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPlaylists(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const playlists = await playlistService.getUserPlaylists(userId);

      res.status(200).json({
        status: 'success',
        data: { playlists },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicPlaylists(req: Request, res: Response, next: NextFunction) {
    try {
      const playlists = await playlistService.getPublicPlaylists();

      res.status(200).json({
        status: 'success',
        data: { playlists },
      });
    } catch (error) {
      next(error);
    }
  }

  async createPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { name, description, isPublic } = req.body;

      const playlist = await playlistService.createPlaylist(userId, {
        name,
        description,
        isPublic,
      });

      logger.info('Playlist created', { playlistId: playlist.id, userId });

      res.status(201).json({
        status: 'success',
        data: { playlist },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;
      const { name, description, isPublic, coverImageUrl } = req.body;

      const playlist = await playlistService.updatePlaylist(id, userId, {
        name,
        description,
        isPublic,
        coverImageUrl,
      });

      logger.info('Playlist updated', { playlistId: id, userId });

      res.status(200).json({
        status: 'success',
        data: { playlist },
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;

      await playlistService.deletePlaylist(id, userId);

      logger.info('Playlist deleted', { playlistId: id, userId });

      res.status(200).json({
        status: 'success',
        message: 'Playlist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;
      const { trackId } = req.body;

      await playlistService.addTrackToPlaylist(id, trackId, userId);

      logger.info('Track added to playlist', { playlistId: id, trackId, userId });

      res.status(200).json({
        status: 'success',
        message: 'Track added to playlist',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id, trackId } = req.params;

      await playlistService.removeTrackFromPlaylist(id, trackId, userId);

      logger.info('Track removed from playlist', { playlistId: id, trackId, userId });

      res.status(200).json({
        status: 'success',
        message: 'Track removed from playlist',
      });
    } catch (error) {
      next(error);
    }
  }

  async reorderTracks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;
      const { trackOrders } = req.body;

      await playlistService.reorderPlaylistTracks(id, userId, trackOrders);

      logger.info('Playlist tracks reordered', { playlistId: id, userId });

      res.status(200).json({
        status: 'success',
        message: 'Tracks reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const playlistController = new PlaylistController();
