'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Play, Music, ArrowLeft, Share2, Lock, Globe } from 'lucide-react';
import { playlistsApi } from '@/lib/api/playlists';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackCard } from '@/components/track/TrackCard';
import { Button } from '@/components/ui/Button';
import { TrackMetadata } from '@/lib/audio/types';
import toast from 'react-hot-toast';

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.id as string;
  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();

  const { data: playlist, isLoading, error } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => playlistsApi.getPlaylist(playlistId),
  });

  const removeTrackMutation = useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      playlistsApi.removeTrack(playlistId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success('Track removed from playlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove track');
    },
  });

  const handlePlayAll = () => {
    if (!playlist?.tracks || playlist.tracks.length === 0) return;

    const queue: TrackMetadata[] = playlist.tracks.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      thumbnailUrl: track.thumbnailUrl,
      sourceType: track.sourceType,
      sourceId: track.sourceId,
      sourceUrl: track.sourceUrl,
    }));

    playTrack(queue[0], queue);
  };

  const handlePlayTrack = (track: any) => {
    const trackMetadata: TrackMetadata = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      thumbnailUrl: track.thumbnailUrl,
      sourceType: track.sourceType,
      sourceId: track.sourceId,
      sourceUrl: track.sourceUrl,
    };

    const queue = playlist?.tracks?.map((t: any) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      thumbnailUrl: t.thumbnailUrl,
      sourceType: t.sourceType,
      sourceId: t.sourceId,
      sourceUrl: t.sourceUrl,
    })) || [];

    playTrack(trackMetadata, queue);
  };

  const handleRemoveTrack = (trackId: string) => {
    if (confirm('Remove this track from the playlist?')) {
      removeTrackMutation.mutate({ playlistId, trackId });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/playlists/${playlistId}`;
    navigator.clipboard.writeText(url);
    toast.success('Playlist link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
        <div className="max-w-5xl mx-auto text-center py-20">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
        <div className="max-w-5xl mx-auto text-center py-20">
          <Music className="w-20 h-20 mx-auto mb-6 text-dark-600" />
          <h2 className="text-2xl font-bold text-dark-50 mb-2">Playlist Not Found</h2>
          <p className="text-dark-400 mb-8">
            This playlist doesn't exist or is private.
          </p>
          <Button onClick={() => (window.location.href = '/playlists')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated; // Simplification - in production, check if user.id === playlist.userId

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => (window.location.href = '/playlists')}
          className="flex items-center gap-2 text-dark-400 hover:text-dark-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Playlists
        </button>

        {/* Playlist Info */}
        <div className="flex gap-8 mb-12">
          {/* Cover */}
          <div className="flex-shrink-0 w-56 h-56 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg shadow-2xl flex items-center justify-center">
            {playlist.coverImageUrl ? (
              <img
                src={playlist.coverImageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Music className="w-24 h-24 text-primary-100" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              {playlist.isPublic ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-primary-900 text-primary-300 rounded-full text-sm">
                  <Globe className="w-4 h-4" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-dark-800 text-dark-400 rounded-full text-sm">
                  <Lock className="w-4 h-4" />
                  Private
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold text-dark-50 mb-4">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-lg text-dark-400 mb-6">{playlist.description}</p>
            )}
            <div className="text-sm text-dark-500">
              {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? 'track' : 'tracks'}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handlePlayAll}
                disabled={!playlist.tracks || playlist.tracks.length === 0}
                variant="primary"
              >
                <Play className="w-5 h-5 mr-2" fill="white" />
                Play All
              </Button>
              {playlist.isPublic && (
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        {playlist.tracks && playlist.tracks.length > 0 ? (
          <div className="space-y-3">
            {playlist.tracks.map((track: any) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={() => handlePlayTrack(track)}
                onDelete={isOwner ? () => handleRemoveTrack(track.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-800 border border-dark-700 rounded-lg">
            <Music className="w-16 h-16 mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 mb-2">No tracks in this playlist yet</p>
            {isOwner && (
              <p className="text-sm text-dark-500">
                Search for music and add tracks to this playlist
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
