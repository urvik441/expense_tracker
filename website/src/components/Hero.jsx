import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-text-content">
          <div className="badge">
            <span>✨ 100% Offline Android App</span>
          </div>

          <h1 className="hero-title">
            Smart Expense Tracking <br />
            <span className="gradient-text">Built for Daily Life</span>
          </h1>

          <p className="hero-subtitle">
            Effortlessly monitor your monthly spending, set category budgets, split group bills, track recurring subscriptions, and export analytical PDF reports — all stored safely on your device.
          </p>

          <div className="hero-cta-group">
            <a 
              href="/apk/expense_tracker.apk" 
              download="expense_tracker.apk" 
              type="application/vnd.android.package-archive"
              className="btn btn-primary btn-large pulse-glow hero-btn"
            >
              <span>📥 Download APK for Android</span>
              <span className="apk-badge">v1.0.0</span>
            </a>

            <a href="#demo" className="btn btn-secondary btn-large hero-btn">
              <span>🧪 Try Live Web Demo</span>
            </a>
          </div>

          <div className="hero-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🔒</span>
              <div>
                <strong>Zero Cloud Tracking</strong>
                <p>100% local storage & PIN lock</p>
              </div>
            </div>

            <div className="highlight-item">
              <span className="highlight-icon">⚡</span>
              <div>
                <strong>Instant Analytics</strong>
                <p>PDF & CSV spending export</p>
              </div>
            </div>

            <div className="highlight-item">
              <span className="highlight-icon">🔄</span>
              <div>
                <strong>Auto Subscriptions</strong>
                <p>Never miss recurring bills</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Device Mockup Visual */}
        <div className="hero-visual">
          <div className="mobile-mockup floating-animation">
            <div className="mockup-notch"></div>
            
            <div className="mockup-screen">
              {/* App Bar */}
              <div className="mockup-app-bar">
                <span className="mockup-title">Dashboard</span>
                <span className="mockup-search-icon">🔍</span>
              </div>

              {/* Monthly Budget Card */}
              <div className="mockup-budget-card">
                <div className="mockup-budget-header">
                  <span>August Spending</span>
                  <span className="mockup-tag">Budget: ₹30,000</span>
                </div>
                <div className="mockup-budget-amount">₹18,450</div>
                <div className="mockup-progress-bar">
                  <div className="mockup-progress-fill" style={{ width: '61.5%' }}></div>
                </div>
                <div className="mockup-budget-footer">
                  <span>61.5% Used</span>
                  <span>₹11,550 Remaining</span>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="mockup-quick-actions">
                <div className="quick-action-pill">➕ Add</div>
                <div className="quick-action-pill">📊 Budget</div>
                <div className="quick-action-pill">🎯 Goal</div>
                <div className="quick-action-pill">👥 Split</div>
              </div>

              {/* Recent Transactions List */}
              <div className="mockup-section-label">Recent Transactions</div>
              
              <div className="mockup-transaction-list">
                <div className="mockup-item">
                  <div className="mockup-item-left">
                    <span className="mockup-emoji">🍔</span>
                    <div>
                      <strong>Lunch Buffet</strong>
                      <span className="mockup-sub">Food • UPI</span>
                    </div>
                  </div>
                  <span className="mockup-amount danger">-₹650</span>
                </div>

                <div className="mockup-item">
                  <div className="mockup-item-left">
                    <span className="mockup-emoji">⛽</span>
                    <div>
                      <strong>Petrol Fillup</strong>
                      <span className="mockup-sub">Vehicle • Cash</span>
                    </div>
                  </div>
                  <span className="mockup-amount danger">-₹1,200</span>
                </div>

                <div className="mockup-item">
                  <div className="mockup-item-left">
                    <span className="mockup-emoji">🎬</span>
                    <div>
                      <strong>Netflix Renewal</strong>
                      <span className="mockup-sub">Auto Sub • Card</span>
                    </div>
                  </div>
                  <span className="mockup-amount danger">-₹499</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 3.5rem 0 4.5rem 0;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 2.5rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 580px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 0.9rem 1.75rem;
          font-size: 1rem;
        }

        .apk-badge {
          background: rgba(255, 255, 255, 0.25);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .hero-highlights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }

        .highlight-icon {
          font-size: 1.35rem;
          line-height: 1;
        }

        .highlight-item strong {
          display: block;
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .highlight-item p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Mockup Internal Styling */
        .mockup-app-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--accent-primary);
          color: white;
          border-radius: var(--radius-sm);
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .mockup-budget-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .mockup-budget-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .mockup-tag {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .mockup-budget-amount {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0.25rem 0;
        }

        .mockup-budget-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 0.35rem;
        }

        .mockup-quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.35rem;
          margin-bottom: 0.75rem;
        }

        .quick-action-pill {
          background: var(--accent-light);
          color: var(--accent-primary);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.35rem 0.15rem;
          text-align: center;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .mockup-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }

        .mockup-transaction-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mockup-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.5rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }

        .mockup-item-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .mockup-emoji {
          font-size: 1.1rem;
        }

        .mockup-sub {
          display: block;
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        .mockup-amount.danger {
          color: var(--danger);
          font-weight: 700;
          font-size: 0.8rem;
        }

        @media (max-width: 900px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-title {
            font-size: 2.2rem;
          }
          .hero-subtitle {
            margin: 0 auto 1.75rem auto;
          }
          .hero-cta-group {
            justify-content: center;
            flex-direction: column;
            width: 100%;
          }
          .hero-btn {
            width: 100%;
          }
          .hero-highlights {
            grid-template-columns: 1fr;
            text-align: left;
            gap: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.85rem;
          }
          .hero-subtitle {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </section>
  );
}
