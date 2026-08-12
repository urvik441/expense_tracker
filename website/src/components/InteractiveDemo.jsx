import React, { useState } from 'react';

export default function InteractiveDemo() {
  const [monthlyBudget, setMonthlyBudget] = useState(25000);
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Weekly Groceries', amount: 3400, category: '🛒 Groceries', method: 'UPI' },
    { id: 2, title: 'Bike Fuel', amount: 850, category: '⛽ Petrol', method: 'Cash' },
    { id: 3, title: 'Internet Broadband', amount: 999, category: '📶 Internet', method: 'Net Banking' },
  ]);

  const [titleInput, setTitleInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('🍔 Food');
  const [methodInput, setMethodInput] = useState('UPI');

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = monthlyBudget - totalSpent;
  const percentage = Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!titleInput || !amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) return;

    const newExpense = {
      id: Date.now(),
      title: titleInput,
      amount: parseFloat(amountInput),
      category: categoryInput,
      method: methodInput,
    };

    setExpenses([newExpense, ...expenses]);
    setTitleInput('');
    setAmountInput('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  return (
    <section id="demo" className="section demo-section">
      <div className="container">
        <div className="section-header">
          <div className="badge">
            <span>🧪 Try It Right Here</span>
          </div>
          <h2 className="section-title">
            Interactive <span className="gradient-text">Live Web Demo</span>
          </h2>
          <p className="section-description">
            Test the core budgeting and expense calculation logic right inside your browser!
          </p>
        </div>

        <div className="demo-grid glass-card">
          {/* Form & Budget Control Column */}
          <div className="demo-control-col">
            <h3 className="demo-col-title">1. Configure Budget & Add Entry</h3>

            <div className="demo-field">
              <label>Monthly Budget Ceiling (₹)</label>
              <input 
                type="number" 
                value={monthlyBudget} 
                onChange={(e) => setMonthlyBudget(Number(e.target.value) || 0)} 
                className="demo-input"
              />
            </div>

            <form onSubmit={handleAddExpense} className="demo-form">
              <div className="demo-field">
                <label>Expense Title / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dinner with Friends" 
                  value={titleInput} 
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="demo-input"
                  required
                />
              </div>

              <div className="demo-row-fields">
                <div className="demo-field">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 750" 
                    value={amountInput} 
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="demo-input"
                    required
                  />
                </div>

                <div className="demo-field">
                  <label>Payment Method</label>
                  <select 
                    value={methodInput} 
                    onChange={(e) => setMethodInput(e.target.value)}
                    className="demo-input"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="demo-field">
                <label>Category</label>
                <select 
                  value={categoryInput} 
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="demo-input"
                >
                  <option value="🍔 Food">🍔 Food</option>
                  <option value="⛽ Petrol">⛽ Petrol</option>
                  <option value="🛒 Groceries">🛒 Groceries</option>
                  <option value="🛍️ Shopping">🛍️ Shopping</option>
                  <option value="🏠 Rent">🏠 Rent</option>
                  <option value="📶 Internet">📶 Internet</option>
                  <option value="🎬 Entertainment">🎬 Entertainment</option>
                  <option value="💊 Medicine">💊 Medicine</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary demo-submit-btn">
                <span>➕ Record Expense</span>
              </button>
            </form>
          </div>

          {/* Results & Calculations Column */}
          <div className="demo-display-col">
            <h3 className="demo-col-title">2. Live Calculated Summary</h3>

            <div className="demo-summary-box">
              <div className="summary-metric">
                <span className="metric-label">Monthly Budget</span>
                <span className="metric-value">₹{monthlyBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-metric">
                <span className="metric-label">Total Spent</span>
                <span className="metric-value danger">₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-metric">
                <span className="metric-label">Remaining</span>
                <span className="metric-value success">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="demo-progress-wrapper">
              <div className="progress-label-row">
                <span>Budget Consumed</span>
                <span className="progress-pct">{percentage}%</span>
              </div>
              <div className="demo-progress-track">
                <div 
                  className={`demo-progress-fill ${percentage > 85 ? 'fill-warning' : ''}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="demo-list-header">
              <span>Recorded Items ({expenses.length})</span>
            </div>

            <div className="demo-expense-list">
              {expenses.map((item) => (
                <div key={item.id} className="demo-expense-item">
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-meta">{item.category} • {item.method}</span>
                  </div>
                  <div className="item-right">
                    <span className="item-amount">-₹{item.amount.toLocaleString('en-IN')}</span>
                    <button 
                      onClick={() => handleDeleteExpense(item.id)}
                      className="demo-del-btn"
                      title="Delete expense"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .demo-section {
          padding: 4rem 0;
          width: 100%;
          overflow-x: hidden;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2rem;
          width: 100%;
        }

        .demo-col-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--accent-primary);
        }

        .demo-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }

        .demo-field label {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .demo-input {
          padding: 0.7rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          transition: border-color 0.2s ease;
        }

        .demo-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-light);
        }

        .demo-row-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .demo-submit-btn {
          width: 100%;
          margin-top: 0.5rem;
        }

        .demo-summary-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          margin-bottom: 1.25rem;
          text-align: center;
        }

        .summary-metric {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .metric-value {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          margin-top: 0.2rem;
          word-break: break-word;
        }

        .metric-value.danger { color: var(--danger); }
        .metric-value.success { color: var(--success); }

        .demo-progress-wrapper {
          margin-bottom: 1.25rem;
        }

        .progress-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.35rem;
        }

        .demo-progress-track {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .demo-progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .fill-warning {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
        }

        .demo-list-header {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.65rem;
          text-transform: uppercase;
        }

        .demo-expense-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 230px;
          overflow-y: auto;
        }

        .demo-expense-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          gap: 0.5rem;
        }

        .item-title {
          display: block;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .item-meta {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .item-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .item-amount {
          font-weight: 800;
          color: var(--danger);
          font-size: 0.85rem;
        }

        .demo-del-btn {
          font-size: 0.85rem;
          padding: 0.2rem;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .demo-del-btn:hover {
          opacity: 1;
        }

        @media (max-width: 850px) {
          .demo-grid {
            grid-template-columns: 1fr;
            padding: 1.25rem 1rem;
          }
        }

        @media (max-width: 500px) {
          .demo-row-fields {
            grid-template-columns: 1fr;
          }
          .demo-summary-box {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: left;
            padding: 0.75rem 1rem;
          }
          .summary-metric {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .metric-value {
            margin-top: 0;
          }
        }
      `}</style>
    </section>
  );
}
