import { AudioSourceAdapter } from './types';
import { LocalFileAdapter } from './LocalFileAdapter';
import { YouTubeAdapter } from './YouTubeAdapter';
import { SoundCloudAdapter } from './SoundCloudAdapter';

export class AdapterFactory {
  private static instances: Map<string, AudioSourceAdapter> = new Map();

  static getAdapter(sourceType: 'youtube' | 'soundcloud' | 'local'): AudioSourceAdapter {
    // Use singleton pattern for adapters
    if (!this.instances.has(sourceType)) {
      switch (sourceType) {
        case 'youtube':
          this.instances.set(sourceType, new YouTubeAdapter());
          break;
        case 'soundcloud':
          this.instances.set(sourceType, new SoundCloudAdapter());
          break;
        case 'local':
          this.instances.set(sourceType, new LocalFileAdapter());
          break;
        default:
          throw new Error(`Unknown source type: ${sourceType}`);
      }
    }

    return this.instances.get(sourceType)!;
  }
}
