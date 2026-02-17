import { useNavigate } from 'react-router-dom';
import { Eye, ThumbsUp, MessageCircle, BarChart3 } from 'lucide-react';

function VideoCard({ video }) {
  const navigate = useNavigate();

  const videoId = video.id?.videoId || video.id;
  const snippet = video.snippet;
  const stats = video.statistics;

  const formatCount = (count) => {
    if (!count) return '—';
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  const handleClick = () => {
    navigate(`/analytics/${videoId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={
            snippet?.thumbnails?.high?.url ||
            snippet?.thumbnails?.medium?.url ||
            snippet?.thumbnails?.default?.url
          }
          alt={snippet?.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Analyze
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {snippet?.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{snippet?.channelTitle}</p>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatCount(stats.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {formatCount(stats.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {formatCount(stats.commentCount)}
            </span>
          </div>
        )}

        {snippet?.publishedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {new Date(snippet.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            <span className="text-gray-300 dark:text-gray-600">·</span>{' '}
            {timeAgo(snippet.publishedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
