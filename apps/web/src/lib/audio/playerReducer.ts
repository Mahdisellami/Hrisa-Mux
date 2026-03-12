import { PlayerState, PlayerAction, TrackMetadata, RepeatMode } from './types';

export const initialPlayerState: PlayerState = {
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'off',
  isShuffled: false,
  duration: 0,
  currentTime: 0,
  buffered: 0,
  isLoading: false,
  error: null,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'PLAY_TRACK': {
      const { track, queue } = action.payload;
      const newQueue = queue || [track];
      const index = newQueue.findIndex((t) => t.id === track.id);

      return {
        ...state,
        currentTrack: track,
        queue: newQueue,
        currentIndex: index >= 0 ? index : 0,
        isPlaying: true,
        error: null,
      };
    }

    case 'PLAY':
      return { ...state, isPlaying: true };

    case 'PAUSE':
      return { ...state, isPlaying: false };

    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };

    case 'NEXT': {
      if (state.queue.length === 0) return state;

      let nextIndex: number;

      if (state.repeatMode === 'one') {
        // Repeat current track
        nextIndex = state.currentIndex;
      } else if (state.currentIndex >= state.queue.length - 1) {
        // At the end of queue
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // Stop playing
          return { ...state, isPlaying: false };
        }
      } else {
        nextIndex = state.currentIndex + 1;
      }

      return {
        ...state,
        currentTrack: state.queue[nextIndex],
        currentIndex: nextIndex,
        currentTime: 0,
      };
    }

    case 'PREVIOUS': {
      if (state.queue.length === 0) return state;

      // If more than 3 seconds into the track, restart it
      if (state.currentTime > 3) {
        return { ...state, currentTime: 0 };
      }

      let prevIndex: number;

      if (state.currentIndex <= 0) {
        if (state.repeatMode === 'all') {
          prevIndex = state.queue.length - 1;
        } else {
          prevIndex = 0;
        }
      } else {
        prevIndex = state.currentIndex - 1;
      }

      return {
        ...state,
        currentTrack: state.queue[prevIndex],
        currentIndex: prevIndex,
        currentTime: 0,
      };
    }

    case 'SEEK':
      return { ...state, currentTime: action.payload };

    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)), isMuted: false };

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    case 'SET_REPEAT_MODE':
      return { ...state, repeatMode: action.payload };

    case 'TOGGLE_SHUFFLE': {
      const newIsShuffled = !state.isShuffled;

      if (newIsShuffled) {
        // Shuffle the queue, but keep current track at current position
        const currentTrack = state.currentTrack;
        if (!currentTrack) return { ...state, isShuffled: newIsShuffled };

        const otherTracks = state.queue.filter((t) => t.id !== currentTrack.id);
        const shuffledOthers = shuffleArray(otherTracks);
        const newQueue = [currentTrack, ...shuffledOthers];

        return {
          ...state,
          queue: newQueue,
          currentIndex: 0,
          isShuffled: newIsShuffled,
        };
      } else {
        // Un-shuffle: This would require storing the original queue order
        // For simplicity, we'll just keep the current order
        return { ...state, isShuffled: newIsShuffled };
      }
    }

    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: action.payload.length > 0 ? 0 : -1,
        currentTrack: action.payload.length > 0 ? action.payload[0] : null,
      };

    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };

    case 'REMOVE_FROM_QUEUE': {
      const newQueue = state.queue.filter((_, index) => index !== action.payload);
      let newIndex = state.currentIndex;

      if (action.payload < state.currentIndex) {
        newIndex = state.currentIndex - 1;
      } else if (action.payload === state.currentIndex) {
        // If removing current track, move to next
        newIndex = Math.min(state.currentIndex, newQueue.length - 1);
      }

      return {
        ...state,
        queue: newQueue,
        currentIndex: newIndex,
        currentTrack: newQueue[newIndex] || null,
      };
    }

    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration,
        buffered: action.payload.buffered,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
        currentTrack: null,
        currentIndex: -1,
        isPlaying: false,
      };

    default:
      return state;
  }
}
