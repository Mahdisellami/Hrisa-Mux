import { BaseAudioSourceAdapter } from './AudioSourceAdapter';
import { TrackMetadata } from './types';

export class SoundCloudAdapter extends BaseAudioSourceAdapter {
  getSourceType(): 'soundcloud' {
    return 'soundcloud';
  }

  async getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string> {
    // Request stream URL from our backend API which uses soundcloud-scraper
    const apiUrl = this.getApiUrl();
    const response = await fetch(`${apiUrl}/api/soundcloud/stream/${sourceId}`);

    if (!response.ok) {
      throw new Error('Failed to get SoundCloud stream URL');
    }

    const data = await response.json();
    return data.data.streamUrl;
  }

  async validate(sourceId: string): Promise<boolean> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(`${apiUrl}/api/soundcloud/validate/${sourceId}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
