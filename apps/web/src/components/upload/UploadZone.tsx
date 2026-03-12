'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi, UploadProgress } from '@/lib/api/upload';
import { Track } from '@/lib/api/playlists';
import toast from 'react-hot-toast';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  track?: Track;
  error?: string;
}

export function UploadZone() {
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      index,
    }: {
      file: File;
      index: number;
    }) =>
      uploadApi.uploadTrack(file, (progress: UploadProgress) => {
        setUploadFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, progress: progress.percentage, status: 'uploading' as const } : f
          )
        );
      }),
    onSuccess: (track, { index }) => {
      setUploadFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'success' as const, track } : f))
      );
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success(`${track.title} uploaded successfully!`);
    },
    onError: (error: any, { file, index }) => {
      const message = error.response?.data?.message || 'Upload failed';
      setUploadFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'error' as const, error: message } : f))
      );
      toast.error(`Failed to upload ${file.name}: ${message}`);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);

    // Start uploading each file
    acceptedFiles.forEach((file, index) => {
      const actualIndex = uploadFiles.length + index;
      uploadMutation.mutate({ file, index: actualIndex });
    });
  }, [uploadFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/mp4': ['.m4a'],
      'audio/flac': ['.flac'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploadFiles((prev) => prev.filter((f) => f.status !== 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-900/20'
            : 'border-dark-700 hover:border-dark-600 hover:bg-dark-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-16 h-16 mx-auto mb-4 ${
            isDragActive ? 'text-primary-500' : 'text-dark-500'
          }`}
        />
        {isDragActive ? (
          <p className="text-lg text-primary-400">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg text-dark-200 mb-2">
              Drag & drop audio files here, or click to select
            </p>
            <p className="text-sm text-dark-500">
              Supports MP3, M4A, FLAC, WAV, OGG (max 100MB per file)
            </p>
          </div>
        )}
      </div>

      {/* Upload List */}
      {uploadFiles.length > 0 && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50">
              Uploads ({uploadFiles.length})
            </h3>
            {uploadFiles.some((f) => f.status === 'success') && (
              <button
                onClick={clearCompleted}
                className="text-sm text-dark-400 hover:text-dark-200 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {uploadFile.status === 'pending' && (
                    <File className="w-10 h-10 text-dark-400" />
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-50 truncate">
                    {uploadFile.track?.title || uploadFile.file.name}
                  </p>
                  <p className="text-xs text-dark-400">
                    {(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-dark-700 rounded-full h-1.5">
                        <div
                          className="bg-primary-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-dark-400 mt-1">{uploadFile.progress}%</p>
                    </div>
                  )}

                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                  )}

                  {uploadFile.status === 'success' && uploadFile.track && (
                    <p className="text-xs text-green-500 mt-1">
                      {uploadFile.track.artist || 'Unknown Artist'}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
