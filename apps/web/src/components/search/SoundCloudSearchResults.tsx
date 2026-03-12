'use client';

import { useState } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { SoundCloudSearchResult } from '@/lib/api/soundcloud';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { soundcloudApi } from '@/lib/api/soundcloud';
import toast from 'react-hot-toast';
import { TrackMetadata } from '@/lib/audio/types';

interface SoundCloudSearchResultsProps {
  results: SoundCloudSearchResult[];
  isLoading: boolean;
}

export function SoundCloudSearchResults({ results, isLoading }: SoundCloudSearchResultsProps) {
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();
  const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set());

  const addToLibraryMutation = useMutation({
    mutationFn: (trackId: string) => soundcloudApi.addToLibrary(trackId),
    onSuccess: (data, trackId) => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setAddedTracks((prev) => new Set(prev).add(trackId));
      toast.success('Added to library!');
    },
    onError: (error: any, trackId) => {
      if (error.response?.status === 409) {
        setAddedTracks((prev) => new Set(prev).add(trackId));
        toast.error('Already in library');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add to library');
      }
    },
  });

  const handlePlay = (result: SoundCloudSearchResult) => {
    const trackMetadata: TrackMetadata = {
      id: result.id,
      title: result.title,
      artist: result.artist,
      album: undefined,
      duration: result.duration,
      thumbnailUrl: result.thumbnailUrl,
      sourceType: 'soundcloud',
      sourceId: result.id,
      sourceUrl: `https://soundcloud.com/${result.id}`,
    };

    // Play this track with the search results as queue
    const queue = results.map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      duration: r.duration,
      thumbnailUrl: r.thumbnailUrl,
      sourceType: 'soundcloud' as const,
      sourceId: r.id,
      sourceUrl: `https://soundcloud.com/${r.id}`,
    }));

    playTrack(trackMetadata, queue);
  };

  const handleAddToLibrary = (trackId: string) => {
    addToLibraryMutation.mutate(trackId);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayCount = (count?: number): string => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M plays`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K plays`;
    }
    return `${count} plays`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-lg p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-24 bg-dark-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-dark-700 rounded w-3/4" />
                <div className="h-4 bg-dark-700 rounded w-1/2" />
                <div className="h-4 bg-dark-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const isAdded = addedTracks.has(result.id);
        const isAddingToLibrary = addToLibraryMutation.isPending;

        return (
          <div
            key={result.id}
            className="group bg-dark-800 border border-dark-700 rounded-lg p-4 hover:bg-dark-750 transition-colors"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={result.thumbnailUrl || '/default-album.png'}
                  alt={result.title}
                  className="w-40 h-24 object-cover rounded"
                />
                <button
                  onClick={() => handlePlay(result)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                >
                  <Play className="w-12 h-12 text-white" fill="white" />
                </button>
                <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white">
                  {formatDuration(result.duration)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-dark-50 line-clamp-2 mb-1">
                  {result.title}
                </h3>
                <p className="text-sm text-dark-400 mb-2">{result.artist}</p>
                {result.playCount && (
                  <p className="text-xs text-dark-500">{formatPlayCount(result.playCount)}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 items-end justify-center">
                <button
                  onClick={() => handlePlay(result)}
                  className="p-2 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
                  title="Play"
                >
                  <Play className="w-5 h-5 text-white" fill="white" />
                </button>
                <button
                  onClick={() => handleAddToLibrary(result.id)}
                  disabled={isAdded || isAddingToLibrary}
                  className={`p-2 rounded-full transition-colors ${
                    isAdded
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                  title={isAdded ? 'In library' : 'Add to library'}
                >
                  {isAdded ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-dark-200" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
