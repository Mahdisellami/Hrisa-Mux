import ytdl from '@distube/ytdl-core';
import { google } from 'googleapis';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { RedisService } from './redis.service';

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
  expiresAt: Date;
  format: string;
  quality: string;
}

export class YouTubeService {
  private youtube;
  private redisService: RedisService;

  constructor() {
    if (config.youtube.apiKey) {
      this.youtube = google.youtube({
        version: 'v3',
        auth: config.youtube.apiKey,
      });
    }
    this.redisService = RedisService.getInstance();
  }

  /**
   * Search for videos on YouTube
   */
  async search(query: string, maxResults: number = 20): Promise<YouTubeSearchResult[]> {
    if (!this.youtube) {
      logger.warn('YouTube API key not configured - returning empty results');
      return [];
    }

    const cacheKey = `youtube:search:${query}:${maxResults}`;

    // Check cache first
    const cached = await this.redisService.get<YouTubeSearchResult[]>(cacheKey);
    if (cached) {
      logger.info('YouTube search cache hit', { query });
      return cached;
    }

    try {
      // Search for videos
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults,
      });

      const videoIds = searchResponse.data.items?.map((item) => item.id?.videoId).filter(Boolean) as string[];

      if (!videoIds || videoIds.length === 0) {
        return [];
      }

      // Get video details (duration, view count)
      const videosResponse = await this.youtube.videos.list({
        part: ['contentDetails', 'statistics', 'snippet'],
        id: videoIds,
      });

      const results: YouTubeSearchResult[] = videosResponse.data.items?.map((video) => {
        const duration = this.parseDuration(video.contentDetails?.duration || '');
        const title = video.snippet?.title || 'Unknown Title';
        const channelTitle = video.snippet?.channelTitle || 'Unknown Artist';

        return {
          id: video.id!,
          title,
          artist: channelTitle,
          duration,
          thumbnailUrl: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || '',
          viewCount: parseInt(video.statistics?.viewCount || '0', 10),
          sourceType: 'youtube' as const,
        };
      }) || [];

      // Cache results
      await this.redisService.set(cacheKey, results, config.cache.ttl.youtube);

      logger.info('YouTube search completed', { query, resultsCount: results.length });

      return results;
    } catch (error: any) {
      logger.error('YouTube search error', { error: error.message, query });
      throw new Error(`Failed to search YouTube: ${error.message}`);
    }
  }

  /**
   * Get stream URL for a YouTube video
   */
  async getStreamUrl(videoId: string): Promise<YouTubeStreamInfo> {
    const cacheKey = `youtube:stream:${videoId}`;

    // Check cache first
    const cached = await this.redisService.get<YouTubeStreamInfo>(cacheKey);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      logger.info('YouTube stream cache hit', { videoId });
      return cached;
    }

    try {
      const info = await ytdl.getInfo(videoId, {
        lang: 'en',
      });

      // Get the best audio format
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

      if (audioFormats.length === 0) {
        throw new Error('No audio formats available');
      }

      // Sort by quality (bitrate)
      const bestFormat = audioFormats.sort((a, b) => {
        const aBitrate = parseInt(a.bitrate as any, 10) || 0;
        const bBitrate = parseInt(b.bitrate as any, 10) || 0;
        return bBitrate - aBitrate;
      })[0];

      if (!bestFormat.url) {
        throw new Error('No stream URL available');
      }

      // URLs expire in ~6 hours, cache for 5 hours to be safe
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);

      const streamInfo: YouTubeStreamInfo = {
        streamUrl: bestFormat.url,
        expiresAt,
        format: bestFormat.mimeType?.split(';')[0] || 'audio/mp4',
        quality: `${Math.round((parseInt(bestFormat.bitrate as any, 10) || 0) / 1000)}kbps`,
      };

      // Cache with 5 hour TTL
      await this.redisService.set(cacheKey, streamInfo, 5 * 60 * 60);

      logger.info('YouTube stream URL extracted', { videoId, quality: streamInfo.quality });

      return streamInfo;
    } catch (error: any) {
      logger.error('YouTube stream extraction error', { error: error.message, videoId });
      throw new Error(`Failed to get stream URL: ${error.message}`);
    }
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoId: string): Promise<YouTubeSearchResult | null> {
    if (!this.youtube) {
      logger.warn('YouTube API key not configured');
      return null;
    }

    const cacheKey = `youtube:metadata:${videoId}`;

    // Check cache first
    const cached = await this.redisService.get<YouTubeSearchResult>(cacheKey);
    if (cached) {
      logger.info('YouTube metadata cache hit', { videoId });
      return cached;
    }

    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId],
      });

      const video = response.data.items?.[0];

      if (!video) {
        return null;
      }

      const duration = this.parseDuration(video.contentDetails?.duration || '');
      const title = video.snippet?.title || 'Unknown Title';
      const channelTitle = video.snippet?.channelTitle || 'Unknown Artist';

      const metadata: YouTubeSearchResult = {
        id: video.id!,
        title,
        artist: channelTitle,
        duration,
        thumbnailUrl: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || '',
        viewCount: parseInt(video.statistics?.viewCount || '0', 10),
        sourceType: 'youtube' as const,
      };

      // Cache metadata
      await this.redisService.set(cacheKey, metadata, config.cache.ttl.metadata);

      logger.info('YouTube metadata retrieved', { videoId });

      return metadata;
    } catch (error: any) {
      logger.error('YouTube metadata error', { error: error.message, videoId });
      throw new Error(`Failed to get video metadata: ${error.message}`);
    }
  }

  /**
   * Validate if a video ID exists and is available
   */
  async validateVideoId(videoId: string): Promise<boolean> {
    try {
      const metadata = await this.getVideoMetadata(videoId);
      return metadata !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) {
      return 0;
    }

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }
}

export const youtubeService = new YouTubeService();
