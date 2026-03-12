'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, Search, Upload, Clock, ListMusic } from 'lucide-react';
import { playlistsApi } from '@/lib/api/playlists';
import { tracksApi } from '@/lib/api/tracks';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { TrackCard } from '@/components/track/TrackCard';
import { Button } from '@/components/ui/Button';
import { TrackMetadata } from '@/lib/audio/types';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { playTrack } = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState<TrackMetadata[]>([]);

  // Load recently played from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recently_played');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentlyPlayed(parsed.slice(0, 10)); // Last 10 tracks
        } catch (error) {
          console.error('Failed to parse recently played:', error);
        }
      }
    }
  }, []);

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistsApi.getUserPlaylists(),
    enabled: isAuthenticated,
  });

  const { data: tracks } = useQuery({
    queryKey: ['tracks', 'library'],
    queryFn: () => tracksApi.getUserTracks(),
    enabled: isAuthenticated,
  });

  const handlePlayRecent = (track: TrackMetadata) => {
    playTrack(track, recentlyPlayed);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Music className="w-24 h-24 mx-auto mb-6 text-primary-600" />
            <h1 className="text-5xl font-bold text-dark-50 mb-4">
              Welcome to Hrisa-Mux
            </h1>
            <p className="text-xl text-dark-400 mb-8">
              Stream music from YouTube, SoundCloud, and your local library
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => (window.location.href = '/login')}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/register')}>
                Sign Up
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <Search className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">Multi-Source Search</h3>
                <p className="text-sm text-dark-400">
                  Search and stream music from YouTube and SoundCloud
                </p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">Upload Local Files</h3>
                <p className="text-sm text-dark-400">
                  Upload and manage your own music collection
                </p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <ListMusic className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">Create Playlists</h3>
                <p className="text-sm text-dark-400">
                  Organize your favorite tracks into custom playlists
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark-50 mb-2">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-dark-400">Ready to discover some music?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => (window.location.href = '/search')}
            className="bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg p-6 flex items-center gap-4 transition-all shadow-lg"
          >
            <Search className="w-8 h-8" />
            <div className="text-left">
              <div className="font-semibold text-lg">Search Music</div>
              <div className="text-sm opacity-90">YouTube & SoundCloud</div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = '/library')}
            className="bg-gradient-to-br from-dark-800 to-dark-850 hover:from-dark-750 hover:to-dark-800 border border-dark-700 text-white rounded-lg p-6 flex items-center gap-4 transition-all"
          >
            <Upload className="w-8 h-8" />
            <div className="text-left">
              <div className="font-semibold text-lg">My Library</div>
              <div className="text-sm text-dark-400">
                {tracks?.length || 0} tracks
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = '/playlists')}
            className="bg-gradient-to-br from-dark-800 to-dark-850 hover:from-dark-750 hover:to-dark-800 border border-dark-700 text-white rounded-lg p-6 flex items-center gap-4 transition-all"
          >
            <ListMusic className="w-8 h-8" />
            <div className="text-left">
              <div className="font-semibold text-lg">Playlists</div>
              <div className="text-sm text-dark-400">
                {playlists?.length || 0} playlists
              </div>
            </div>
          </button>
        </div>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-dark-400" />
              <h2 className="text-2xl font-bold text-dark-50">Recently Played</h2>
            </div>
            <div className="space-y-3">
              {recentlyPlayed.slice(0, 5).map((track, index) => (
                <TrackCard
                  key={`${track.id}-${index}`}
                  track={track}
                  onPlay={() => handlePlayRecent(track)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Your Playlists */}
        {playlists && playlists.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-dark-50 mb-6">Your Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlists.slice(0, 8).map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
            {playlists.length > 8 && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/playlists')}
                >
                  View All Playlists
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {(!playlists || playlists.length === 0) && recentlyPlayed.length === 0 && (
          <div className="text-center py-20">
            <Music className="w-20 h-20 mx-auto mb-6 text-dark-600" />
            <h3 className="text-2xl font-bold text-dark-50 mb-2">Start Exploring</h3>
            <p className="text-dark-400 mb-8">
              Search for music or upload your own tracks to get started
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => (window.location.href = '/search')}>
                <Search className="w-5 h-5 mr-2" />
                Search Music
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/library')}>
                <Upload className="w-5 h-5 mr-2" />
                Upload Tracks
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
