'use client';

import { useState } from 'react';
import { List } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { Queue } from './Queue';

export function AudioPlayer() {
  const { state } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!state.currentTrack) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-700 z-40">
        <div className="px-4 py-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <ProgressBar />
          </div>

          {/* Main Player Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {state.currentTrack.thumbnailUrl && (
                <img
                  src={state.currentTrack.thumbnailUrl}
                  alt={state.currentTrack.title}
                  className="w-14 h-14 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-dark-50 truncate">
                  {state.currentTrack.title}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {state.currentTrack.artist || 'Unknown Artist'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center flex-1">
              <PlayerControls />
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <VolumeControl />

              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded transition-colors ${
                  showQueue
                    ? 'text-primary-500 bg-primary-900/30'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
                title="Queue"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mt-2 text-xs text-red-500 text-center">{state.error}</div>
          )}

          {/* Loading Indicator */}
          {state.isLoading && (
            <div className="mt-2 text-xs text-primary-500 text-center">Loading...</div>
          )}
        </div>
      </div>

      {/* Queue Sidebar */}
      <Queue isOpen={showQueue} onClose={() => setShowQueue(false)} />
    </>
  );
}
