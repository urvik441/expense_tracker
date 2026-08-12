import React from 'react';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <header className="navbar-container">
      <div className="container navbar-content">
        <a href="#" className="navbar-brand">
          <span className="brand-icon">💰</span>
          <span className="brand-title">Expense<span className="gradient-text">Tracker</span></span>
        </a>

        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#demo">Live Demo</a>
          <a href="#preview">App Screens</a>
          <a href="#download">Download APK</a>
        </nav>

        <div className="navbar-actions">
          <button 
            onClick={toggleTheme} 
            className="btn-icon" 
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <a 
            href="/apk/expense_tracker.apk" 
            download="expense_tracker.apk" 
            type="application/vnd.android.package-archive"
            className="btn btn-primary nav-cta"
          >
            <span>📥 Download APK</span>
          </a>
        </div>
      </div>
      
      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          padding: 0.85rem 0;
          width: 100%;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--text-main);
          white-space: nowrap;
        }

        .brand-icon {
          font-size: 1.4rem;
          line-height: 1;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .navbar-links a {
          transition: color 0.2s ease;
        }

        .navbar-links a:hover {
          color: var(--accent-primary);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .nav-cta {
          padding: 0.55rem 1rem;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        @media (max-width: 820px) {
          .navbar-links {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .brand-title {
            font-size: 1.05rem;
          }
          .nav-cta {
            padding: 0.45rem 0.75rem;
            font-size: 0.78rem;
          }
          .nav-cta span {
            display: inline-block;
          }
        }
      `}</style>
    </header>
  );
}
