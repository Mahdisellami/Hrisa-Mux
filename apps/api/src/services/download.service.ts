import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface DownloadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
}

export class DownloadService {
  private uploadsDir: string;

  constructor() {
    // Use uploads directory in project root
    this.uploadsDir = path.join('/app', 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Download YouTube video as MP3
   */
  async downloadYouTube(videoId: string): Promise<DownloadResult> {
    const fileName = `youtube_${videoId}.mp3`;
    const filePath = path.join(this.uploadsDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      logger.info('YouTube file already exists', { videoId, filePath });
      const stats = fs.statSync(filePath);
      return {
        filePath,
        fileName,
        fileSize: stats.size,
      };
    }

    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;

      // Use yt-dlp to download audio
      const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${filePath}" "${url}"`;

      logger.info('Downloading YouTube audio', { videoId, command });

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000, // 2 minute timeout
      });

      if (stderr && !stderr.includes('Deleting original file')) {
        logger.warn('yt-dlp stderr', { stderr });
      }

      if (!fs.existsSync(filePath)) {
        throw new Error('Download completed but file not found');
      }

      const stats = fs.statSync(filePath);

      logger.info('YouTube download completed', {
        videoId,
        filePath,
        fileSize: stats.size
      });

      return {
        filePath,
        fileName,
        fileSize: stats.size,
      };
    } catch (error: any) {
      logger.error('YouTube download error', {
        error: error.message,
        videoId
      });

      // Clean up partial file if exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw new Error(`Failed to download YouTube audio: ${error.message}`);
    }
  }

  /**
   * Download SoundCloud track as MP3
   */
  async downloadSoundCloud(trackUrl: string): Promise<DownloadResult> {
    // Extract track ID from URL or use URL hash
    const trackId = trackUrl.split('/').pop()?.replace(/[^a-zA-Z0-9-]/g, '') ||
                   Buffer.from(trackUrl).toString('base64').substring(0, 20);

    const fileName = `soundcloud_${trackId}.mp3`;
    const filePath = path.join(this.uploadsDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      logger.info('SoundCloud file already exists', { trackUrl, filePath });
      const stats = fs.statSync(filePath);
      return {
        filePath,
        fileName,
        fileSize: stats.size,
      };
    }

    try {
      // Use yt-dlp to download audio from SoundCloud
      const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${filePath}" "${trackUrl}"`;

      logger.info('Downloading SoundCloud audio', { trackUrl, command });

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000, // 2 minute timeout
      });

      if (stderr && !stderr.includes('Deleting original file')) {
        logger.warn('yt-dlp stderr', { stderr });
      }

      if (!fs.existsSync(filePath)) {
        throw new Error('Download completed but file not found');
      }

      const stats = fs.statSync(filePath);

      logger.info('SoundCloud download completed', {
        trackUrl,
        filePath,
        fileSize: stats.size
      });

      return {
        filePath,
        fileName,
        fileSize: stats.size,
      };
    } catch (error: any) {
      logger.error('SoundCloud download error', {
        error: error.message,
        trackUrl
      });

      // Clean up partial file if exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw new Error(`Failed to download SoundCloud audio: ${error.message}`);
    }
  }

  /**
   * Delete a downloaded file
   */
  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted', { filePath });
    }
  }
}

export const downloadService = new DownloadService();
