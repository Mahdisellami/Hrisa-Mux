import { api } from './client';

export interface YouTubeSearchResult {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  viewCount?: number;
  sourceType: 'youtube';
}

export interface YouTubeStreamInfo {
  streamUrl: string;
  expiresAt: string;
  format: string;
  quality: string;
}

export interface YouTubeMetadata {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl: string;
  viewCount?: number;
  sourceType: 'youtube';
}

export const youtubeApi = {
  /**
   * Search for YouTube videos
   */
  async search(query: string, maxResults: number = 20): Promise<YouTubeSearchResult[]> {
    const response = await api.get('/youtube/search', {
      params: { q: query, maxResults },
    });
    return response.data.data.results;
  },

  /**
   * Get stream URL for a YouTube video
   */
  async getStreamUrl(videoId: string): Promise<YouTubeStreamInfo> {
    const response = await api.get(`/youtube/stream/${videoId}`);
    return response.data.data;
  },

  /**
   * Get video metadata
   */
  async getMetadata(videoId: string): Promise<YouTubeMetadata> {
    const response = await api.get(`/youtube/metadata/${videoId}`);
    return response.data.data;
  },

  /**
   * Validate video ID
   */
  async validate(videoId: string): Promise<boolean> {
    const response = await api.get(`/youtube/validate/${videoId}`);
    return response.data.data.isValid;
  },

  /**
   * Add YouTube video to user's library
   */
  async addToLibrary(videoId: string, title?: string, artist?: string): Promise<any> {
    const response = await api.post('/youtube/library', {
      videoId,
      title,
      artist,
    });
    return response.data.data;
  },
};
