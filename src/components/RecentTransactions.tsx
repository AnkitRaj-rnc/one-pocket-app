import { Link } from 'react-router-dom';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/helpers';
import './RecentTransactions.css';

interface RecentTransactionsProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export default function RecentTransactions({ expenses, onDeleteExpense }: RecentTransactionsProps) {
  // Get 5 most recent expenses
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recentExpenses.length === 0) {
    return (
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="no-transactions">
          <p>No transactions yet. Add your first expense above!</p>
        </div>
      </div>
    );
  }

  const handleMarkReimbursed = async (expenseId: string) => {
    if (window.confirm('Mark as reimbursed? This will remove the expense from your list.')) {
      try {
        await onDeleteExpense(expenseId);
      } catch (error) {
        alert('Failed to mark as reimbursed. Please try again.');
      }
    }
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="recent-transactions">
      <div className="recent-header">
        <h3>Recent Transactions</h3>
        <Link to="/expenses" className="view-all-link">
          View All
        </Link>
      </div>

      <div className="recent-list">
        {recentExpenses.map((expense) => (
          <div key={expense.id} className="recent-item">
            <div className="recent-info">
              <div className="recent-category-row">
                <span className="recent-category">{expense.reason}</span>
                {expense.reimbursable && (
                  <span className="reimbursable-badge">Reimbursable</span>
                )}
              </div>
              {expense.note && (
                <div className="recent-note">{expense.note}</div>
              )}
              <div className="recent-date">
                {formatRelativeDate(expense.date)} • {new Date(expense.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            <div className="recent-right">
              <div className="recent-amount">
                {formatCurrency(expense.amount)}
              </div>
              {expense.reimbursable && (
                <button
                  onClick={() => handleMarkReimbursed(expense.id)}
                  className="reimbursed-button"
                  title="Mark as reimbursed"
                  aria-label="Mark as reimbursed"
                >
                  ✓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}