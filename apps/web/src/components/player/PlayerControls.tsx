'use client';

import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

export function PlayerControls() {
  const { state, togglePlay, previous, next, toggleShuffle, setRepeatMode } = usePlayer();

  const handleRepeatClick = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const getRepeatIcon = () => {
    if (state.repeatMode === 'one') {
      return <Repeat1 className="w-5 h-5" />;
    }
    return <Repeat className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`p-2 rounded-full transition-colors ${
          state.isShuffled
            ? 'text-primary-500 hover:text-primary-400'
            : 'text-dark-400 hover:text-dark-200'
        }`}
        title="Shuffle"
      >
        <Shuffle className="w-5 h-5" />
      </button>

      {/* Previous */}
      <button
        onClick={previous}
        disabled={state.queue.length === 0}
        className="p-2 text-dark-200 hover:text-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Previous"
      >
        <SkipBack className="w-6 h-6" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={!state.currentTrack}
        className="p-3 bg-primary-600 hover:bg-primary-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        title={state.isPlaying ? 'Pause' : 'Play'}
      >
        {state.isPlaying ? (
          <Pause className="w-6 h-6 text-white" fill="white" />
        ) : (
          <Play className="w-6 h-6 text-white" fill="white" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={next}
        disabled={state.queue.length === 0}
        className="p-2 text-dark-200 hover:text-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Next"
      >
        <SkipForward className="w-6 h-6" />
      </button>

      {/* Repeat */}
      <button
        onClick={handleRepeatClick}
        className={`p-2 rounded-full transition-colors ${
          state.repeatMode !== 'off'
            ? 'text-primary-500 hover:text-primary-400'
            : 'text-dark-400 hover:text-dark-200'
        }`}
        title={`Repeat: ${state.repeatMode}`}
      >
        {getRepeatIcon()}
      </button>
    </div>
  );
}
