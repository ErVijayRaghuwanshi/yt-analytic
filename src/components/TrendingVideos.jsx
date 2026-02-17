import { useState, useEffect, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { getTrendingVideos } from '../api/youtube';
import { REGIONS, VIDEO_CATEGORIES } from '../constants/categories';
import { useLocalStorage } from '../hooks/useLocalStorage';
import VideoList from './VideoList';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const selectClass =
  'text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none';

function TrendingVideosSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [region, setRegion] = useLocalStorage('yt-trending-region', 'US');
  const [category, setCategory] = useLocalStorage('yt-trending-category', '');
  const [error, setError] = useState(null);
  const [nextToken, setNextToken] = useState('');

  const fetchTrending = useCallback(async (pageToken = '', isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getTrendingVideos(region, 12, pageToken, category);
      if (isLoadMore) {
        setVideos(prev => [...prev, ...(data.items || [])]);
      } else {
        setVideos(data.items || []);
      }
      setNextToken(data.nextPageToken || '');
    } catch (err) {
      console.error('Error fetching trending videos:', err);
      if (err.response?.status === 403) {
        setError('API quota exceeded. Please try again later or check your API key.');
      } else {
        setError('Failed to fetch trending videos. Please check your API key.');
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [region, category]);

  useEffect(() => {
    fetchTrending('', false);
  }, [region, category, fetchTrending]);

  const loadMore = useCallback(async () => {
    if (!nextToken || loadingMore) return;
    await fetchTrending(nextToken, true);
  }, [nextToken, loadingMore, fetchTrending]);

  const sentinelRef = useInfiniteScroll(loadMore, !!nextToken, loadingMore);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending Videos</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={selectClass}
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <VideoList 
          videos={videos} 
          loading={loading} 
          loadingMore={loadingMore}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}

export default TrendingVideosSection;
