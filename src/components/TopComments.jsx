import { useState, useCallback } from 'react';
import { ThumbsUp, SmilePlus, Frown, Meh } from 'lucide-react';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import CommentSkeleton from './CommentSkeleton';
import { useFilter } from '../contexts/FilterContext';

function SentimentBadge({ label }) {
  const config = {
    positive: {
      icon: SmilePlus,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    neutral: {
      icon: Meh,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    negative: {
      icon: Frown,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  };

  const c = config[label] || config.neutral;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

const COMMENTS_PER_PAGE = 10;

function TopComments({ comments }) {
  const { filteredComments, hasActiveFilters } = useFilter();
  const [displayCount, setDisplayCount] = useState(COMMENTS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Use filtered comments if filters are active, otherwise use all comments
  const commentsToDisplay = hasActiveFilters ? filteredComments : comments;

  if (!commentsToDisplay || commentsToDisplay.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Comments</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          No comments available.
        </p>
      </div>
    );
  }

  // Sort by like count
  const sorted = [...commentsToDisplay].sort((a, b) => b.likeCount - a.likeCount);
  const displayedComments = sorted.slice(0, displayCount);
  const hasMore = displayCount < sorted.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + COMMENTS_PER_PAGE, sorted.length));
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, sorted.length]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Comments</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {sorted.length} comments sorted by likes
        </span>
      </div>

      <div className="space-y-4 pr-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
        {displayedComments.map((comment, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Avatar */}
            <div className="shrink-0">
              {comment.authorImage ? (
                <img
                  src={comment.authorImage}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                  {comment.author?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {comment.author}
                </span>
                <SentimentBadge label={comment.label} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line line-clamp-3">
                {comment.text}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <ThumbsUp className="w-3 h-3" />
                  {comment.likeCount}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Score: {comment.score}
                </span>
                {comment.publishedAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(comment.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Skeleton loading while loading more */}
        {loadingMore && (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

export default TopComments;
