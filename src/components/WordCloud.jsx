import { useMemo, useState } from 'react';
import { Cloud } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';

const SENTIMENT_COLORS = {
  positive: {
    base: '#22c55e',
    hover: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  negative: {
    base: '#ef4444',
    hover: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  neutral: {
    base: '#f59e0b',
    hover: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
};

function WordCloudComponent({ words }) {
  const [hoveredWord, setHoveredWord] = useState(null);
  const { addFilter } = useFilter();

  const handleWordClick = (word) => {
    addFilter('words', word);
  };

  const validWords = useMemo(() => {
    if (!words || words.length === 0) return [];
    return words.filter((w) => w.text && w.value > 0);
  }, [words]);

  const maxValue = useMemo(() => {
    if (validWords.length === 0) return 1;
    return Math.max(...validWords.map((w) => w.value));
  }, [validWords]);

  const getFontSize = (value) => {
    const minSize = 14;
    const maxSize = 52;
    const ratio = value / maxValue;
    return Math.round(minSize + ratio * (maxSize - minSize));
  };

  const getOpacity = (value) => {
    const ratio = value / maxValue;
    return 0.7 + ratio * 0.3;
  };

  const getColor = (word, isHovered) => {
    const sentiment = word.sentiment || 'neutral';
    const colors = SENTIMENT_COLORS[sentiment];
    return isHovered ? colors.hover : colors.base;
  };

  const getGlowColor = (word) => {
    const sentiment = word.sentiment || 'neutral';
    return SENTIMENT_COLORS[sentiment].glow;
  };

  if (validWords.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Word Cloud</h3>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          Not enough comment data to generate a word cloud.
        </p>
      </div>
    );
  }

  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    validWords.forEach(word => {
      counts[word.sentiment || 'neutral']++;
    });
    return counts;
  }, [validWords]);

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Word Cloud</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500 dark:text-gray-400">{sentimentCounts.positive}</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-500 dark:text-gray-400">{sentimentCounts.neutral}</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500 dark:text-gray-400">{sentimentCounts.negative}</span>
          </span>
        </div>
      </div>
      <div 
        className="w-full flex flex-wrap items-center justify-center gap-3 overflow-y-auto py-4 px-2"
        style={{ minHeight: '300px', maxHeight: '400px' }}
      >
        {validWords.map((word, index) => {
          const isHovered = hoveredWord === word.text;
          return (
            <span
              key={word.text}
              className="inline-block cursor-pointer transition-all duration-300 select-none"
              onMouseEnter={() => setHoveredWord(word.text)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={() => handleWordClick(word.text)}
              style={{
                fontSize: `${getFontSize(word.value)}px`,
                color: getColor(word, isHovered),
                opacity: getOpacity(word.value),
                fontWeight: word.value > maxValue * 0.5 ? 700 : 600,
                lineHeight: 1.3,
                textShadow: isHovered 
                  ? `0 0 20px ${getGlowColor(word)}, 0 0 10px ${getGlowColor(word)}`
                  : 'none',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                animation: `fadeIn 0.5s ease-out ${index * 0.03}s both`,
              }}
              title={`${word.text}: ${word.value} occurrences (${word.sentiment})`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <p>Top {validWords.length} words • Colors indicate sentiment</p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default WordCloudComponent;
