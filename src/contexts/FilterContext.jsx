import { createContext, useContext, useState, useMemo } from 'react';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children, comments }) => {
  const [filters, setFilters] = useState({
    sentiment: [],
    words: [],
    entities: [],
    tags: [],
    scoreRange: null,
  });

  const addFilter = (type, value) => {
    setFilters(prev => {
      if (type === 'scoreRange') {
        return { ...prev, scoreRange: value };
      }
      
      const currentValues = prev[type] || [];
      if (currentValues.includes(value)) {
        return prev; // Already exists
      }
      
      return {
        ...prev,
        [type]: [...currentValues, value],
      };
    });
  };

  const removeFilter = (type, value) => {
    setFilters(prev => {
      if (type === 'scoreRange') {
        return { ...prev, scoreRange: null };
      }
      
      return {
        ...prev,
        [type]: prev[type].filter(v => v !== value),
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      sentiment: [],
      words: [],
      entities: [],
      tags: [],
      scoreRange: null,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.sentiment.length > 0 ||
      filters.words.length > 0 ||
      filters.entities.length > 0 ||
      filters.tags.length > 0 ||
      filters.scoreRange !== null
    );
  }, [filters]);

  const filteredComments = useMemo(() => {
    if (!comments || !hasActiveFilters) {
      return comments || [];
    }

    return comments.filter(comment => {
      // Sentiment filter
      if (filters.sentiment.length > 0) {
        if (!filters.sentiment.includes(comment.label)) {
          return false;
        }
      }

      // Word filter
      if (filters.words.length > 0) {
        const text = comment.text?.toLowerCase() || '';
        const hasWord = filters.words.some(word => 
          text.includes(word.toLowerCase())
        );
        if (!hasWord) return false;
      }

      // Entity filter
      if (filters.entities.length > 0) {
        const text = comment.text?.toLowerCase() || '';
        const hasEntity = filters.entities.some(entity => 
          text.includes(entity.toLowerCase())
        );
        if (!hasEntity) return false;
      }

      // Tag filter
      if (filters.tags.length > 0) {
        const text = comment.text?.toLowerCase() || '';
        const hasTag = filters.tags.some(tag => 
          text.includes(tag.toLowerCase())
        );
        if (!hasTag) return false;
      }

      // Score range filter
      if (filters.scoreRange) {
        const { min, max } = filters.scoreRange;
        if (comment.score < min || comment.score > max) {
          return false;
        }
      }

      return true;
    });
  }, [comments, filters, hasActiveFilters]);

  const stats = useMemo(() => {
    const total = comments?.length || 0;
    const filtered = filteredComments.length;
    const avgScore = filtered > 0
      ? filteredComments.reduce((sum, c) => sum + (c.score || 0), 0) / filtered
      : 0;

    return {
      total,
      filtered,
      avgScore: avgScore.toFixed(2),
    };
  }, [comments, filteredComments]);

  const value = {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    filteredComments,
    stats,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
