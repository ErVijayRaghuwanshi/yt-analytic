import { useState, useMemo } from 'react';
import { Tag, Users, MapPin, Building2 } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';

const CATEGORY_CONFIG = {
  people: {
    icon: Users,
    label: 'People',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  places: {
    icon: MapPin,
    label: 'Places',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900',
    border: 'border-green-200 dark:border-green-800',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  organizations: {
    icon: Building2,
    label: 'Organizations',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
};

function EntityCloud({ entities }) {
  const [activeCategory, setActiveCategory] = useState('people');
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const { addFilter } = useFilter();

  const handleEntityClick = (entityName) => {
    addFilter('entities', entityName);
  };

  const totalEntities = useMemo(() => {
    return (
      entities.people.length +
      entities.places.length +
      entities.organizations.length
    );
  }, [entities]);

  const maxCount = useMemo(() => {
    const currentEntities = entities[activeCategory] || [];
    if (currentEntities.length === 0) return 1;
    return Math.max(...currentEntities.map((e) => e.count));
  }, [entities, activeCategory]);

  const getFontSize = (count) => {
    const minSize = 14;
    const maxSize = 36;
    const ratio = count / maxCount;
    return Math.round(minSize + ratio * (maxSize - minSize));
  };

  const getOpacity = (count) => {
    const ratio = count / maxCount;
    return 0.7 + ratio * 0.3;
  };

  if (totalEntities === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Named Entities</h3>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          No named entities found in comments.
        </p>
      </div>
    );
  }

  const currentEntities = entities[activeCategory] || [];
  const config = CATEGORY_CONFIG[activeCategory];
  const Icon = config.icon;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Named Entities</h3>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {totalEntities} entities found
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
          const CategoryIcon = cat.icon;
          const count = entities[key].length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                activeCategory === key
                  ? 'bg-white dark:bg-gray-700 shadow-sm ' + cat.color
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <CategoryIcon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className="text-xs opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Entity Display */}
      {currentEntities.length > 0 ? (
        <div className="min-h-[250px] max-h-[350px] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-2">
            {currentEntities.map((entity, index) => {
              const isHovered = hoveredEntity === entity.name;
              return (
                <span
                  key={entity.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-300 select-none ${config.bg} ${config.border} ${config.hoverBg}`}
                  onMouseEnter={() => setHoveredEntity(entity.name)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onClick={() => handleEntityClick(entity.name)}
                  style={{
                    fontSize: `${getFontSize(entity.count)}px`,
                    opacity: getOpacity(entity.count),
                    fontWeight: entity.count > maxCount * 0.5 ? 600 : 500,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isHovered
                      ? `0 0 20px ${config.glow}, 0 4px 6px rgba(0,0,0,0.1)`
                      : 'none',
                    animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                  }}
                  title={`${entity.name}: mentioned ${entity.count} time${entity.count !== 1 ? 's' : ''}`}
                >
                  <Icon className={`w-3 h-3 ${config.color}`} />
                  <span className={config.color}>{entity.name}</span>
                  <span className={`text-xs font-semibold ${config.color} opacity-75`}>
                    {entity.count}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon className={`w-12 h-12 ${config.color} mx-auto mb-2 opacity-50`} />
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No {config.label.toLowerCase()} found
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
        <p>Entities extracted from comments • Size indicates frequency</p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default EntityCloud;
