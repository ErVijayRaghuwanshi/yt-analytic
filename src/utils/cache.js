import { getVideo, saveVideo, getComments, saveComments, getAnalysis, saveAnalysis } from './indexedDB';

export const CACHE_TYPES = {
  VIDEO: 'video',
  COMMENTS: 'comments',
  SENTIMENT: 'sentiment',
  ENTITIES: 'entities',
  TAGS: 'tags',
  WORDS: 'words',
};

export const CACHE_DURATION = {
  VIDEO: 60 * 60 * 1000, // 1 hour
  COMMENTS: 6 * 60 * 60 * 1000, // 6 hours
  ANALYSIS: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache video details
export const getCachedVideo = async (videoId) => {
  try {
    return await getVideo(videoId);
  } catch (error) {
    console.error('Error getting cached video:', error);
    return null;
  }
};

export const setCachedVideo = async (videoId, data) => {
  try {
    await saveVideo(videoId, data);
  } catch (error) {
    console.error('Error caching video:', error);
  }
};

// Cache comments
export const getCachedComments = async (videoId, count) => {
  try {
    return await getComments(videoId, count);
  } catch (error) {
    console.error('Error getting cached comments:', error);
    return null;
  }
};

export const setCachedComments = async (videoId, comments, count) => {
  try {
    await saveComments(videoId, comments, count);
  } catch (error) {
    console.error('Error caching comments:', error);
  }
};

// Cache analysis results
export const getCachedAnalysis = async (videoId, type) => {
  try {
    return await getAnalysis(videoId, type);
  } catch (error) {
    console.error('Error getting cached analysis:', error);
    return null;
  }
};

export const setCachedAnalysis = async (videoId, type, data) => {
  try {
    await saveAnalysis(videoId, type, data);
  } catch (error) {
    console.error('Error caching analysis:', error);
  }
};

// Get all cached analysis for a video
export const getAllCachedAnalysis = async (videoId) => {
  try {
    const [sentiment, entities, tags, words] = await Promise.all([
      getAnalysis(videoId, CACHE_TYPES.SENTIMENT),
      getAnalysis(videoId, CACHE_TYPES.ENTITIES),
      getAnalysis(videoId, CACHE_TYPES.TAGS),
      getAnalysis(videoId, CACHE_TYPES.WORDS),
    ]);

    return { sentiment, entities, tags, words };
  } catch (error) {
    console.error('Error getting all cached analysis:', error);
    return { sentiment: null, entities: null, tags: null, words: null };
  }
};

// Save all analysis results
export const saveAllAnalysis = async (videoId, sentiment, entities, tags, words) => {
  try {
    await Promise.all([
      saveAnalysis(videoId, CACHE_TYPES.SENTIMENT, sentiment),
      saveAnalysis(videoId, CACHE_TYPES.ENTITIES, entities),
      saveAnalysis(videoId, CACHE_TYPES.TAGS, tags),
      saveAnalysis(videoId, CACHE_TYPES.WORDS, words),
    ]);
  } catch (error) {
    console.error('Error saving all analysis:', error);
  }
};

// Get cache timestamp for display
export const getCacheAge = (timestamp) => {
  if (!timestamp) return null;
  
  const ageMs = Date.now() - timestamp;
  const ageMinutes = Math.floor(ageMs / (60 * 1000));
  const ageHours = Math.floor(ageMs / (60 * 60 * 1000));
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageDays > 0) return `${ageDays} day${ageDays !== 1 ? 's' : ''} ago`;
  if (ageHours > 0) return `${ageHours} hour${ageHours !== 1 ? 's' : ''} ago`;
  if (ageMinutes > 0) return `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago`;
  return 'just now';
};
