import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SmilePlus, Frown, Meh } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';

const COLORS = {
  positive: '#22c55e',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {data.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.value} comments
        </p>
      </div>
    );
  }
  return null;
};

function SentimentChart({ summary, results }) {
  const { addFilter } = useFilter();
  
  if (!summary) return null;

  const handleSentimentClick = (sentiment) => {
    addFilter('sentiment', sentiment.toLowerCase());
  };

  const pieData = [
    { name: 'Positive', value: summary.positive, color: COLORS.positive },
    { name: 'Neutral', value: summary.neutral, color: COLORS.neutral },
    { name: 'Negative', value: summary.negative, color: COLORS.negative },
  ];

  // Score distribution for bar chart
  const scoreRanges = [
    { range: '< -5', min: -Infinity, max: -5 },
    { range: '-5 to -3', min: -5, max: -3 },
    { range: '-2 to -1', min: -2, max: -1 },
    { range: '0', min: 0, max: 0 },
    { range: '1 to 2', min: 1, max: 2 },
    { range: '3 to 5', min: 3, max: 5 },
    { range: '> 5', min: 5, max: Infinity },
  ];

  const barData = scoreRanges.map((range) => ({
    range: range.range,
    count: results.filter((r) => {
      if (range.min === -Infinity) return r.score < range.max;
      if (range.max === Infinity) return r.score > range.min;
      return r.score >= range.min && r.score <= range.max;
    }).length,
  }));

  const positivePercent = summary.total > 0 ? ((summary.positive / summary.total) * 100).toFixed(1) : 0;
  const neutralPercent = summary.total > 0 ? ((summary.neutral / summary.total) * 100).toFixed(1) : 0;
  const negativePercent = summary.total > 0 ? ((summary.negative / summary.total) * 100).toFixed(1) : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sentiment Analysis</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div 
          onClick={() => handleSentimentClick('positive')}
          className="bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 hover:shadow-md cursor-pointer"
        >
          <SmilePlus className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{positivePercent}%</p>
          <p className="text-xs text-green-600 dark:text-green-500">Positive ({summary.positive})</p>
          <div className="mt-2 bg-green-200 dark:bg-green-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-green-600 dark:bg-green-400 h-full transition-all duration-1000 ease-out"
              style={{ width: `${positivePercent}%` }}
            />
          </div>
        </div>
        <div 
          onClick={() => handleSentimentClick('neutral')}
          className="bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 hover:shadow-md cursor-pointer"
        >
          <Meh className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{neutralPercent}%</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Neutral ({summary.neutral})</p>
          <div className="mt-2 bg-amber-200 dark:bg-amber-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-600 dark:bg-amber-400 h-full transition-all duration-1000 ease-out"
              style={{ width: `${neutralPercent}%` }}
            />
          </div>
        </div>
        <div 
          onClick={() => handleSentimentClick('negative')}
          className="bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 hover:shadow-md cursor-pointer"
        >
          <Frown className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{negativePercent}%</p>
          <p className="text-xs text-red-600 dark:text-red-500">Negative ({summary.negative})</p>
          <div className="mt-2 bg-red-200 dark:bg-red-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-red-600 dark:bg-red-400 h-full transition-all duration-1000 ease-out"
              style={{ width: `${negativePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sentiment Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                onClick={(data) => handleSentimentClick(data.name)}
                style={{ cursor: 'pointer' }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Score Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Score: {payload[0].payload.range}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payload[0].value} comments
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      index < 3
                        ? COLORS.negative
                        : index === 3
                        ? COLORS.neutral
                        : COLORS.positive
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Score */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Average Sentiment Score:{' '}
          <span
            className={`font-bold ${
              summary.averageScore > 0
                ? 'text-green-600'
                : summary.averageScore < 0
                ? 'text-red-600'
                : 'text-amber-600'
            }`}
          >
            {summary.averageScore.toFixed(2)}
          </span>
          <span className="text-gray-400 dark:text-gray-500 ml-1">
            (based on {summary.total} comments)
          </span>
        </p>
      </div>
    </div>
  );
}

export default SentimentChart;
