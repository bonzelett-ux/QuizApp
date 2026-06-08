import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import ThemeSwitcher from '../components/ThemeSwitcher';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ThemeSwitcher />
          <button onClick={logout} className="logout-btn">
            Log Out
          </button>
        </div>
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
            <span>Number of questions (5 - 20)</span>
            <input
              type="number"
              min="5"
              max="20"
              value={questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setQuestionCount(isNaN(val) ? '' : val);
              }}
              style={{
                width: '60px',
                padding: '0.2rem',
                borderRadius: '4px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-dark)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            />
          </div>
          <input
            type="range"
            min="5"
            max="20"
            value={typeof questionCount === 'number' ? questionCount : 10}
            onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
            className="slider"
          />
          {(questionCount < 5 || questionCount > 20 || questionCount === '') && (
            <span style={{ color: 'var(--error)', fontSize: '0.85rem' }}>
              ⚠ Question count must be a number between 5 and 20.
            </span>
          )}
        </div>
      </section>

      <button
        onClick={handlePlay}
        disabled={!selectedCategory || questionCount < 5 || questionCount > 20 || questionCount === ''}
        className="play-btn"
      >
        {!selectedCategory 
          ? 'Select a Category to Start' 
          : (questionCount < 5 || questionCount > 20 || questionCount === '')
            ? 'Fix Question Count'
            : `Play ${selectedCategory.name} Quiz`
        }
      </button>
    </div>
  );
};

export default HomePage;
