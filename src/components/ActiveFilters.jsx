import { X, Filter } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';

function ActiveFilters() {
  const { filters, removeFilter, clearFilters, hasActiveFilters, stats } = useFilter();

  if (!hasActiveFilters) {
    return null;
  }

  const getFilterBadges = () => {
    const badges = [];

    // Sentiment filters
    filters.sentiment.forEach(sentiment => {
      badges.push({
        type: 'sentiment',
        value: sentiment,
        label: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        color: sentiment === 'positive' 
          ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
          : sentiment === 'negative'
          ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
          : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
      });
    });

    // Word filters
    filters.words.forEach(word => {
      badges.push({
        type: 'words',
        value: word,
        label: `Word: "${word}"`,
        color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      });
    });

    // Entity filters
    filters.entities.forEach(entity => {
      badges.push({
        type: 'entities',
        value: entity,
        label: `Entity: "${entity}"`,
        color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
      });
    });

    // Tag filters
    filters.tags.forEach(tag => {
      badges.push({
        type: 'tags',
        value: tag,
        label: `Tag: "${tag}"`,
        color: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
      });
    });

    // Score range filter
    if (filters.scoreRange) {
      badges.push({
        type: 'scoreRange',
        value: filters.scoreRange,
        label: `Score: ${filters.scoreRange.min} to ${filters.scoreRange.max}`,
        color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      });
    }

    return badges;
  };

  const badges = getFilterBadges();

  return (
    <div className="card mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Active Filters
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {stats.filtered} of {stats.total} comments
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={`${badge.type}-${badge.value}-${index}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${badge.color}`}
              >
                {badge.label}
                <button
                  onClick={() => removeFilter(badge.type, badge.value)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${badge.label} filter`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

export default ActiveFilters;
