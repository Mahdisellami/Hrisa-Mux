import { BaseAudioSourceAdapter } from './AudioSourceAdapter';
import { TrackMetadata } from './types';

export class YouTubeAdapter extends BaseAudioSourceAdapter {
  getSourceType(): 'youtube' {
    return 'youtube';
  }

  async getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string> {
    // Request stream URL from our backend API which uses ytdl-core
    const apiUrl = this.getApiUrl();
    const response = await fetch(`${apiUrl}/api/youtube/stream/${sourceId}`);

    if (!response.ok) {
      throw new Error('Failed to get YouTube stream URL');
    }

    const data = await response.json();
    return data.data.streamUrl;
  }

  async validate(sourceId: string): Promise<boolean> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(`${apiUrl}/api/youtube/validate/${sourceId}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
