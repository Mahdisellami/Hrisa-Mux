import { api } from './client';

export interface SoundCloudSearchResult {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  playCount?: number;
  sourceType: 'soundcloud';
}

export interface SoundCloudStreamInfo {
  streamUrl: string;
  format: string;
  quality: string;
}

export interface SoundCloudMetadata {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  playCount?: number;
  sourceType: 'soundcloud';
}

export const soundcloudApi = {
  /**
   * Search for SoundCloud tracks
   */
  async search(query: string, maxResults: number = 20): Promise<SoundCloudSearchResult[]> {
    const response = await api.get('/soundcloud/search', {
      params: { q: query, maxResults },
    });
    return response.data.data.results;
  },

  /**
   * Get stream URL for a SoundCloud track
   */
  async getStreamUrl(trackId: string): Promise<SoundCloudStreamInfo> {
    const response = await api.get(`/soundcloud/stream/${trackId}`);
    return response.data.data;
  },

  /**
   * Get track metadata
   */
  async getMetadata(trackId: string): Promise<SoundCloudMetadata> {
    const response = await api.get(`/soundcloud/metadata/${trackId}`);
    return response.data.data;
  },

  /**
   * Validate track ID
   */
  async validate(trackId: string): Promise<boolean> {
    const response = await api.get(`/soundcloud/validate/${trackId}`);
    return response.data.data.isValid;
  },

  /**
   * Resolve SoundCloud URL to track info
   */
  async resolveUrl(url: string): Promise<SoundCloudMetadata> {
    const response = await api.post('/soundcloud/resolve', { url });
    return response.data.data;
  },

  /**
   * Add SoundCloud track to user's library
   */
  async addToLibrary(trackId: string, title?: string, artist?: string): Promise<any> {
    const response = await api.post('/soundcloud/library', {
      trackId,
      title,
      artist,
    });
    return response.data.data;
  },
};
