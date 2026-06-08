import { useLocation, useNavigate } from 'react-router-dom';
import './Quiz.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { categoryName, count, result } = location.state || {};

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

  return (
    <div className="quiz-container">
      <div className="quiz-card" style={{ textAlign: 'center' }}>
        <span className="category-tag" style={{ alignSelf: 'center' }}>{categoryName}</span>
        
        <h1 style={{ marginTop: '1rem' }}>Quiz Completed!</h1>
        
        <div style={{ margin: '2rem 0' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {scorePercent}%
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
            You got <strong>{correctCount}</strong> out of <strong>{totalQuestions}</strong> questions correct.
          </p>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="next-btn" 
          style={{ alignSelf: 'center', width: '100%' }}
        >
          Play Another Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
