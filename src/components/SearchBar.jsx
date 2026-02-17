import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { extractVideoId } from '../api/youtube';
import { VIDEO_CATEGORIES, SORT_OPTIONS } from '../constants/categories';
import { useLocalStorage } from '../hooks/useLocalStorage';

const selectClass =
  'text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none';

function SearchBar({ onSearch, compact = false }) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useLocalStorage('yt-search-category', '');
  const [sortOrder, setSortOrder] = useLocalStorage('yt-search-sort', 'relevance');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const videoId = extractVideoId(trimmedInput);
    if (videoId) {
      navigate(`/analytics/${videoId}`);
    } else {
      onSearch(trimmedInput, category, sortOrder);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search videos or paste YouTube URL..."
            className="w-full px-4 pl-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none"
          />
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap px-4 py-2 text-sm">
          Search
        </button>
      </form>
    );
  }

  return (
    <div className="card mb-8">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search videos or paste YouTube URL..."
            className="input-field pl-11"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((f) => !f)}
          className={`p-3 rounded-lg border transition-colors ${
            showFilters
              ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-600'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          title="Toggle filters"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Search
        </button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={selectClass}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {(category || sortOrder !== 'relevance') && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setCategory('');
                  setSortOrder('relevance');
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline py-2"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
