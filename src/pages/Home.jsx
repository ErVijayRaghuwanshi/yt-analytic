import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { searchVideos } from '../api/youtube';
import VideoList from '../components/VideoList';
import TrendingVideosSection from '../components/TrendingVideos';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

function Home() {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchNextToken, setSearchNextToken] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchSort, setSearchSort] = useState('relevance');

  const fetchSearch = useCallback(async (query, pageToken = '', categoryId = '', order = 'relevance', isLoadMore = false) => {
    if (isLoadMore) {
      setSearchLoadingMore(true);
    } else {
      setSearchLoading(true);
    }
    setSearchError(null);

    try {
      const data = await searchVideos(query, 12, pageToken, categoryId, order);
      if (isLoadMore) {
        setSearchResults(prev => [...prev, ...(data.items || [])]);
      } else {
        setSearchResults(data.items || []);
      }
      setSearchNextToken(data.nextPageToken || '');
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 403) {
        setSearchError('API quota exceeded. Please try again later or check your API key.');
      } else {
        setSearchError('Search failed. Please check your API key and try again.');
      }
      if (!isLoadMore) {
        setSearchResults([]);
      }
    } finally {
      if (isLoadMore) {
        setSearchLoadingMore(false);
      } else {
        setSearchLoading(false);
      }
    }
  }, []);

  const handleSearch = async (query, categoryId = '', order = 'relevance') => {
    setSearchQuery(query);
    setSearchCategory(categoryId);
    setSearchSort(order);
    setHasSearched(true);
    await fetchSearch(query, '', categoryId, order, false);
  };

  const loadMoreSearch = useCallback(async () => {
    if (!searchNextToken || searchLoadingMore) return;
    await fetchSearch(searchQuery, searchNextToken, searchCategory, searchSort, true);
  }, [searchQuery, searchNextToken, searchCategory, searchSort, searchLoadingMore, fetchSearch]);

  const sentinelRef = useInfiniteScroll(loadMoreSearch, !!searchNextToken, searchLoadingMore);

  useEffect(() => {
    if (location.state?.query) {
      const { query, categoryId = '', order = 'relevance' } = location.state;
      setSearchQuery(query);
      setSearchCategory(categoryId);
      setSearchSort(order);
      setHasSearched(true);
      fetchSearch(query, '', categoryId, order, false);
    }
  }, [location.state, fetchSearch]);

  return (
    <div>
      {/* Search Results */}
      {hasSearched && (
        <div className="mb-10">
          {searchError ? (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
              {searchError}
            </div>
          ) : (
            <VideoList
              videos={searchResults}
              loading={searchLoading}
              loadingMore={searchLoadingMore}
              sentinelRef={sentinelRef}
              title={
                searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : undefined
              }
              emptyMessage="No videos found. Try a different search term."
            />
          )}
        </div>
      )}

      {/* Trending Videos */}
      <div className="mt-6">
        <TrendingVideosSection />
      </div>
    </div>
  );
}

export default Home;
