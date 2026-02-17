import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ThumbsUp, MessageCircle, Trash2, Database, Clock } from 'lucide-react';

function HistoryVideoCard({ videoEntry, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { id: videoId, data: video, timestamp } = videoEntry;
  const { snippet, statistics } = video;

  const formatCount = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getTimeAgo = (timestamp) => {
    const ageMs = Date.now() - timestamp;
    const ageMinutes = Math.floor(ageMs / (60 * 1000));
    const ageHours = Math.floor(ageMs / (60 * 60 * 1000));
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

    if (ageDays > 0) return `${ageDays}d ago`;
    if (ageHours > 0) return `${ageHours}h ago`;
    if (ageMinutes > 0) return `${ageMinutes}m ago`;
    return 'just now';
  };

  const handleClick = () => {
    navigate(`/analytics/${videoId}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${snippet?.title}" from history?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
        <img
          src={snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url}
          alt={snippet?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded shadow-lg">
            <Database className="w-3 h-3" />
            Cached
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {snippet?.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
          {snippet?.channelTitle}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(statistics?.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            {formatCount(statistics?.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {formatCount(statistics?.commentCount)}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Analyzed {getTimeAgo(timestamp)}
          </span>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
            title="Delete from history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryVideoCard;
