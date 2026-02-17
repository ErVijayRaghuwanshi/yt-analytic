import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Settings, RefreshCw, Database } from 'lucide-react';
import { getVideoDetails, getVideoComments } from '../api/youtube';
import { analyzeComments, generateWordFrequency } from '../utils/sentiment';
import { extractEntities } from '../utils/ner';
import { extractTags } from '../utils/tags';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  getCachedVideo, 
  setCachedVideo, 
  getCachedComments, 
  setCachedComments,
  getAllCachedAnalysis,
  saveAllAnalysis,
  CACHE_TYPES 
} from '../utils/cache';
import { FilterProvider } from '../contexts/FilterContext';
import VideoStats from './VideoStats';
import VideoStatsSkeleton from './VideoStatsSkeleton';
import SentimentChart from './SentimentChart';
import WordCloudComponent from './WordCloud';
import TopComments from './TopComments';
import EntityCloud from './EntityCloud';
import TagCloud from './TagCloud';
import ActiveFilters from './ActiveFilters';

function VideoDashboard({ videoId }) {
  const [video, setVideo] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [entityData, setEntityData] = useState({ people: [], places: [], organizations: [] });
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentCount, setCommentCount] = useLocalStorage('yt-comment-count', 200);
  const [actualCommentCount, setActualCommentCount] = useState(0);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  useEffect(() => {
    // Auto-refetch when comment count changes (but not on initial mount)
    if (video && !loading) {
      handleRefetchComments();
    }
  }, [commentCount]);

  const handleRefetchComments = async () => {
    if (!video || isFetchingComments) return;
    
    setIsFetchingComments(true);
    try {
      const comments = await getVideoComments(videoId, commentCount);
      setActualCommentCount(comments.length);
      
      if (comments.length > 0) {
        const analysis = analyzeComments(comments);
        setSentimentData(analysis);

        const words = generateWordFrequency(comments);
        setWordCloudData(words);

        const entities = extractEntities(comments);
        setEntityData(entities);

        const tags = extractTags(video, comments);
        setTagData(tags);
      } else {
        setSentimentData({ results: [], summary: { total: 0, positive: 0, negative: 0, neutral: 0, averageScore: 0 } });
        setEntityData({ people: [], places: [], organizations: [] });
        setTagData([]);
      }
    } catch (err) {
      console.error('Error refetching comments:', err);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const fetchVideoData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      // Check cache for video details
      let videoData = !forceRefresh ? await getCachedVideo(videoId) : null;
      
      if (videoData) {
        setVideo(videoData);
        setIsCached(true);
      } else {
        // Fetch from API
        videoData = await getVideoDetails(videoId);
        if (!videoData) {
          setError('Video not found. Please check the video ID or URL.');
          setLoading(false);
          return;
        }
        setVideo(videoData);
        // Cache the video data
        await setCachedVideo(videoId, videoData);
      }
      setLoading(false);

      // Fetch and analyze comments
      setCommentLoading(true);
      try {
        // Check cache for comments
        let comments = !forceRefresh ? await getCachedComments(videoId, commentCount) : null;
        let cachedAnalysis = null;
        
        if (comments) {
          setIsCached(true);
          // Try to get cached analysis
          cachedAnalysis = await getAllCachedAnalysis(videoId);
        } else {
          // Fetch from API
          comments = await getVideoComments(videoId, commentCount);
          // Cache the comments
          await setCachedComments(videoId, comments, commentCount);
        }
        
        setActualCommentCount(comments.length);
        
        if (comments.length > 0) {
          // Use cached analysis if available, otherwise compute
          if (cachedAnalysis?.sentiment && cachedAnalysis?.entities && cachedAnalysis?.tags && cachedAnalysis?.words) {
            setSentimentData(cachedAnalysis.sentiment);
            setWordCloudData(cachedAnalysis.words);
            setEntityData(cachedAnalysis.entities);
            setTagData(cachedAnalysis.tags);
          } else {
            // Compute analysis
            const analysis = analyzeComments(comments);
            setSentimentData(analysis);

            const words = generateWordFrequency(comments);
            setWordCloudData(words);

            const entities = extractEntities(comments);
            setEntityData(entities);

            const tags = extractTags(videoData, comments);
            setTagData(tags);
            
            // Cache the analysis results
            await saveAllAnalysis(videoId, analysis, entities, tags, words);
          }
        } else {
          setSentimentData({ results: [], summary: { total: 0, positive: 0, negative: 0, neutral: 0, averageScore: 0 } });
          setEntityData({ people: [], places: [], organizations: [] });
          setTagData([]);
        }
      } catch (commentErr) {
        console.error('Error fetching comments:', commentErr);
        if (commentErr.response?.status === 403) {
          setSentimentData(null);
        }
      } finally {
        setCommentLoading(false);
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      if (err.response?.status === 403) {
        setError('API quota exceeded. Please try again later.');
      } else {
        setError('Failed to fetch video data. Please check your API key and try again.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <VideoStatsSkeleton />
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-6" />
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Info & Stats */}
      <VideoStats video={video} />

      {/* Comment Analysis Section */}
      {commentLoading ? (
        <div className="space-y-6">
          <div className="card animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-6" />
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card animate-pulse h-80">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
                ))}
              </div>
            </div>
            <div className="card animate-pulse h-80">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : sentimentData ? (
        <>
          {sentimentData.summary.total > 0 ? (
            <FilterProvider comments={sentimentData.results}>
              <ActiveFilters />
              
              <SentimentChart
                summary={sentimentData.summary}
                results={sentimentData.results}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EntityCloud entities={entityData} />
                <TagCloud tags={tagData} video={video} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WordCloudComponent words={wordCloudData} />
                <TopComments comments={sentimentData.results} />
              </div>
            </FilterProvider>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-400 dark:text-gray-500">
                No comments found for this video. Comments may be disabled.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-8">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Could not load comments. The API quota may be exceeded or comments are disabled.
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoDashboard;
