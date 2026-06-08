import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './Quiz.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { categoryId, categoryName, count, result } = location.state || {};
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (!result || !categoryId) return;

    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/quiz/results');
        // Filter results for the same category
        const categoryHistory = response.data.filter(
          (item) => item.category_id === categoryId
        );
        setHistory(categoryHistory);
      } catch (err) {
        console.error('Error fetching history:', err);
        setHistoryError('Could not load historical results.');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [categoryId, result]);

  if (!result) {
    return (
      <div className="quiz-container">
        <div className="quiz-card" style={{ textAlign: 'center' }}>
          <h2>No Results Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
            It looks like you haven't completed a quiz recently.
          </p>
          <button onClick={() => navigate('/')} className="next-btn" style={{ alignSelf: 'center' }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { correctCount, totalQuestions, scorePercent } = result;
  const incorrectCount = totalQuestions - correctCount;

  // Analysis of history
  // Since the current result is already saved in the database when submitted,
  // it will be present in the fetched history (usually the first one since it's ORDER BY played_at DESC).
  const otherAttempts = history.filter((h) => h.id !== result.id);
  const isFirstAttempt = otherAttempts.length === 0;

  let personalBest = false;
  let previousBest = 0;
  let previousAverage = 0;

  if (!isFirstAttempt) {
    previousBest = Math.max(...otherAttempts.map((h) => parseFloat(h.score_percent)));
    const sum = otherAttempts.reduce((acc, curr) => acc + parseFloat(curr.score_percent), 0);
    previousAverage = parseFloat((sum / otherAttempts.length).toFixed(1));
    if (scorePercent > previousBest) {
      personalBest = true;
    }
  } else {
    personalBest = true; // First attempt is always personal best
  }

  const handlePlayAgain = () => {
    navigate('/quiz', {
      state: {
        categoryId,
        categoryName,
        count,
      },
    });
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <span className="category-tag" style={{ alignSelf: 'center' }}>{categoryName}</span>
        
        <h1 style={{ textAlign: 'center', marginTop: '0.5rem' }}>Quiz Completed!</h1>
        
        <div className="score-summary-box">
          <div className="score-radial">
            <span className="score-number">{scorePercent}%</span>
            <span className="score-label">Score</span>
          </div>

          <div className="stats-breakdown">
            <div className="stat-item correct-stat">
              <span className="stat-badge">✔</span>
              <div className="stat-text-group">
                <span className="stat-val">{correctCount}</span>
                <span className="stat-lbl">Correct</span>
              </div>
            </div>
            <div className="stat-item incorrect-stat">
              <span className="stat-badge">✘</span>
              <div className="stat-text-group">
                <span className="stat-val">{incorrectCount}</span>
                <span className="stat-lbl">Incorrect</span>
              </div>
            </div>
          </div>
        </div>

        {personalBest && (
          <div className="personal-best-banner">
            🎉 <span><strong>New Personal Best!</strong> Outstanding performance!</span>
          </div>
        )}

        <hr className="divider" />

        <div className="history-section">
          <h3>Category Insights</h3>
          {historyLoading ? (
            <div className="history-skeleton">
              <div className="skeleton-line" style={{ width: '80%', height: '20px' }}></div>
              <div className="skeleton-line" style={{ width: '100%', height: '50px' }}></div>
            </div>
          ) : historyError ? (
            <p className="error-text">{historyError}</p>
          ) : (
            <>
              {!isFirstAttempt && (
                <div className="comparison-grid">
                  <div className="comparison-card">
                    <span className="comp-label">Previous Best</span>
                    <span className="comp-value">{previousBest}%</span>
                  </div>
                  <div className="comparison-card">
                    <span className="comp-label">Previous Average</span>
                    <span className="comp-value">{previousAverage}%</span>
                  </div>
                  <div className="comparison-card">
                    <span className="comp-label">Total Attempts</span>
                    <span className="comp-value">{history.length}</span>
                  </div>
                </div>
              )}

              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Attempt History
              </h4>
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Correct / Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((attempt) => (
                      <tr key={attempt.id} className={attempt.id === result.id ? 'current-attempt-row' : ''}>
                        <td>
                          {formatDate(attempt.played_at)}
                          {attempt.id === result.id && <span className="current-indicator">Current</span>}
                        </td>
                        <td className="score-td">{attempt.score_percent}%</td>
                        <td>{attempt.correct_count} / {attempt.total_questions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="results-actions">
          <button 
            onClick={handlePlayAgain} 
            className="play-btn"
            style={{ flex: 1 }}
          >
            Play Again (same settings)
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="next-btn"
            style={{ flex: 1 }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
