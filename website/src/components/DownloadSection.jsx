import React from 'react';

export default function DownloadSection() {
  return (
    <section id="download" className="section download-section">
      <div className="container">
        <div className="download-card glass-card">
          <div className="download-header-col">
            <div className="badge">
              <span>🤖 Official Android Release</span>
            </div>

            <h2 className="download-title">
              Get ExpenseTracker for <span className="gradient-text">Android</span>
            </h2>

            <p className="download-subtitle">
              Enjoy 100% private, fast, and feature-packed expense tracking on your smartphone. No cloud servers, no forced logins.
            </p>

            <div className="download-actions">
              <a 
                href="/apk/expense_tracker.apk" 
                download="expense_tracker.apk"
                type="application/vnd.android.package-archive"
                className="btn btn-primary download-btn pulse-glow"
              >
                <span className="dl-icon">📥</span>
                <div className="dl-btn-text">
                  <span className="dl-main">Download Android APK</span>
                  <span className="dl-sub">Version 1.0.0 • Direct APK File (68.5 MB)</span>
                </div>
              </a>
            </div>

            <div className="apk-specs">
              <span className="spec-tag">📱 Android 7.0+</span>
              <span className="spec-tag">🔒 100% Offline</span>
              <span className="spec-tag">⚡ Direct APK File</span>
              <span className="spec-tag">🛡️ Verified Safe</span>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="download-instructions-col">
            <h3 className="instructions-title">Quick Installation Guide</h3>

            <div className="step-list">
              <div className="step-item">
                <span className="step-number">1</span>
                <div>
                  <strong>Download APK File</strong>
                  <p>Tap the download button above to save <code>expense-tracker.apk</code> onto your phone.</p>
                </div>
              </div>

              <div className="step-item">
                <span className="step-number">2</span>
                <div>
                  <strong>Allow Unknown Sources</strong>
                  <p>Open Android Settings → Security / Privacy → Enable "Install Unknown Apps".</p>
                </div>
              </div>

              <div className="step-item">
                <span className="step-number">3</span>
                <div>
                  <strong>Install & Launch</strong>
                  <p>Tap the downloaded APK in your Downloads manager to install and open the app!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .download-section {
          padding: 4.5rem 0;
          background: linear-gradient(180deg, transparent 0%, var(--accent-light) 100%);
          width: 100%;
          overflow-x: hidden;
        }

        .download-card {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
          padding: 2.75rem;
          border: 1px solid rgba(99, 102, 241, 0.3);
          position: relative;
          width: 100%;
        }

        .download-title {
          font-size: 2.35rem;
          font-weight: 800;
          margin-bottom: 0.85rem;
          line-height: 1.2;
        }

        .download-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 1.75rem;
          line-height: 1.55;
        }

        .download-actions {
          margin-bottom: 1.75rem;
        }

        .download-btn {
          padding: 0.9rem 1.75rem;
          gap: 0.85rem;
          text-align: left;
          width: 100%;
          justify-content: center;
        }

        .dl-icon {
          font-size: 1.8rem;
          line-height: 1;
        }

        .dl-btn-text {
          display: flex;
          flex-direction: column;
        }

        .dl-main {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .dl-sub {
          font-size: 0.725rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .apk-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .spec-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .instructions-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          color: var(--text-main);
        }

        .step-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.85rem;
        }

        .step-item strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .step-item p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .step-item code {
          background: var(--bg-tertiary);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          color: var(--accent-primary);
          font-family: monospace;
        }

        @media (max-width: 850px) {
          .download-card {
            grid-template-columns: 1fr;
            padding: 1.5rem 1.15rem;
            gap: 2rem;
          }
          .download-title {
            font-size: 1.85rem;
          }
        }
      `}</style>
    </section>
  );
}
