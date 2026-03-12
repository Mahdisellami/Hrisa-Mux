import { AudioSourceAdapter, TrackMetadata } from './types';

export abstract class BaseAudioSourceAdapter implements AudioSourceAdapter {
  abstract getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string>;
  abstract validate(sourceId: string): Promise<boolean>;
  abstract getSourceType(): 'youtube' | 'soundcloud' | 'local';

  protected getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
}
