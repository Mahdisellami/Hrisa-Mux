'use client';

import { useState } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/api/youtube';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { youtubeApi } from '@/lib/api/youtube';
import toast from 'react-hot-toast';
import { TrackMetadata } from '@/lib/audio/types';

interface YouTubeSearchResultsProps {
  results: YouTubeSearchResult[];
  isLoading: boolean;
}

export function YouTubeSearchResults({ results, isLoading }: YouTubeSearchResultsProps) {
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();
  const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set());

  const addToLibraryMutation = useMutation({
    mutationFn: (videoId: string) => youtubeApi.addToLibrary(videoId),
    onSuccess: (data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setAddedTracks((prev) => new Set(prev).add(videoId));
      toast.success('Added to library!');
    },
    onError: (error: any, videoId) => {
      if (error.response?.status === 409) {
        setAddedTracks((prev) => new Set(prev).add(videoId));
        toast.error('Already in library');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add to library');
      }
    },
  });

  const playFromSearchMutation = useMutation({
    mutationFn: (videoId: string) => youtubeApi.addToLibrary(videoId),
    onSuccess: (track) => {
      // Mark as added
      setAddedTracks((prev) => new Set(prev).add(track.sourceUrl?.split('v=')[1] || ''));

      // Convert the track to TrackMetadata and play it
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

      playTrack(trackMetadata);
      toast.success('Playing from library');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        // Track already exists, get it from library and play
        const existingTrack = error.response?.data?.data;
        if (existingTrack) {
          const trackMetadata: TrackMetadata = {
            id: existingTrack.id,
            title: existingTrack.title,
            artist: existingTrack.artist,
            album: existingTrack.album,
            duration: existingTrack.duration,
            thumbnailUrl: existingTrack.thumbnailUrl,
            sourceType: existingTrack.sourceType,
            sourceId: existingTrack.sourceId,
            sourceUrl: existingTrack.sourceUrl,
          };
          playTrack(trackMetadata);
          toast.success('Playing from library');
        } else {
          toast.error('Track already in library');
        }
      } else {
        toast.error(error.response?.data?.error || 'Failed to play track');
      }
    },
  });

  const handlePlay = (result: YouTubeSearchResult) => {
    // Download to library first, then play
    toast.loading('Downloading track...', { id: 'download-' + result.id });
    playFromSearchMutation.mutate(result.id, {
      onSettled: () => {
        toast.dismiss('download-' + result.id);
      },
    });
  };

  const handleAddToLibrary = (videoId: string) => {
    addToLibraryMutation.mutate(videoId);
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

  const formatViewCount = (count?: number): string => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
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
                  src={result.thumbnailUrl}
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
                {result.viewCount && (
                  <p className="text-xs text-dark-500">{formatViewCount(result.viewCount)}</p>
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
