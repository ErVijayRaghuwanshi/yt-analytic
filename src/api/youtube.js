import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get API key from localStorage or fallback to .env
const getApiKey = () => {
  const userApiKey = localStorage.getItem('yt-api-key');
  return userApiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
};

const youtube = axios.create({
  baseURL: BASE_URL,
});

// Add interceptor to include API key in every request
youtube.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key not found. Please provide an API key in settings.');
  }
  config.params = {
    ...config.params,
    key: apiKey,
  };
  return config;
});

export const searchVideos = async (query, maxResults = 12, pageToken = '', categoryId = '', order = 'relevance') => {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    order,
  };
  if (pageToken) params.pageToken = pageToken;
  if (categoryId) params.videoCategoryId = categoryId;
  const response = await youtube.get('/search', { params });
  
  const searchData = response.data;
  
  if (!searchData.items || searchData.items.length === 0) {
    return searchData;
  }
  
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
  const detailsResponse = await youtube.get('/videos', {
    params: {
      part: 'statistics,contentDetails',
      id: videoIds,
    },
  });
  
  const videoDetailsMap = {};
  detailsResponse.data.items?.forEach(video => {
    videoDetailsMap[video.id] = {
      statistics: video.statistics,
      contentDetails: video.contentDetails,
    };
  });
  
  searchData.items = searchData.items.map(item => {
    const videoId = item.id.videoId;
    const details = videoDetailsMap[videoId];
    return {
      ...item,
      id: videoId,
      statistics: details?.statistics,
      contentDetails: details?.contentDetails,
    };
  });
  
  return searchData;
};

export const getTrendingVideos = async (regionCode = 'US', maxResults = 12, pageToken = '', categoryId = '') => {
  const params = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode,
    maxResults,
  };
  if (pageToken) params.pageToken = pageToken;
  if (categoryId) params.videoCategoryId = categoryId;
  const response = await youtube.get('/videos', { params });
  return response.data;
};

export const getVideoDetails = async (videoId) => {
  const response = await youtube.get('/videos', {
    params: {
      part: 'snippet,statistics,contentDetails',
      id: videoId,
    },
  });
  return response.data.items?.[0] || null;
};

export const getVideoComments = async (videoId, maxResults = 100, includeReplies = true) => {
  const allComments = [];
  let pageToken = '';
  let remaining = maxResults;

  while (remaining > 0) {
    const fetchCount = Math.min(remaining, 100);
    const params = {
      part: 'snippet,replies',
      videoId,
      maxResults: fetchCount,
      order: 'relevance',
      textFormat: 'plainText',
    };
    if (pageToken) params.pageToken = pageToken;

    const response = await youtube.get('/commentThreads', { params });
    const items = response.data.items || [];
    
    // Add top-level comments
    allComments.push(...items);
    
    // Add reply comments if enabled
    if (includeReplies) {
      items.forEach(thread => {
        if (thread.replies && thread.replies.comments) {
          // Transform reply comments to match the structure of top-level comments
          const replyComments = thread.replies.comments.map(reply => ({
            snippet: {
              textDisplay: reply.snippet.textDisplay,
              authorDisplayName: reply.snippet.authorDisplayName,
              authorProfileImageUrl: reply.snippet.authorProfileImageUrl,
              likeCount: reply.snippet.likeCount,
              publishedAt: reply.snippet.publishedAt,
            }
          }));
          allComments.push(...replyComments);
        }
      });
    }
    
    remaining -= items.length;
    pageToken = response.data.nextPageToken;

    if (!pageToken || items.length === 0) break;
  }

  return allComments;
};

export const extractVideoId = (input) => {
  if (!input) return null;

  // Direct video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export default youtube;
