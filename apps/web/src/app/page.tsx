'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/home';
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Hrisa-Mux
        </h1>
        <p className="text-xl text-dark-400">
          Stream music from YouTube, SoundCloud, and your local library
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/login"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-dark-700 hover:border-dark-600 rounded-lg font-semibold transition-colors"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
