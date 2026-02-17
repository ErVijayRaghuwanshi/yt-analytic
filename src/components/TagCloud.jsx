import { useMemo, useState } from 'react';
import { Hash, TrendingUp, Sparkles } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';

function TagCloud({ tags, video }) {
  const [hoveredTag, setHoveredTag] = useState(null);
  const { addFilter } = useFilter();

  const handleTagClick = (tagText) => {
    addFilter('tags', tagText);
  };

  const maxValue = useMemo(() => {
    if (!tags || tags.length === 0) return 1;
    return Math.max(...tags.map((t) => t.value));
  }, [tags]);

  const getFontSize = (value) => {
    const minSize = 13;
    const maxSize = 40;
    const ratio = value / maxValue;
    return Math.round(minSize + ratio * (maxSize - minSize));
  };

  const getOpacity = (value) => {
    const ratio = value / maxValue;
    return 0.75 + ratio * 0.25;
  };

  const getColor = (value, isHovered) => {
    // Gradient from blue to purple based on frequency
    const ratio = value / maxValue;
    if (isHovered) {
      return ratio > 0.7 ? '#7c3aed' : ratio > 0.4 ? '#8b5cf6' : '#a78bfa';
    }
    return ratio > 0.7 ? '#8b5cf6' : ratio > 0.4 ? '#a78bfa' : '#c4b5fd';
  };

  const getGlowColor = (value) => {
    const ratio = value / maxValue;
    return ratio > 0.7
      ? 'rgba(139, 92, 246, 0.5)'
      : ratio > 0.4
      ? 'rgba(167, 139, 246, 0.4)'
      : 'rgba(196, 181, 253, 0.3)';
  };

  const topTags = useMemo(() => {
    return tags.slice(0, 5);
  }, [tags]);

  if (!tags || tags.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tags & Topics</h3>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          No tags found in video or comments.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tags & Topics</h3>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {tags.length} tags found
        </span>
      </div>

      {/* Top Tags List */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-100 dark:border-purple-900">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            Top Tags
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {topTags.map((tag, index) => (
            <span
              key={tag.text}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm"
            >
              <span className="text-purple-400 dark:text-purple-500">#{index + 1}</span>
              {tag.text}
              <span className="text-purple-500 dark:text-purple-400 font-semibold">
                {tag.value}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="min-h-[280px] max-h-[380px] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-2">
          {tags.map((tag, index) => {
            const isHovered = hoveredTag === tag.text;
            return (
              <span
                key={tag.text}
                className="inline-flex items-center gap-1 cursor-pointer transition-all duration-300 select-none"
                onMouseEnter={() => setHoveredTag(tag.text)}
                onMouseLeave={() => setHoveredTag(null)}
                onClick={() => handleTagClick(tag.text)}
                style={{
                  fontSize: `${getFontSize(tag.value)}px`,
                  color: getColor(tag.value, isHovered),
                  opacity: getOpacity(tag.value),
                  fontWeight: tag.value > maxValue * 0.5 ? 700 : 600,
                  lineHeight: 1.4,
                  textShadow: isHovered
                    ? `0 0 20px ${getGlowColor(tag.value)}, 0 0 10px ${getGlowColor(tag.value)}`
                    : 'none',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  animation: `fadeInTag 0.5s ease-out ${index * 0.04}s both`,
                }}
                title={`#${tag.text}: ${tag.value} mentions`}
              >
                <Hash className="w-3 h-3 opacity-60" />
                {tag.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          <p>Tags from video metadata, hashtags, and comment analysis</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInTag {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default TagCloud;
