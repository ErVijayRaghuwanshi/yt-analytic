const DB_NAME = 'yt-analytics-cache';
const DB_VERSION = 1;

const STORES = {
  VIDEOS: 'videos',
  COMMENTS: 'comments',
  ANALYSIS: 'analysis',
};

let dbInstance = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create videos store
      if (!db.objectStoreNames.contains(STORES.VIDEOS)) {
        const videoStore = db.createObjectStore(STORES.VIDEOS, { keyPath: 'id' });
        videoStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create comments store
      if (!db.objectStoreNames.contains(STORES.COMMENTS)) {
        const commentStore = db.createObjectStore(STORES.COMMENTS, { keyPath: 'id' });
        commentStore.createIndex('videoId', 'videoId', { unique: false });
        commentStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create analysis store
      if (!db.objectStoreNames.contains(STORES.ANALYSIS)) {
        const analysisStore = db.createObjectStore(STORES.ANALYSIS, { keyPath: 'id' });
        analysisStore.createIndex('videoId', 'videoId', { unique: false });
        analysisStore.createIndex('type', 'type', { unique: false });
        analysisStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const saveVideo = async (videoId, data) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
  const store = transaction.objectStore(STORES.VIDEOS);
  
  const entry = {
    id: videoId,
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
  };
  
  await store.put(entry);
  return entry;
};

export const getVideo = async (videoId) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS], 'readonly');
  const store = transaction.objectStore(STORES.VIDEOS);
  
  return new Promise((resolve, reject) => {
    const request = store.get(videoId);
    request.onsuccess = () => {
      const entry = request.result;
      if (entry && entry.expiresAt > Date.now()) {
        resolve(entry.data);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveComments = async (videoId, comments, count) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.COMMENTS], 'readwrite');
  const store = transaction.objectStore(STORES.COMMENTS);
  
  const entry = {
    id: `${videoId}:${count}`,
    videoId,
    count,
    comments,
    timestamp: Date.now(),
    expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 hours
  };
  
  await store.put(entry);
  return entry;
};

export const getComments = async (videoId, count) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.COMMENTS], 'readonly');
  const store = transaction.objectStore(STORES.COMMENTS);
  
  return new Promise((resolve, reject) => {
    const request = store.get(`${videoId}:${count}`);
    request.onsuccess = () => {
      const entry = request.result;
      if (entry && entry.expiresAt > Date.now()) {
        resolve(entry.comments);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveAnalysis = async (videoId, type, data) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.ANALYSIS], 'readwrite');
  const store = transaction.objectStore(STORES.ANALYSIS);
  
  const entry = {
    id: `${videoId}:${type}`,
    videoId,
    type,
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  await store.put(entry);
  return entry;
};

export const getAnalysis = async (videoId, type) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.ANALYSIS], 'readonly');
  const store = transaction.objectStore(STORES.ANALYSIS);
  
  return new Promise((resolve, reject) => {
    const request = store.get(`${videoId}:${type}`);
    request.onsuccess = () => {
      const entry = request.result;
      if (entry && entry.expiresAt > Date.now()) {
        resolve(entry.data);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearCache = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS, STORES.COMMENTS, STORES.ANALYSIS], 'readwrite');
  
  await Promise.all([
    transaction.objectStore(STORES.VIDEOS).clear(),
    transaction.objectStore(STORES.COMMENTS).clear(),
    transaction.objectStore(STORES.ANALYSIS).clear(),
  ]);
};

export const getCacheStats = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS, STORES.COMMENTS, STORES.ANALYSIS], 'readonly');
  
  const getCount = (storeName) => {
    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(storeName).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  const [videos, comments, analysis] = await Promise.all([
    getCount(STORES.VIDEOS),
    getCount(STORES.COMMENTS),
    getCount(STORES.ANALYSIS),
  ]);
  
  return { videos, comments, analysis, total: videos + comments + analysis };
};

export const getAllVideos = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS], 'readonly');
  const store = transaction.objectStore(STORES.VIDEOS);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const videos = request.result || [];
      // Filter out expired entries and sort by timestamp (newest first)
      const validVideos = videos
        .filter(entry => entry.expiresAt > Date.now())
        .sort((a, b) => b.timestamp - a.timestamp);
      resolve(validVideos);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteVideo = async (videoId) => {
  const db = await openDB();
  const transaction = db.transaction([STORES.VIDEOS, STORES.COMMENTS, STORES.ANALYSIS], 'readwrite');
  
  // Delete video
  await transaction.objectStore(STORES.VIDEOS).delete(videoId);
  
  // Delete associated comments
  const commentStore = transaction.objectStore(STORES.COMMENTS);
  const commentIndex = commentStore.index('videoId');
  const commentRequest = commentIndex.getAllKeys(videoId);
  
  commentRequest.onsuccess = () => {
    const keys = commentRequest.result;
    keys.forEach(key => commentStore.delete(key));
  };
  
  // Delete associated analysis
  const analysisStore = transaction.objectStore(STORES.ANALYSIS);
  const analysisIndex = analysisStore.index('videoId');
  const analysisRequest = analysisIndex.getAllKeys(videoId);
  
  analysisRequest.onsuccess = () => {
    const keys = analysisRequest.result;
    keys.forEach(key => analysisStore.delete(key));
  };
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
