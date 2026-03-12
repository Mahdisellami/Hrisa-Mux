import { playlistRepository } from '../repositories/playlist.repository';
import { trackRepository } from '../repositories/track.repository';
import { AppError } from '../middleware/error.middleware';
import { Playlist, NewPlaylist, Track } from '../models';

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImageUrl?: string;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
  trackCount: number;
}

export class PlaylistService {
  async getPlaylistById(playlistId: string, userId?: string): Promise<PlaylistWithTracks> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check if user has access to the playlist
    if (!playlist.isPublic && playlist.userId !== userId) {
      throw new AppError(403, 'You do not have access to this playlist');
    }

    // Get tracks for the playlist
    const playlistTracks = await playlistRepository.getPlaylistTracks(playlistId);
    const trackIds = playlistTracks.map((pt) => pt.trackId);
    const tracks = await trackRepository.findByIds(trackIds);

    // Sort tracks by position
    const tracksMap = new Map(tracks.map((track) => [track.id, track]));
    const sortedTracks = playlistTracks
      .map((pt) => tracksMap.get(pt.trackId))
      .filter((track): track is Track => track !== undefined);

    return {
      ...playlist,
      tracks: sortedTracks,
      trackCount: sortedTracks.length,
    };
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return playlistRepository.findByUserId(userId);
  }

  async getPublicPlaylists(): Promise<Playlist[]> {
    return playlistRepository.findPublicPlaylists();
  }

  async createPlaylist(userId: string, input: CreatePlaylistInput): Promise<Playlist> {
    const newPlaylist: NewPlaylist = {
      userId,
      name: input.name,
      description: input.description,
      isPublic: input.isPublic ?? false,
    };

    return playlistRepository.create(newPlaylist);
  }

  async updatePlaylist(
    playlistId: string,
    userId: string,
    input: UpdatePlaylistInput
  ): Promise<Playlist> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check ownership
    if (playlist.userId !== userId) {
      throw new AppError(403, 'You do not have permission to update this playlist');
    }

    const updated = await playlistRepository.update(playlistId, input);

    if (!updated) {
      throw new AppError(500, 'Failed to update playlist');
    }

    return updated;
  }

  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check ownership
    if (playlist.userId !== userId) {
      throw new AppError(403, 'You do not have permission to delete this playlist');
    }

    await playlistRepository.delete(playlistId);
  }

  async addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    userId: string
  ): Promise<void> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check ownership
    if (playlist.userId !== userId) {
      throw new AppError(403, 'You do not have permission to modify this playlist');
    }

    // Check if track exists
    const track = await trackRepository.findById(trackId);
    if (!track) {
      throw new AppError(404, 'Track not found');
    }

    // Get current track count for position
    const trackCount = await playlistRepository.getTrackCount(playlistId);

    await playlistRepository.addTrack({
      playlistId,
      trackId,
      position: trackCount,
      addedBy: userId,
    });
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    userId: string
  ): Promise<void> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check ownership
    if (playlist.userId !== userId) {
      throw new AppError(403, 'You do not have permission to modify this playlist');
    }

    await playlistRepository.removeTrack(playlistId, trackId);

    // Reorder remaining tracks
    const remainingTracks = await playlistRepository.getPlaylistTracks(playlistId);
    const trackOrders = remainingTracks.map((track, index) => ({
      trackId: track.trackId,
      position: index,
    }));

    if (trackOrders.length > 0) {
      await playlistRepository.reorderTracks(playlistId, trackOrders);
    }
  }

  async reorderPlaylistTracks(
    playlistId: string,
    userId: string,
    trackOrders: { trackId: string; position: number }[]
  ): Promise<void> {
    const playlist = await playlistRepository.findById(playlistId);

    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }

    // Check ownership
    if (playlist.userId !== userId) {
      throw new AppError(403, 'You do not have permission to modify this playlist');
    }

    await playlistRepository.reorderTracks(playlistId, trackOrders);
  }
}

export const playlistService = new PlaylistService();
