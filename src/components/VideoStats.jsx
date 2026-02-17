import { useState } from 'react';
import { Eye, ThumbsUp, MessageCircle, Clock, User, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

function VideoStats({ video }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!video) return null;

  const { snippet, statistics } = video;

  const formatCount = (count) => {
    if (!count) return '0';
    return parseInt(count).toLocaleString();
  };

  const formatCompact = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const calculateEngagementRate = () => {
    const views = parseInt(statistics?.viewCount || 0);
    const likes = parseInt(statistics?.likeCount || 0);
    if (views === 0) return 0;
    return ((likes / views) * 100).toFixed(2);
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = match[1] ? `${match[1]}h ` : '';
    const minutes = match[2] ? `${match[2]}m ` : '';
    const seconds = match[3] ? `${match[3]}s` : '';
    return `${hours}${minutes}${seconds}`.trim();
  };

  const engagementRate = calculateEngagementRate();

  const stats = [
    {
      icon: Eye,
      label: 'Views',
      value: formatCount(statistics?.viewCount),
      compact: formatCompact(statistics?.viewCount),
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    },
    {
      icon: ThumbsUp,
      label: 'Likes',
      value: formatCount(statistics?.likeCount),
      compact: formatCompact(statistics?.likeCount),
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
      hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900',
    },
    {
      icon: MessageCircle,
      label: 'Comments',
      value: formatCount(statistics?.commentCount),
      compact: formatCompact(statistics?.commentCount),
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    },
    {
      icon: TrendingUp,
      label: 'Engagement',
      value: `${engagementRate}%`,
      compact: `${engagementRate}%`,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
      hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900',
    },
  ];

  const description = snippet?.description || '';
  const shouldShowExpandButton = description.length > 200;

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Thumbnail */}
        <div className="lg:w-96 shrink-0">
          <img
            src={
              snippet?.thumbnails?.maxres?.url ||
              snippet?.thumbnails?.high?.url ||
              snippet?.thumbnails?.medium?.url
            }
            alt={snippet?.title}
            className="w-full rounded-lg aspect-video object-cover shadow-md"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {snippet?.title}
          </h1>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {snippet?.channelTitle}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {snippet?.publishedAt
                ? new Date(snippet.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} ${stat.hoverBg} rounded-lg p-3 text-center transition-all duration-200 cursor-default transform hover:scale-105 hover:shadow-md`}
                title={`${stat.label}: ${stat.value}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.compact}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {description && (
            <div className="relative">
              <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-all duration-300 ${
                isDescriptionExpanded ? '' : 'line-clamp-3'
              }`}>
                {description}
              </p>
              {shouldShowExpandButton && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoStats;
