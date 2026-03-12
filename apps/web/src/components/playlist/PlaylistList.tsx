'use client';

import { useQuery } from '@tanstack/react-query';
import { playlistsApi } from '@/lib/api/playlists';
import { PlaylistCard } from './PlaylistCard';
import { Loader2 } from 'lucide-react';

export function PlaylistList() {
  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['playlists', 'me'],
    queryFn: () => playlistsApi.getUserPlaylists(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load playlists</p>
      </div>
    );
  }

  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">No playlists yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
