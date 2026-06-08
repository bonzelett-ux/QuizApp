import { useState, useEffect } from 'react';

const themes = [
  { id: 'indigo', color: '#6366f1', label: 'Indigo' },
  { id: 'emerald', color: '#10b981', label: 'Emerald' },
  { id: 'crimson', color: '#ef4444', label: 'Crimson' },
  { id: 'cyberpunk', color: '#fbbf24', label: 'Cyberpunk' }
];

const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'indigo';
  });

  useEffect(() => {
    // Clean up other theme classes
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });
    // Add current theme class
    document.body.classList.add(`theme-${activeTheme}`);
    localStorage.setItem('app-theme', activeTheme);
  }, [activeTheme]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        Theme:
      </span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(theme.id)}
            title={theme.label}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: theme.color,
              border: activeTheme === theme.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              boxShadow: activeTheme === theme.id ? `0 0 8px ${theme.color}` : 'none',
              transform: activeTheme === theme.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            aria-label={`Switch to ${theme.label} theme`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
