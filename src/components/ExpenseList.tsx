import { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { EXPENSE_REASONS } from '../types';
import { formatCurrency, formatDate, groupExpensesByDate } from '../utils/helpers';
import { getTotalSpending } from '../utils/analytics';
import { apiService } from '../services/api';
import './ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export default function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Expense[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Apply both search and category filter
  let displayExpenses = searchQuery.trim() ? searchResults : expenses;

  // Apply category filter if selected
  if (categoryFilter) {
    displayExpenses = displayExpenses.filter(expense => expense.reason === categoryFilter);
  }
  const groupedExpenses = groupExpensesByDate(displayExpenses);
  const totalSpending = getTotalSpending(displayExpenses);

  // Debounce search API calls
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await apiService.searchExpenses(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await onDeleteExpense(expenseId);
      } catch (error) {
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleMarkReimbursed = async (expenseId: string) => {
    if (window.confirm('Mark as reimbursed? This will remove the expense from your list.')) {
      try {
        await onDeleteExpense(expenseId);
      } catch (error) {
        alert('Failed to mark as reimbursed. Please try again.');
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No expenses yet</h3>
          <p>Start tracking your expenses by adding your first entry above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <div className="expense-header">
        <h2>Your Expenses</h2>

        <div className="filter-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {isSearching && <span className="search-loading">Searching...</span>}
            {searchQuery && !isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search-button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="category-filter-container">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-filter-select"
            >
              <option value="">All Categories</option>
              {EXPENSE_REASONS.map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="total-spending">
          <div className="total-label">
            {searchQuery ? 'Search Results Total' : 'Total Spending'}
          </div>
          <div className="total-amount">{formatCurrency(totalSpending)}</div>
        </div>
      </div>

      {displayExpenses.length === 0 && searchQuery ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>No expenses match your search query "{searchQuery}"</p>
        </div>
      ) : (
      <div className="expense-groups">
        {Object.entries(groupedExpenses).map(([date, dayExpenses]) => {
          const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

          return (
            <div key={date} className="expense-group">
              <div className="date-header">
                <span className="date-label">{formatDate(date)}</span>
                <span className="date-total">{formatCurrency(total)}</span>
              </div>

              <div className="expense-items">
                {dayExpenses.map((expense) => (
                  <div key={expense.id} className={`expense-item ${expense.reimbursable ? 'reimbursable-item' : ''}`}>
                    <div className="expense-info">
                      <div className="expense-reason-row">
                        <span className="expense-reason">{expense.reason}</span>
                        {expense.reimbursable && (
                          <span className="reimbursable-badge">💰 Reimbursable</span>
                        )}
                      </div>
                      {expense.note && (
                        <div className="expense-note">{expense.note}</div>
                      )}
                      <div className="expense-time">
                        {new Date(expense.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                    <div className="expense-right">
                      <div className="expense-amount">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="expense-actions">
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
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="delete-button"
                          title="Delete expense"
                          aria-label="Delete expense"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}