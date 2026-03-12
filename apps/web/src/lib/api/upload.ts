import { api } from './client';
import { Track } from './playlists';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadApi = {
  async uploadTrack(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Track> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });

    return response.data.data.track;
  },

  async deleteTrack(id: string): Promise<void> {
    await api.delete(`/upload/${id}`);
  },
};
