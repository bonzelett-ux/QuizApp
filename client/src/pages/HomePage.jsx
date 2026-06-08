import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import './Quiz.css';

const categoryEmojis = {
  history: '🏛️',
  science: '🔬',
  geography: '🌍',
  sports: '⚽',
  movies: '🎬',
  music: '🎵',
  technology: '💻',
  literature: '📚',
  art: '🎨',
  food: '🍕',
  default: '❓'
};

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        // The API returns the raw categories list or wrapped in data.
        // Let's handle both.
        const data = Array.isArray(response.data) ? response.data : response.data.categories || [];
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories. Please try reloading.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handlePlay = () => {
    if (!selectedCategory) return;
    navigate('/quiz', {
      state: {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        count: questionCount,
      }
    });
  };

  const getEmoji = (name) => {
    const key = name.toLowerCase();
    return categoryEmojis[key] || categoryEmojis.default;
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="user-badge">
          <span className="user-welcome">Logged in as</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Log Out
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="setup-section">
        <h2 className="setup-title">1. Choose a Category</h2>
        
        {loading ? (
          <div className="categories-grid skeleton-card">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="category-card" style={{ opacity: 0.5 }}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
                <span className="category-name">Loading...</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`category-card ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span style={{ fontSize: '2rem' }}>{getEmoji(cat.name)}</span>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="setup-section">
        <h2 className="setup-title">2. Select Question Count</h2>
        <div className="count-selector">
          <div className="count-header">
            <span>Number of questions</span>
            <span className="count-display">{questionCount}</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
            className="slider"
          />
        </div>
      </section>

      <button
        onClick={handlePlay}
        disabled={!selectedCategory}
        className="play-btn"
      >
        {selectedCategory ? `Play ${selectedCategory.name} Quiz` : 'Select a Category to Start'}
      </button>
    </div>
  );
};

export default HomePage;
