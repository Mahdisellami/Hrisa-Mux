'use client';

import { usePlayer } from '@/contexts/PlayerContext';
import { useRef, useState } from 'react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar() {
  const { state, seek } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || state.duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * state.duration;

    seek(Math.max(0, Math.min(state.duration, time)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || state.duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * state.duration;

    setHoverTime(Math.max(0, Math.min(state.duration, time)));
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedProgress = state.duration > 0 ? (state.buffered / state.duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-dark-400 tabular-nums min-w-[40px]">
        {formatTime(state.currentTime)}
      </span>

      <div
        ref={progressRef}
        className="relative flex-1 h-2 bg-dark-700 rounded-full cursor-pointer group"
        onClick={handleSeek}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Buffered progress */}
        <div
          className="absolute h-full bg-dark-600 rounded-full"
          style={{ width: `${bufferedProgress}%` }}
        />

        {/* Current progress */}
        <div
          className="absolute h-full bg-primary-600 rounded-full"
          style={{ width: `${progress}%` }}
        />

        {/* Progress handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />

        {/* Hover time tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 transform -translate-x-1/2 bg-dark-800 text-dark-50 text-xs px-2 py-1 rounded pointer-events-none"
            style={{ left: `${(hoverTime / state.duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      <span className="text-xs text-dark-400 tabular-nums min-w-[40px]">
        {formatTime(state.duration)}
      </span>
    </div>
  );
}
