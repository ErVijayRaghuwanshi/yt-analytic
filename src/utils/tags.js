import nlp from 'compromise';

export const extractTags = (video, comments) => {
  const tagMap = {};
  
  // Extract from video tags if available
  if (video?.snippet?.tags) {
    video.snippet.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().trim();
      if (normalizedTag.length > 2) {
        tagMap[normalizedTag] = (tagMap[normalizedTag] || 0) + 5; // Weight video tags higher
      }
    });
  }

  // Extract from video title and description
  const videoText = [
    video?.snippet?.title || '',
    video?.snippet?.description || ''
  ].join(' ');

  const videoDoc = nlp(videoText);
  
  // Extract nouns and noun phrases as potential tags
  videoDoc.nouns().forEach(noun => {
    const tag = noun.text().toLowerCase().trim();
    if (tag.length > 2 && !isStopWord(tag)) {
      tagMap[tag] = (tagMap[tag] || 0) + 3; // Weight video content tags
    }
  });

  // Extract hashtags from video description
  const hashtags = videoText.match(/#[\w]+/g) || [];
  hashtags.forEach(hashtag => {
    const tag = hashtag.substring(1).toLowerCase();
    if (tag.length > 2) {
      tagMap[tag] = (tagMap[tag] || 0) + 4;
    }
  });

  // Extract from comments
  comments.forEach(comment => {
    const text =
      comment.snippet?.topLevelComment?.snippet?.textDisplay ||
      comment.snippet?.textDisplay ||
      '';
    
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ');
    
    // Extract hashtags from comments
    const commentHashtags = cleanText.match(/#[\w]+/g) || [];
    commentHashtags.forEach(hashtag => {
      const tag = hashtag.substring(1).toLowerCase();
      if (tag.length > 2) {
        tagMap[tag] = (tagMap[tag] || 0) + 2;
      }
    });

    // Extract key nouns from comments
    const doc = nlp(cleanText);
    doc.nouns().forEach(noun => {
      const tag = noun.text().toLowerCase().trim();
      if (tag.length > 2 && !isStopWord(tag)) {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      }
    });
  });

  // Convert to array and sort by frequency
  return Object.entries(tagMap)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Top 50 tags
};

const isStopWord = (word) => {
  const stopWords = new Set([
    'video', 'comment', 'comments', 'youtube', 'channel', 'subscribe',
    'like', 'share', 'watch', 'link', 'description', 'check', 'follow',
    'instagram', 'twitter', 'facebook', 'social', 'media', 'content',
    'creator', 'viewers', 'audience', 'people', 'person', 'thing', 'things',
    'time', 'times', 'day', 'days', 'year', 'years', 'way', 'ways',
  ]);
  return stopWords.has(word);
};

export const getTopTags = (tags, count = 10) => {
  return tags.slice(0, count);
};

export const getTagsByCategory = (tags) => {
  // Simple categorization based on common patterns
  const categories = {
    trending: [],
    technical: [],
    general: [],
  };

  const technicalKeywords = ['code', 'programming', 'software', 'tech', 'api', 'data', 'algorithm', 'development'];
  
  tags.forEach(tag => {
    const text = tag.text.toLowerCase();
    
    if (tag.value > 10) {
      categories.trending.push(tag);
    } else if (technicalKeywords.some(keyword => text.includes(keyword))) {
      categories.technical.push(tag);
    } else {
      categories.general.push(tag);
    }
  });

  return categories;
};
