import { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Trash2, Loader2 } from 'lucide-react';
import { getAllVideos, deleteVideo, clearCache } from '../utils/indexedDB';
import HistoryVideoCard from '../components/HistoryVideoCard';

function History() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(entry => {
        const title = entry.data?.snippet?.title?.toLowerCase() || '';
        const channel = entry.data?.snippet?.channelTitle?.toLowerCase() || '';
        return title.includes(query) || channel.includes(query);
      });
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchQuery, videos]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const cachedVideos = await getAllVideos();
      setVideos(cachedVideos);
      setFilteredVideos(cachedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await deleteVideo(videoId);
      await loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all history? This will delete all cached videos and analysis.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearCache();
      await loadVideos();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear history. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading history...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
          </div>
          
          {videos.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {videos.length} video{videos.length !== 1 ? 's' : ''} analyzed and cached
        </p>
      </div>

      {/* Search */}
      {videos.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or channel..."
              className="w-full px-4 pl-10 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none"
            />
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((videoEntry) => (
            <HistoryVideoCard
              key={videoEntry.id}
              videoEntry={videoEntry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No videos found matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <HistoryIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Analysis History
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start analyzing videos to build your history. Analyzed videos are cached for quick access later.
          </p>
        </div>
      )}
    </div>
  );
}

export default History;
