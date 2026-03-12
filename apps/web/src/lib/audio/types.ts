export interface TrackMetadata {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  thumbnailUrl?: string;
  sourceType: 'youtube' | 'soundcloud' | 'local';
  sourceId: string;
  sourceUrl?: string;
}

export interface AudioSourceAdapter {
  /**
   * Get the playable stream URL for a track
   */
  getStreamUrl(sourceId: string, metadata: TrackMetadata): Promise<string>;

  /**
   * Validate if the source ID is valid and playable
   */
  validate(sourceId: string): Promise<boolean>;

  /**
   * Get the source type identifier
   */
  getSourceType(): 'youtube' | 'soundcloud' | 'local';
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentTrack: TrackMetadata | null;
  queue: TrackMetadata[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  duration: number;
  currentTime: number;
  buffered: number;
  isLoading: boolean;
  error: string | null;
}

export type PlayerAction =
  | { type: 'PLAY_TRACK'; payload: { track: TrackMetadata; queue?: TrackMetadata[] } }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_REPEAT_MODE'; payload: RepeatMode }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_QUEUE'; payload: TrackMetadata[] }
  | { type: 'ADD_TO_QUEUE'; payload: TrackMetadata }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number }
  | { type: 'UPDATE_TIME'; payload: { currentTime: number; duration: number; buffered: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_QUEUE' };
