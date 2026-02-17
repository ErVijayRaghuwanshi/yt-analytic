import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentPage,
  totalInfo,
  loading,
}) {
  if (!hasPrev && !hasNext) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
      <button
        onClick={onPrev}
        disabled={!hasPrev || loading}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasPrev && !loading
            ? 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        {totalInfo || `Page ${currentPage}`}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext || loading}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasNext && !loading
            ? 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
        }`}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Pagination;
