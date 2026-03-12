'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { PlaylistList } from '@/components/playlist/PlaylistList';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';

export default function PlaylistsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-dark-50 mb-2">Sign in to view playlists</h1>
          <p className="text-dark-400 mb-6">Create an account or sign in to manage your playlists</p>
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
            <h1 className="text-4xl font-bold text-dark-50 mb-2">My Playlists</h1>
            <p className="text-dark-400">Create and manage your music collections</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </Button>
        </div>

        <PlaylistList />

        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
