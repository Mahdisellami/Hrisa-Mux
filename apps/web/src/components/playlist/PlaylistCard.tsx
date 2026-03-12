import Link from 'next/link';
import { Music } from 'lucide-react';
import { Playlist } from '@/lib/api/playlists';

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div className="group bg-dark-800 border border-dark-700 rounded-lg p-4 hover:bg-dark-750 hover:border-dark-600 transition-all cursor-pointer">
        <div className="aspect-square bg-gradient-to-br from-primary-600 to-primary-800 rounded-md mb-3 flex items-center justify-center">
          {playlist.coverImageUrl ? (
            <img
              src={playlist.coverImageUrl}
              alt={playlist.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Music className="w-12 h-12 text-primary-100" />
          )}
        </div>
        <h3 className="font-semibold text-dark-50 truncate group-hover:text-primary-400 transition-colors">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="text-sm text-dark-400 truncate mt-1">{playlist.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-dark-500">
          {playlist.isPublic && <span className="px-2 py-0.5 bg-primary-900 text-primary-300 rounded">Public</span>}
        </div>
      </div>
    </Link>
  );
}
