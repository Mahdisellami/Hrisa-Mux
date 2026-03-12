'use client';

import { X, GripVertical } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

interface QueueProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Queue({ isOpen, onClose }: QueueProps) {
  const { state, playTrack, removeFromQueue } = usePlayer();

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 w-96 max-h-[600px] bg-dark-900 border border-dark-700 rounded-lg shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <h3 className="text-lg font-semibold text-dark-50">Queue</h3>
        <button
          onClick={onClose}
          className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[520px]">
        {state.queue.length === 0 ? (
          <div className="p-8 text-center text-dark-400">
            <p>Queue is empty</p>
          </div>
        ) : (
          <div>
            {state.queue.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className={`flex items-center gap-3 p-3 hover:bg-dark-800 transition-colors group ${
                  index === state.currentIndex ? 'bg-dark-800' : ''
                }`}
              >
                <div className="text-dark-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => playTrack(track, state.queue)}
                >
                  {track.thumbnailUrl && (
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => playTrack(track, state.queue)}
                >
                  <p
                    className={`text-sm truncate ${
                      index === state.currentIndex ? 'text-primary-500' : 'text-dark-50'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-dark-400 truncate">{track.artist || 'Unknown Artist'}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-dark-400 hover:text-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
