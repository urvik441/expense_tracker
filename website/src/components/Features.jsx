import React from 'react';

const FEATURES_DATA = [
  {
    icon: '📊',
    title: 'Smart Monthly Budgets',
    description: 'Set an overall monthly spending ceiling along with individual category budgets (Food, Rent, Fuel, Groceries) with progress alerts.',
    tag: 'Budgeting'
  },
  {
    icon: '📅',
    title: 'Year, Month & Calendar Views',
    description: 'Browse expenses hierarchically from Year summary to Month cards down to daily breakdown with color-coded calendar dates.',
    tag: 'Navigation'
  },
  {
    icon: '🔄',
    title: 'Subscription Manager',
    description: 'Track recurring monthly/weekly bills like Netflix, WiFi, or Rent. The app automatically calculates due dates and generates expense records.',
    tag: 'Automation'
  },
  {
    icon: '👥',
    title: 'Bill Split Calculator',
    description: 'Easily calculate per-person expenses when dining out with friends. Supports custom tip percentages and individual breakdown.',
    tag: 'Utility'
  },
  {
    icon: '🎯',
    title: 'Savings Goals & Wishlists',
    description: 'Create financial goals (Emergency Fund, Vacation) and maintain wishlists for upcoming big-ticket purchases.',
    tag: 'Planning'
  },
  {
    icon: '📈',
    title: 'PDF & CSV Reports Export',
    description: 'Generate high-resolution printable PDF analytical reports or export CSV/JSON data for Excel & accounting software.',
    tag: 'Analytics'
  },
  {
    icon: '🔒',
    title: 'PIN Lock & 100% Offline Privacy',
    description: 'Your financial data never leaves your device. Protect your entries with passcode security lock and full local AsyncStorage data storage.',
    tag: 'Security'
  },
  {
    icon: '🎨',
    title: 'Custom Categories & Currencies',
    description: 'Create custom spending categories with unique emoji icons. Full support for INR (₹), USD ($), EUR (€), GBP (£), and AED.',
    tag: 'Customization'
  }
];

export default function Features() {
  return (
    <section id="features" className="section features-section">
      <div className="container">
        <div className="section-header">
          <div className="badge">
            <span>⚡ Everything You Need</span>
          </div>
          <h2 className="section-title">
            Packed with Powerful <span className="gradient-text">Financial Tools</span>
          </h2>
          <p className="section-description">
            Designed to replace clunky spreadsheets with a fast, intuitive, and modern experience on your Android smartphone.
          </p>
        </div>

        <div className="grid-4 features-grid">
          {FEATURES_DATA.map((feat, index) => (
            <div key={index} className="glass-card feature-card">
              <div className="feature-card-header">
                <span className="feature-icon">{feat.icon}</span>
                <span className="feature-tag">{feat.tag}</span>
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-description">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .features-section {
          background: var(--bg-glass);
          position: relative;
        }

        .features-grid {
          gap: 1.5rem;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }

        .feature-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 1.25rem;
        }

        .feature-icon {
          font-size: 2.2rem;
          line-height: 1;
        }

        .feature-tag {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          border-radius: var(--radius-sm);
        }

        .feature-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.65rem;
          color: var(--text-main);
        }

        .feature-description {
          font-size: 0.925rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </section>
  );
}
