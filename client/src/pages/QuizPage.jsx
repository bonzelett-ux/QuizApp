import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './Quiz.css';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract configuration from route state
  const state = location.state || {};
  const { categoryId, categoryName, count } = state;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer Effect
  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, submitting, questions.length]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Safely redirect if state is missing
  useEffect(() => {
    if (!categoryId || !count) {
      navigate('/', { replace: true });
    }
  }, [categoryId, count, navigate]);

  useEffect(() => {
    if (!categoryId || !count) return;

    const fetchQuestions = async () => {
      try {
        const response = await apiClient.get(`/questions?categoryId=${categoryId}&count=${count}&_t=${Date.now()}`);
        setQuestions(response.data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId, count]);

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-card skeleton-card">
          <div className="skeleton-line" style={{ width: '40%', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '80px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '45px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '45px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '45px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '45px' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-card" style={{ textAlign: 'center' }}>
          <div className="alert alert-error">{error}</div>
          <button onClick={() => navigate('/')} className="next-btn" style={{ alignSelf: 'center' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No questions found in this category.</p>
          <button onClick={() => navigate('/')} className="next-btn" style={{ alignSelf: 'center', marginTop: '1rem' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentSelected = selectedAnswers[currentQuestion.id];
  const isAnswered = currentSelected !== undefined;

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Submit Quiz
      setSubmitting(true);
      try {
        const answersPayload = Object.entries(selectedAnswers).map(([qId, ans]) => ({
          questionId: parseInt(qId, 10),
          selectedAnswer: ans
        }));

        const response = await apiClient.post('/quiz/submit', {
          categoryId,
          answers: answersPayload,
          durationSeconds: timeElapsed
        });

        // Navigate to results page with response data
        navigate('/results', {
          state: {
            categoryId,
            categoryName,
            count,
            result: response.data,
            // Pass the original selection payload to show summary if desired
            answers: answersPayload
          }
        });
      } catch (err) {
        console.error('Error submitting quiz:', err);
        alert('Failed to submit quiz. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Progress percentage
  const progressPercent = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;

  return (
    <div className="quiz-container">
      {submitting && (
        <div className="overlay-spinner">
          <div className="spinner"></div>
          <h2>Submitting your responses...</h2>
        </div>
      )}

      <div className="quiz-card">
        <div className="quiz-header">
          <div className="quiz-info-row" style={{ marginBottom: '0.5rem' }}>
            <button 
              className="exit-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
                  navigate('/');
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--error)';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.color = '#fca5a5';
              }}
            >
              ← Exit Quiz
            </button>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="category-tag">{categoryName}</span>
              <span className="timer-badge">⏱️ {formatTime(timeElapsed)}</span>
              <span className="question-progress">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="question-text">
          {currentQuestion.question_text}
        </div>

        <div className="options-list">
          {currentQuestion.answers.map((option, idx) => {
            const isCorrectOption = option === currentQuestion.correct_answer;
            const isUserSelection = option === currentSelected;
            
            let btnClass = '';
            if (isAnswered) {
              if (isCorrectOption) {
                btnClass = 'correct';
              } else if (isUserSelection) {
                btnClass = 'selected-incorrect';
              }
            }

            return (
              <button
                key={idx}
                className={`option-btn ${btnClass}`}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="feedback-alert">
            {currentSelected === currentQuestion.correct_answer ? (
              <span className="feedback-correct">✨ Correct! Well done.</span>
            ) : (
              <span className="feedback-incorrect">
                ❌ Incorrect. The correct answer was: <strong>{currentQuestion.correct_answer}</strong>
              </span>
            )}
          </div>
        )}

        {isAnswered && (
          <div className="quiz-footer">
            <button className="next-btn" onClick={handleNext}>
              {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
