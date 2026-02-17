import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';
import { Loader2 } from 'lucide-react';

function VideoList({ videos, loading, title, emptyMessage, loadingMore, sentinelRef }) {
  if (loading && (!videos || videos.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading videos...</p>
      </div>
    );
  }

  if (!loading && (!videos || videos.length === 0)) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {emptyMessage || 'No videos found.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((video) => (
          <VideoCard
            key={video.id?.videoId || video.id}
            video={video}
          />
        ))}
        
        {/* Skeleton cards while loading more */}
        {loadingMore && (
          <>
            <VideoCardSkeleton />
            <VideoCardSkeleton />
            <VideoCardSkeleton />
            <VideoCardSkeleton />
          </>
        )}
      </div>
      
      {/* Infinite scroll sentinel */}
      {sentinelRef && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

export default VideoList;
