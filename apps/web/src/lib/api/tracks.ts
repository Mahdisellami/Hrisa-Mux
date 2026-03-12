import { api } from './client';
import { Track } from './playlists';

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

export const tracksApi = {
  async getTrackById(id: string): Promise<Track> {
    const response = await api.get(`/tracks/${id}`);
    return response.data.data.track;
  },

  async getUserTracks(): Promise<Track[]> {
    const response = await api.get('/tracks/me/library');
    return response.data.data.tracks;
  },

  async createTrack(data: CreateTrackInput): Promise<Track> {
    const response = await api.post('/tracks', data);
    return response.data.data.track;
  },

  async updateTrack(id: string, data: UpdateTrackInput): Promise<Track> {
    const response = await api.put(`/tracks/${id}`, data);
    return response.data.data.track;
  },

  async deleteTrack(id: string): Promise<void> {
    await api.delete(`/tracks/${id}`);
  },

  async searchTracks(query: string, sourceType?: string): Promise<Track[]> {
    const params = new URLSearchParams({ q: query });
    if (sourceType) {
      params.append('sourceType', sourceType);
    }
    const response = await api.get(`/tracks/search?${params.toString()}`);
    return response.data.data.tracks;
  },
};
