function VideoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        </div>

        {/* Channel Name Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-3" />

        {/* Stats Skeleton */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>

        {/* Date Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32" />
      </div>
    </div>
  );
}

export default VideoCardSkeleton;
