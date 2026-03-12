'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsApi, CreatePlaylistInput } from '@/lib/api/playlists';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreatePlaylistInput>({
    name: '',
    description: '',
    isPublic: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlaylistInput) => playlistsApi.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created successfully!');
      onClose();
      setFormData({ name: '', description: '', isPublic: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-50">Create Playlist</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Playlist Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Awesome Playlist"
            required
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A collection of my favorite songs..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-50 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="isPublic" className="text-sm text-dark-200">
              Make this playlist public
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={createMutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
