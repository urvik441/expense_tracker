import React, { useState } from 'react';

const SCREEN_TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'calendar', label: '📅 Calendar View' },
  { id: 'reports', label: '📈 PDF Reports' },
  { id: 'subscriptions', label: '🔄 Subscriptions' },
  { id: 'billsplit', label: '👥 Bill Splitter' },
];

export default function AppPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <section id="preview" className="section preview-section">
      <div className="container">
        <div className="section-header">
          <div className="badge">
            <span>📱 Interface Gallery</span>
          </div>
          <h2 className="section-title">
            Designed for Speed & <span className="gradient-text">Clarity</span>
          </h2>
          <p className="section-description">
            Explore the clean, intuitive screens crafted with native React Native performance.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="tab-buttons-container">
          {SCREEN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Screen Showcase Stage */}
        <div className="showcase-stage glass-card">
          <div className="showcase-content">
            {activeTab === 'dashboard' && (
              <div className="preview-screen-view">
                <div className="screen-header-bar">
                  <h4>Dashboard Overview</h4>
                  <span className="screen-badge">Active Screen</span>
                </div>
                <div className="mockup-ui-wrapper">
                  <div className="ui-hero-card">
                    <div className="ui-row">
                      <span>August Budget</span>
                      <span className="ui-bold">₹30,000</span>
                    </div>
                    <div className="ui-big-amount">₹18,450 spent</div>
                    <div className="mockup-progress-bar">
                      <div className="mockup-progress-fill" style={{ width: '61.5%' }}></div>
                    </div>
                  </div>

                  <div className="ui-grid-4">
                    <div className="ui-action-box">➕ Add</div>
                    <div className="ui-action-box">📊 Budget</div>
                    <div className="ui-action-box">🎯 Goal</div>
                    <div className="ui-action-box">👥 Split</div>
                  </div>

                  <div className="ui-list">
                    <h5>Recent Transactions</h5>
                    <div className="ui-list-row"><span>🍔 Lunch Buffet</span><strong className="danger">-₹650</strong></div>
                    <div className="ui-list-row"><span>⛽ Petrol Fillup</span><strong className="danger">-₹1,200</strong></div>
                    <div className="ui-list-row"><span>🎬 Netflix Subscription</span><strong className="danger">-₹499</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="preview-screen-view">
                <div className="screen-header-bar">
                  <h4>Calendar & Date Browsing</h4>
                  <span className="screen-badge">Interactive Grid</span>
                </div>
                <div className="mockup-ui-wrapper">
                  <div className="calendar-grid-mockup">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <span key={i} className="cal-day-head">{d}</span>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <div key={date} className={`cal-date-cell ${[5, 12, 18, 24].includes(date) ? 'has-expense' : ''}`}>
                        <span className="date-num">{date}</span>
                        {[5, 12, 18, 24].includes(date) && <span className="date-amt">₹{date * 250}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="preview-screen-view">
                <div className="screen-header-bar">
                  <h4>Analytics & PDF Reports</h4>
                  <span className="screen-badge">Export Ready</span>
                </div>
                <div className="mockup-ui-wrapper">
                  <div className="chart-preview-box">
                    <div className="chart-bar-group">
                      <div className="chart-bar" style={{ height: '70%' }}><span className="bar-label">Food</span></div>
                      <div className="chart-bar" style={{ height: '40%' }}><span className="bar-label">Fuel</span></div>
                      <div className="chart-bar" style={{ height: '85%' }}><span className="bar-label">Rent</span></div>
                      <div className="chart-bar" style={{ height: '30%' }}><span className="bar-label">Bills</span></div>
                      <div className="chart-bar" style={{ height: '55%' }}><span className="bar-label">Shop</span></div>
                    </div>
                  </div>
                  <div className="ui-export-row">
                    <button className="btn btn-primary">📄 Export PDF</button>
                    <button className="btn btn-secondary">📊 Export CSV</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="preview-screen-view">
                <div className="screen-header-bar">
                  <h4>Recurring Subscriptions</h4>
                  <span className="screen-badge">Auto Billing</span>
                </div>
                <div className="mockup-ui-wrapper">
                  <div className="sub-item-card">
                    <div className="sub-header">
                      <span>🎬 Netflix Premium</span>
                      <span className="sub-badge">Monthly</span>
                    </div>
                    <div className="sub-meta">Next Due: Aug 18 • ₹649/mo</div>
                  </div>

                  <div className="sub-item-card">
                    <div className="sub-header">
                      <span>📶 Broadband Fiber</span>
                      <span className="sub-badge">Monthly</span>
                    </div>
                    <div className="sub-meta">Next Due: Aug 25 • ₹999/mo</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billsplit' && (
              <div className="preview-screen-view">
                <div className="screen-header-bar">
                  <h4>Bill Split Calculator</h4>
                  <span className="screen-badge">Group Calculator</span>
                </div>
                <div className="mockup-ui-wrapper">
                  <div className="split-calc-card">
                    <div className="calc-result-box">
                      <span>Each Person Pays</span>
                      <div className="per-person-amt">₹625.00</div>
                      <span className="calc-sub">Total: ₹2,500 (4 people + 10% Tip)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .preview-section {
          padding: 4rem 0;
          width: 100%;
          overflow-x: hidden;
        }

        .tab-buttons-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .tab-btn {
          padding: 0.6rem 1.15rem;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .tab-btn.active {
          background: var(--accent-gradient);
          color: #ffffff;
          border-color: transparent;
          box-shadow: var(--shadow-glow);
        }

        .showcase-stage {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.75rem;
          min-height: 400px;
          width: 100%;
        }

        .screen-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
        }

        .screen-header-bar h4 {
          font-size: 1.1rem;
          color: var(--text-main);
        }

        .screen-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: var(--accent-light);
          color: var(--accent-primary);
          border-radius: var(--radius-sm);
          font-weight: 700;
        }

        .mockup-ui-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .ui-hero-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .ui-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .ui-bold { font-weight: 700; color: var(--text-main); }
        .ui-big-amount { font-size: 1.5rem; font-weight: 800; margin: 0.4rem 0; color: var(--text-main); }

        .ui-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .ui-action-box {
          background: var(--accent-light);
          color: var(--accent-primary);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.6rem 0.25rem;
          text-align: center;
          border-radius: var(--radius-md);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .ui-list h5 {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .ui-list-row {
          display: flex;
          justify-content: space-between;
          padding: 0.55rem 0.75rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 0.35rem;
          font-size: 0.85rem;
        }

        .danger { color: var(--danger); }

        .calendar-grid-mockup {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          text-align: center;
        }

        .cal-day-head {
          font-weight: 700;
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-bottom: 0.25rem;
        }

        .cal-date-cell {
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.1rem;
          min-height: 42px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .cal-date-cell.has-expense {
          background: var(--accent-light);
          border: 1px solid var(--accent-primary);
        }

        .date-amt {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .chart-preview-box {
          height: 160px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .chart-bar-group {
          display: flex;
          align-items: flex-end;
          gap: 0.85rem;
          height: 100%;
          width: 90%;
        }

        .chart-bar {
          flex: 1;
          background: var(--accent-gradient);
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          position: relative;
        }

        .bar-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .ui-export-row {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .sub-item-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
        }

        .sub-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .sub-badge {
          background: var(--success-bg);
          color: var(--success);
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .sub-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }

        .split-calc-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 1.5rem 1rem;
          text-align: center;
        }

        .per-person-amt {
          font-size: 2rem;
          font-weight: 800;
          color: var(--success);
          margin: 0.4rem 0;
        }

        .calc-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 600px) {
          .showcase-stage {
            padding: 1.25rem 0.85rem;
          }
          .ui-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
