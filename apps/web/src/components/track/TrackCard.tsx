import { Play, Music, MoreVertical, Trash2 } from 'lucide-react';
import { Track } from '@/lib/api/playlists';
import { useState } from 'react';

interface TrackCardProps {
  track: Track;
  onPlay: () => void;
  onDelete?: () => void;
}

export function TrackCard({ track, onPlay, onDelete }: TrackCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group bg-dark-800 border border-dark-700 rounded-lg p-4 hover:bg-dark-750 transition-all">
      <div className="flex items-center gap-4">
        {/* Thumbnail or Icon */}
        <div className="relative flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded flex items-center justify-center">
          {track.thumbnailUrl ? (
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <Music className="w-8 h-8 text-primary-100" />
          )}

          {/* Play Button Overlay */}
          <button
            onClick={onPlay}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
          >
            <Play className="w-8 h-8 text-white" fill="white" />
          </button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-dark-50 truncate">{track.title}</h4>
          <p className="text-sm text-dark-400 truncate">{track.artist || 'Unknown Artist'}</p>
          {track.album && (
            <p className="text-xs text-dark-500 truncate">{track.album}</p>
          )}
        </div>

        {/* Duration and Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-dark-400 tabular-nums">
            {formatDuration(track.duration)}
          </span>

          {onDelete && track.sourceType === 'local' && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 min-w-[150px]">
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
