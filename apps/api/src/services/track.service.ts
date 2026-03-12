import { trackRepository } from '../repositories/track.repository';
import { AppError } from '../middleware/error.middleware';
import { Track, NewTrack } from '../models';

export interface CreateTrackInput {
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  sourceType: 'youtube' | 'soundcloud' | 'local';
  sourceId: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTrackInput {
  title?: string;
  artist?: string;
  album?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export class TrackService {
  async getTrackById(trackId: string): Promise<Track> {
    const track = await trackRepository.findById(trackId);

    if (!track) {
      throw new AppError(404, 'Track not found');
    }

    return track;
  }

  async getUserTracks(userId: string): Promise<Track[]> {
    return trackRepository.findByUploader(userId);
  }

  async createTrack(userId: string | undefined, input: CreateTrackInput): Promise<Track> {
    const newTrack: NewTrack = {
      title: input.title,
      artist: input.artist,
      album: input.album,
      duration: input.duration,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      sourceUrl: input.sourceUrl,
      thumbnailUrl: input.thumbnailUrl,
      metadata: input.metadata,
      uploadedBy: userId,
    };

    return trackRepository.create(newTrack);
  }

  async findOrCreateTrack(
    userId: string | undefined,
    input: CreateTrackInput
  ): Promise<Track> {
    // Check if track already exists
    const existing = await trackRepository.findBySourceId(input.sourceType, input.sourceId);

    if (existing) {
      return existing;
    }

    // Create new track
    return this.createTrack(userId, input);
  }

  async updateTrack(trackId: string, userId: string, input: UpdateTrackInput): Promise<Track> {
    const track = await trackRepository.findById(trackId);

    if (!track) {
      throw new AppError(404, 'Track not found');
    }

    // Only uploaded tracks can be updated, and only by the uploader
    if (track.sourceType !== 'local') {
      throw new AppError(400, 'Only local tracks can be updated');
    }

    if (track.uploadedBy !== userId) {
      throw new AppError(403, 'You do not have permission to update this track');
    }

    const updated = await trackRepository.update(trackId, input);

    if (!updated) {
      throw new AppError(500, 'Failed to update track');
    }

    return updated;
  }

  async deleteTrack(trackId: string, userId: string): Promise<void> {
    const track = await trackRepository.findById(trackId);

    if (!track) {
      throw new AppError(404, 'Track not found');
    }

    // Only uploaded tracks can be deleted, and only by the uploader
    if (track.sourceType !== 'local') {
      throw new AppError(400, 'Only local tracks can be deleted');
    }

    if (track.uploadedBy !== userId) {
      throw new AppError(403, 'You do not have permission to delete this track');
    }

    await trackRepository.delete(trackId);
  }

  async searchTracks(query: string, sourceType?: string): Promise<Track[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return trackRepository.search(query, sourceType);
  }
}

export const trackService = new TrackService();
