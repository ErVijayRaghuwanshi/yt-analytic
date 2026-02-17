function VideoStatsSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Thumbnail Skeleton */}
        <div className="lg:w-96 shrink-0">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Info Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Title Skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>

          {/* Channel and Date Skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto" />
              </div>
            ))}
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoStatsSkeleton;
