'use client';

import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useRef, useState } from 'react';

export function VolumeControl() {
  const { state, setVolume, toggleMute } = usePlayer();
  const [showSlider, setShowSlider] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));

    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (state.isMuted || state.volume === 0) {
      return <VolumeX className="w-5 h-5" />;
    } else if (state.volume < 0.5) {
      return <Volume1 className="w-5 h-5" />;
    } else {
      return <Volume2 className="w-5 h-5" />;
    }
  };

  const displayVolume = state.isMuted ? 0 : state.volume;

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={toggleMute}
        className="p-2 text-dark-300 hover:text-dark-50 transition-colors"
        title={state.isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      <div
        className={`transition-all duration-200 ease-out ${
          showSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'
        } overflow-hidden`}
      >
        <div
          ref={volumeRef}
          className="relative h-1 bg-dark-700 rounded-full cursor-pointer"
          onClick={handleVolumeChange}
        >
          <div
            className="absolute h-full bg-primary-600 rounded-full"
            style={{ width: `${displayVolume * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full"
            style={{ left: `calc(${displayVolume * 100}% - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
}
