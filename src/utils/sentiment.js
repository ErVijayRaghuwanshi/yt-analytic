import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  return {
    score: result.score,
    comparative: result.comparative,
    label: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
    positive: result.positive,
    negative: result.negative,
  };
};

export const analyzeComments = (comments) => {
  const results = comments.map((comment) => {
    const text =
      comment.snippet?.topLevelComment?.snippet?.textDisplay ||
      comment.snippet?.textDisplay ||
      '';
    return {
      text,
      author:
        comment.snippet?.topLevelComment?.snippet?.authorDisplayName ||
        comment.snippet?.authorDisplayName ||
        'Unknown',
      authorImage:
        comment.snippet?.topLevelComment?.snippet?.authorProfileImageUrl ||
        '',
      likeCount:
        comment.snippet?.topLevelComment?.snippet?.likeCount || 0,
      publishedAt:
        comment.snippet?.topLevelComment?.snippet?.publishedAt || '',
      ...analyzeSentiment(text),
    };
  });

  const summary = {
    total: results.length,
    positive: results.filter((r) => r.label === 'positive').length,
    negative: results.filter((r) => r.label === 'negative').length,
    neutral: results.filter((r) => r.label === 'neutral').length,
    averageScore:
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0,
  };

  return { results, summary };
};

export const getWordSentiment = (word) => {
  const result = sentiment.analyze(word);
  if (result.score > 0) return 'positive';
  if (result.score < 0) return 'negative';
  return 'neutral';
};

export const generateWordFrequency = (comments) => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'it', 'this', 'that', 'was', 'are', 'be',
    'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'not', 'no', 'so', 'if', 'then',
    'than', 'too', 'very', 'just', 'about', 'up', 'out', 'my', 'your',
    'his', 'her', 'its', 'our', 'their', 'i', 'you', 'he', 'she', 'we',
    'they', 'me', 'him', 'us', 'them', 'what', 'which', 'who', 'when',
    'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'only', 'own', 'same', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'because', 'been', 'being', 'here', 'there', 'these', 'those', 'am',
    'were', 'while', 'also', 'get', 'got', 'like', 'dont', 'im', 'ive',
    'its', 'thats', 'youre', 'hes', 'shes', 'were', 'theyre', 'wont',
    'cant', 'didnt', 'doesnt', 'isnt', 'arent', 'wasnt', 'werent',
    'really', 'much', 'one', 'two', 'even', 'still', 'well', 'back',
    'know', 'think', 'make', 'going', 'see', 'come', 'want', 'look',
    'say', 'said', 'way', 'thing', 'man', 'day', 'time',
  ]);

  const wordCount = {};

  comments.forEach((comment) => {
    const text =
      comment.snippet?.topLevelComment?.snippet?.textDisplay ||
      comment.snippet?.textDisplay ||
      '';
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .map(([text, value]) => ({ 
      text, 
      value,
      sentiment: getWordSentiment(text)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 80);
};
