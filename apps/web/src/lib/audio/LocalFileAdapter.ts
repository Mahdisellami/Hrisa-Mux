import { BaseAudioSourceAdapter } from './AudioSourceAdapter';
import { TrackMetadata } from './types';

export class LocalFileAdapter extends BaseAudioSourceAdapter {
  getSourceType(): 'local' {
    return 'local';
  }

  async getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string> {
    // For local files, the sourceUrl should contain the file path or signed URL
    if (metadata.sourceUrl) {
      return metadata.sourceUrl;
    }

    // Otherwise, request a stream URL from the API
    const apiUrl = this.getApiUrl();
    return `${apiUrl}/api/upload/stream/${sourceId}`;
  }

  async validate(sourceId: string): Promise<boolean> {
    // For now, assume local files are always valid if they exist in the database
    return true;
  }
}
