import { api } from './client';

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  sourceType: 'youtube' | 'soundcloud' | 'local';
  sourceId: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
  trackCount: number;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImageUrl?: string;
}

export const playlistsApi = {
  async getUserPlaylists(): Promise<Playlist[]> {
    const response = await api.get('/playlists/me');
    return response.data.data.playlists;
  },

  async getPublicPlaylists(): Promise<Playlist[]> {
    const response = await api.get('/playlists/public');
    return response.data.data.playlists;
  },

  async getPlaylistById(id: string): Promise<PlaylistWithTracks> {
    const response = await api.get(`/playlists/${id}`);
    return response.data.data.playlist;
  },

  async createPlaylist(data: CreatePlaylistInput): Promise<Playlist> {
    const response = await api.post('/playlists', data);
    return response.data.data.playlist;
  },

  async updatePlaylist(id: string, data: UpdatePlaylistInput): Promise<Playlist> {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data.data.playlist;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
    await api.post(`/playlists/${playlistId}/tracks`, { trackId });
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  async reorderTracks(
    playlistId: string,
    trackOrders: { trackId: string; position: number }[]
  ): Promise<void> {
    await api.put(`/playlists/${playlistId}/reorder`, { trackOrders });
  },
};
