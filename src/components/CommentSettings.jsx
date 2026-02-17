import { useState, useEffect } from 'react';
import { Settings, X, Trash2, Database, Key } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getCacheStats, clearCache } from '../utils/indexedDB';
import ApiKeyModal from './ApiKeyModal';

function CommentSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [commentCount, setCommentCount] = useLocalStorage('yt-comment-count', 200);
  const [cacheStats, setCacheStats] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = () => {
    const userApiKey = localStorage.getItem('yt-api-key');
    const envApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    setHasApiKey(!!(userApiKey || envApiKey));
  };

  const handleSaveApiKey = (apiKey) => {
    if (apiKey) {
      localStorage.setItem('yt-api-key', apiKey);
    } else {
      localStorage.removeItem('yt-api-key');
    }
    checkApiKey();
  };

  useEffect(() => {
    if (isOpen) {
      loadCacheStats();
    }
  }, [isOpen]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will remove all stored videos, comments, and analysis results.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearCache();
      await loadCacheStats();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative"
          aria-label="Comment settings"
          title="Comment Analysis Settings"
        >
          <Settings className="w-5 h-5" />
          {commentCount !== 200 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Comment Analysis Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of comments to fetch
                  </label>
                  <select
                    value={commentCount}
                    onChange={(e) => setCommentCount(Number(e.target.value))}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none"
                  >
                    <option value={200}>200 comments</option>
                    <option value={500}>500 comments</option>
                    <option value={1000}>1000 comments</option>
                    <option value={5000}>5000 comments</option>
                    <option value={10000}>All available comments</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Changes apply automatically to the current video. This setting is saved for all future videos.
                  </p>
                  {commentCount >= 1000 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Fetching {commentCount >= 10000 ? 'all' : commentCount} comments may take longer and use more API quota.
                    </p>
                  )}
                </div>

                {/* API Key Management */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowApiKeyModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>YouTube API Key</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      hasApiKey 
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                    }`}>
                      {hasApiKey ? 'Configured' : 'Not Set'}
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-3">
                    {hasApiKey 
                      ? 'Using your API key for requests' 
                      : 'Click to add your YouTube API key'}
                  </p>
                </div>

                {/* Cache Management */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Cache Storage
                      </span>
                    </div>
                    <button
                      onClick={handleClearCache}
                      disabled={isClearing || !cacheStats || cacheStats.total === 0}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isClearing ? 'Clearing...' : 'Clear Cache'}
                    </button>
                  </div>
                  {cacheStats ? (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">{cacheStats.videos}</div>
                        <div className="text-gray-500 dark:text-gray-400">Videos</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">{cacheStats.comments}</div>
                        <div className="text-gray-500 dark:text-gray-400">Comments</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">{cacheStats.analysis}</div>
                        <div className="text-gray-500 dark:text-gray-400">Analysis</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading cache stats...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
      />
    </>
  );
}

export default CommentSettings;
