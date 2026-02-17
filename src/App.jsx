import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import History from './pages/History';

function App() {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (query, categoryId = '', order = 'relevance') => {
    navigate('/', { state: { query, categoryId, order } });
  };

  return (
    <Layout darkMode={darkMode} toggleTheme={toggleTheme} onSearch={handleSearch}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics/:videoId" element={<Analytics />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Layout>
  );
}

export default App;
