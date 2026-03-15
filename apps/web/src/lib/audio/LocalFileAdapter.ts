import { BaseAudioSourceAdapter } from './AudioSourceAdapter';
import { TrackMetadata } from './types';

export class LocalFileAdapter extends BaseAudioSourceAdapter {
  getSourceType(): 'local' {
    return 'local';
  }

  async getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string> {
    // For downloaded YouTube/SoundCloud tracks, we need to stream from /api/tracks/:id/stream
    // The metadata.id is the database track ID, not the sourceId (which is the filename)
    const apiUrl = this.getApiUrl();

    // Use the track ID from metadata to stream the file
    if (metadata.id) {
      return `${apiUrl}/api/tracks/${metadata.id}/stream`;
    }

    // Fallback for legacy uploaded files
    return `${apiUrl}/api/upload/stream/${sourceId}`;
  }

  async validate(sourceId: string): Promise<boolean> {
    // For now, assume local files are always valid if they exist in the database
    return true;
  }
}
