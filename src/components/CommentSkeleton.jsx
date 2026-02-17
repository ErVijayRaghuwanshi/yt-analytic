function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg animate-pulse">
      {/* Avatar Skeleton */}
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Author and badge */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>
        
        {/* Comment text */}
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default CommentSkeleton;
