import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome to the Trivia App, {user?.email}!</h1>
      <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>You are authenticated.</p>
      <button 
        onClick={logout}
        style={{
          padding: '0.8rem 1.5rem',
          background: 'var(--error)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '1.5rem'
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default HomePage;
