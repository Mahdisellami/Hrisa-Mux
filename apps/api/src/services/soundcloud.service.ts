import SoundCloud from 'soundcloud-scraper';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { RedisService } from './redis.service';

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

export class SoundCloudService {
  private client: SoundCloud.Client;
  private redisService: RedisService;

  constructor() {
    const clientId = config.soundcloud.clientId;
    this.client = new SoundCloud.Client(clientId);
    this.redisService = RedisService.getInstance();
  }

  /**
   * Search for tracks on SoundCloud
   */
  async search(query: string, maxResults: number = 20): Promise<SoundCloudSearchResult[]> {
    const cacheKey = `soundcloud:search:${query}:${maxResults}`;

    // Check cache first
    const cached = await this.redisService.get<SoundCloudSearchResult[]>(cacheKey);
    if (cached) {
      logger.info('SoundCloud search cache hit', { query });
      return cached;
    }

    try {
      // Search for tracks
      const searchResults = await this.client.search(query, 'track');

      // Limit results
      const limitedResults = searchResults.slice(0, maxResults);

      const results: SoundCloudSearchResult[] = limitedResults.map((track: any) => {
        // Extract user/artist name
        const artist = track.user?.username || track.artist || 'Unknown Artist';

        // Get thumbnail URL (use largest available)
        let thumbnailUrl = track.artwork_url || track.user?.avatar_url || '';
        if (thumbnailUrl) {
          // Replace 'large' with 't500x500' for higher quality
          thumbnailUrl = thumbnailUrl.replace('-large', '-t500x500');
        }

        return {
          id: track.id.toString(),
          title: track.title || 'Unknown Title',
          artist,
          duration: Math.floor((track.duration || 0) / 1000), // Convert ms to seconds
          thumbnailUrl,
          playCount: track.playback_count || track.plays_count || 0,
          sourceType: 'soundcloud' as const,
        };
      });

      // Cache results
      await this.redisService.set(cacheKey, results, config.cache.ttl.soundcloud);

      logger.info('SoundCloud search completed', { query, resultsCount: results.length });

      return results;
    } catch (error: any) {
      logger.error('SoundCloud search error', { error: error.message, query });
      throw new Error(`Failed to search SoundCloud: ${error.message}`);
    }
  }

  /**
   * Get stream URL for a SoundCloud track
   */
  async getStreamUrl(trackId: string): Promise<SoundCloudStreamInfo> {
    const cacheKey = `soundcloud:stream:${trackId}`;

    // Check cache first
    const cached = await this.redisService.get<SoundCloudStreamInfo>(cacheKey);
    if (cached) {
      logger.info('SoundCloud stream cache hit', { trackId });
      return cached;
    }

    try {
      // Get track info which includes stream URL
      const track = await this.client.getSongInfo(trackId);

      if (!track) {
        throw new Error('Track not found');
      }

      // Get downloadable stream URL
      const streamUrl = await track.downloadProgressive();

      if (!streamUrl) {
        throw new Error('No stream URL available');
      }

      const streamInfo: SoundCloudStreamInfo = {
        streamUrl,
        format: 'audio/mpeg',
        quality: 'progressive', // SoundCloud progressive download quality
      };

      // Cache for 5 hours (similar to YouTube)
      await this.redisService.set(cacheKey, streamInfo, 5 * 60 * 60);

      logger.info('SoundCloud stream URL extracted', { trackId });

      return streamInfo;
    } catch (error: any) {
      logger.error('SoundCloud stream extraction error', { error: error.message, trackId });
      throw new Error(`Failed to get stream URL: ${error.message}`);
    }
  }

  /**
   * Get track metadata
   */
  async getTrackMetadata(trackId: string): Promise<SoundCloudSearchResult | null> {
    const cacheKey = `soundcloud:metadata:${trackId}`;

    // Check cache first
    const cached = await this.redisService.get<SoundCloudSearchResult>(cacheKey);
    if (cached) {
      logger.info('SoundCloud metadata cache hit', { trackId });
      return cached;
    }

    try {
      const track = await this.client.getSongInfo(trackId);

      if (!track) {
        return null;
      }

      const artist = track.user?.username || track.artist || 'Unknown Artist';

      let thumbnailUrl = track.artwork_url || track.user?.avatar_url || '';
      if (thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace('-large', '-t500x500');
      }

      const metadata: SoundCloudSearchResult = {
        id: track.id.toString(),
        title: track.title || 'Unknown Title',
        artist,
        duration: Math.floor((track.duration || 0) / 1000),
        thumbnailUrl,
        playCount: track.playback_count || track.plays_count || 0,
        sourceType: 'soundcloud' as const,
      };

      // Cache metadata
      await this.redisService.set(cacheKey, metadata, config.cache.ttl.metadata);

      logger.info('SoundCloud metadata retrieved', { trackId });

      return metadata;
    } catch (error: any) {
      logger.error('SoundCloud metadata error', { error: error.message, trackId });
      throw new Error(`Failed to get track metadata: ${error.message}`);
    }
  }

  /**
   * Validate if a track ID exists and is available
   */
  async validateTrackId(trackId: string): Promise<boolean> {
    try {
      const metadata = await this.getTrackMetadata(trackId);
      return metadata !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get track by URL (convenience method)
   */
  async getTrackByUrl(url: string): Promise<SoundCloudSearchResult | null> {
    try {
      const track = await this.client.getSongInfo(url);

      if (!track) {
        return null;
      }

      const artist = track.user?.username || track.artist || 'Unknown Artist';

      let thumbnailUrl = track.artwork_url || track.user?.avatar_url || '';
      if (thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace('-large', '-t500x500');
      }

      return {
        id: track.id.toString(),
        title: track.title || 'Unknown Title',
        artist,
        duration: Math.floor((track.duration || 0) / 1000),
        thumbnailUrl,
        playCount: track.playback_count || track.plays_count || 0,
        sourceType: 'soundcloud' as const,
      };
    } catch (error: any) {
      logger.error('SoundCloud URL lookup error', { error: error.message, url });
      return null;
    }
  }
}

export const soundcloudService = new SoundCloudService();
