import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="brand-icon">💰</span>
              <span className="brand-title">Expense<span className="gradient-text">Tracker</span></span>
            </div>
            <p className="footer-tagline">
              Take complete control of your finances with smart budget limits, subscription tracking, and instant PDF report exports.
            </p>
            <span className="privacy-badge">🔒 100% Offline & Private</span>
          </div>

          <div className="footer-nav-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#features">App Features</a></li>
              <li><a href="#demo">Live Demo</a></li>
              <li><a href="#preview">App Screens</a></li>
              <li><a href="#download">Download APK</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>App Features</h4>
            <ul>
              <li><a href="#features">Monthly Budget Caps</a></li>
              <li><a href="#features">Subscription Auto Billing</a></li>
              <li><a href="#features">Group Bill Splitter</a></li>
              <li><a href="#features">Savings Goals & Wishlist</a></li>
              <li><a href="#features">PDF & CSV Reports</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Security & Privacy</h4>
            <p className="footer-info-text">
              ExpenseTracker operates entirely offline. None of your personal income or expense data is uploaded to remote servers.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ExpenseTracker App. Built for Android.</p>
          <div className="footer-bottom-links">
            <a href="/apk/expense_tracker.apk" download="expense_tracker.apk" type="application/vnd.android.package-archive">Download Android APK</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 4rem 0 2rem 0;
          color: var(--text-secondary);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 1.35rem;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .footer-tagline {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .privacy-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--success);
          background: var(--success-bg);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .footer-nav-col h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.2rem;
        }

        .footer-nav-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-size: 0.9rem;
        }

        .footer-nav-col a {
          transition: color 0.2s ease;
        }

        .footer-nav-col a:hover {
          color: var(--accent-primary);
        }

        .footer-info-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.85rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
