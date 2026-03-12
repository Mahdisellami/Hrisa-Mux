'use client';

import { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '@/lib/api/youtube';
import { soundcloudApi } from '@/lib/api/soundcloud';
import { YouTubeSearchResults } from '@/components/search/YouTubeSearchResults';
import { SoundCloudSearchResults } from '@/components/search/SoundCloudSearchResults';
import { Button } from '@/components/ui/Button';

type SearchSource = 'youtube' | 'soundcloud';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<SearchSource>('youtube');

  const { data: youtubeResults, isLoading: youtubeLoading } = useQuery({
    queryKey: ['youtube', 'search', searchQuery],
    queryFn: () => youtubeApi.search(searchQuery),
    enabled: searchQuery.length > 0 && activeSource === 'youtube',
  });

  const { data: soundcloudResults, isLoading: soundcloudLoading } = useQuery({
    queryKey: ['soundcloud', 'search', searchQuery],
    queryFn: () => soundcloudApi.search(searchQuery),
    enabled: searchQuery.length > 0 && activeSource === 'soundcloud',
  });

  const isLoading = activeSource === 'youtube' ? youtubeLoading : soundcloudLoading;
  const results = activeSource === 'youtube' ? youtubeResults : soundcloudResults;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-50 mb-2">Search</h1>
          <p className="text-dark-400">
            Find music from YouTube and SoundCloud
          </p>
        </div>

        {/* Source Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSource('youtube')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeSource === 'youtube'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-750'
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => setActiveSource('soundcloud')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeSource === 'soundcloud'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-750'
            }`}
          >
            SoundCloud
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..."
              className="w-full px-6 py-4 pl-14 bg-dark-800 border border-dark-700 rounded-lg text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-colors"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-500" />
            <Button
              type="submit"
              variant="primary"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </form>

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark-50">
                {isLoading ? 'Searching...' : `Results for "${searchQuery}"`}
              </h2>
              {!isLoading && results && (
                <p className="text-sm text-dark-400">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              )}
            </div>

            {activeSource === 'youtube' ? (
              <YouTubeSearchResults results={youtubeResults || []} isLoading={youtubeLoading} />
            ) : (
              <SoundCloudSearchResults results={soundcloudResults || []} isLoading={soundcloudLoading} />
            )}

            {!isLoading && results && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dark-400 mb-2">No results found</p>
                <p className="text-sm text-dark-500">Try a different search query</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 mb-2">
              Search for music from {activeSource === 'youtube' ? 'YouTube' : 'SoundCloud'}
            </p>
            <p className="text-sm text-dark-500">
              Enter a song name, artist, or album to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
