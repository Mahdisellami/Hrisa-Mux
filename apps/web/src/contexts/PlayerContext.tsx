'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { PlayerState, PlayerAction, TrackMetadata, RepeatMode } from '@/lib/audio/types';
import { playerReducer, initialPlayerState } from '@/lib/audio/playerReducer';
import { AdapterFactory } from '@/lib/audio/AdapterFactory';

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playTrack: (track: TrackMetadata, queue?: TrackMetadata[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  addToQueue: (track: TrackMetadata) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentStreamUrlRef = useRef<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Load saved volume from localStorage
    const savedVolume = localStorage.getItem('player_volume');
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      dispatch({ type: 'SET_VOLUME', payload: volume });
      audio.volume = volume;
    } else {
      audio.volume = state.volume;
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update audio element when track changes
  useEffect(() => {
    const loadTrack = async () => {
      if (!state.currentTrack || !audioRef.current) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Get the appropriate adapter
        const adapter = AdapterFactory.getAdapter(state.currentTrack.sourceType);

        // Get stream URL
        const streamUrl = await adapter.getStreamUrl(
          state.currentTrack.sourceId,
          state.currentTrack
        );

        currentStreamUrlRef.current = streamUrl;
        audioRef.current.src = streamUrl;

        // Set up Media Session API
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: state.currentTrack.title,
            artist: state.currentTrack.artist || 'Unknown Artist',
            album: state.currentTrack.album || '',
            artwork: state.currentTrack.thumbnailUrl
              ? [{ src: state.currentTrack.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
              : [],
          });
        }

        dispatch({ type: 'SET_LOADING', payload: false });

        // Auto-play if needed
        if (state.isPlaying) {
          audioRef.current.play().catch((error) => {
            console.error('Playback failed:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to play track' });
          });
        }
      } catch (error) {
        console.error('Failed to load track:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load track' });
      }
    };

    loadTrack();
  }, [state.currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (state.isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
        dispatch({ type: 'PAUSE' });
      });
    } else if (!state.isPlaying && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [state.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = state.isMuted ? 0 : state.volume;
    localStorage.setItem('player_volume', state.volume.toString());
  }, [state.volume, state.isMuted]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const buffered = audio.buffered.length > 0 ? audio.buffered.end(audio.buffered.length - 1) : 0;
      dispatch({
        type: 'UPDATE_TIME',
        payload: {
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
          buffered,
        },
      });
    };

    const handleEnded = () => {
      dispatch({ type: 'NEXT' });
    };

    const handleError = () => {
      dispatch({ type: 'SET_ERROR', payload: 'Playback error occurred' });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Media Session API handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => dispatch({ type: 'PLAY' }));
    navigator.mediaSession.setActionHandler('pause', () => dispatch({ type: 'PAUSE' }));
    navigator.mediaSession.setActionHandler('nexttrack', () => dispatch({ type: 'NEXT' }));
    navigator.mediaSession.setActionHandler('previoustrack', () => dispatch({ type: 'PREVIOUS' }));
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        dispatch({ type: 'SEEK', payload: details.seekTime });
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, []);

  // Handle seek
  useEffect(() => {
    if (audioRef.current && !isNaN(state.currentTime)) {
      audioRef.current.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  // Context methods
  const playTrack = useCallback((track: TrackMetadata, queue?: TrackMetadata[]) => {
    dispatch({ type: 'PLAY_TRACK', payload: { track, queue } });
  }, []);

  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const togglePlay = useCallback(() => dispatch({ type: 'TOGGLE_PLAY' }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const previous = useCallback(() => dispatch({ type: 'PREVIOUS' }), []);
  const seek = useCallback((time: number) => dispatch({ type: 'SEEK', payload: time }), []);
  const setVolume = useCallback((volume: number) => dispatch({ type: 'SET_VOLUME', payload: volume }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const setRepeatMode = useCallback((mode: RepeatMode) => dispatch({ type: 'SET_REPEAT_MODE', payload: mode }), []);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
  const addToQueue = useCallback((track: TrackMetadata) => dispatch({ type: 'ADD_TO_QUEUE', payload: track }), []);
  const removeFromQueue = useCallback((index: number) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index }), []);
  const clearQueue = useCallback(() => dispatch({ type: 'CLEAR_QUEUE' }), []);

  const value: PlayerContextType = {
    state,
    dispatch,
    playTrack,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
