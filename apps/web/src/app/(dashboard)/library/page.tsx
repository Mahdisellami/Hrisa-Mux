'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload as UploadIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { tracksApi } from '@/lib/api/tracks';
import { uploadApi } from '@/lib/api/upload';
import { Button } from '@/components/ui/Button';
import { UploadZone } from '@/components/upload/UploadZone';
import { TrackCard } from '@/components/track/TrackCard';
import { TrackMetadata } from '@/lib/audio/types';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', 'library'],
    queryFn: () => tracksApi.getUserTracks(),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => uploadApi.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Track deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete track');
    },
  });

  const handlePlay = (track: any) => {
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

    // Play this track and set the library as the queue
    const queue = tracks?.map((t: any) => ({
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this track?')) {
      deleteMutation.mutate(id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dark-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-50 mb-2">Sign in to view your library</h1>
          <p className="text-dark-400 mb-6">Upload and manage your music collection</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => (window.location.href = '/login')}>Sign In</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/register')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-50 mb-2">My Library</h1>
            <p className="text-dark-400">
              {tracks?.length || 0} {tracks?.length === 1 ? 'track' : 'tracks'} uploaded
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2"
          >
            <UploadIcon className="w-5 h-5" />
            {showUpload ? 'Hide Upload' : 'Upload Music'}
          </Button>
        </div>

        {/* Upload Zone */}
        {showUpload && (
          <div className="mb-8">
            <UploadZone />
          </div>
        )}

        {/* Tracks List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-dark-400">Loading your library...</p>
          </div>
        ) : tracks && tracks.length > 0 ? (
          <div className="space-y-3">
            {tracks.map((track: any) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={() => handlePlay(track)}
                onDelete={() => handleDelete(track.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 mb-4">
              No tracks in your library yet
            </p>
            <Button onClick={() => setShowUpload(true)}>
              Upload Your First Track
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Music({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  );
}
