import { useState, useEffect } from 'react';
import type { Budget, BudgetFormData, BudgetStatus, Expense, ExpenseReason } from '../types';
import { EXPENSE_REASONS } from '../types';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import './BudgetPage.css';

interface BudgetPageProps {
  expenses: Expense[];
}

export default function BudgetPage({ expenses }: BudgetPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: ''
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await apiService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  };

  const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const calculateBudgetStatus = (): BudgetStatus[] => {
    const currentMonth = getCurrentMonth();

    return EXPENSE_REASONS.map(category => {
      const budget = budgets.find(b => b.category === category);
      // Filter expenses for current month only and exclude reimbursable expenses
      const spent = expenses
        .filter(e => {
          const expenseMonth = e.date.substring(0, 7); // Extract YYYY-MM from date
          return e.reason === category && !e.reimbursable && expenseMonth === currentMonth;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const budgetAmount = budget?.amount || 0;
      const remaining = budgetAmount - spent;
      const percentageUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      const isExceeded = spent > budgetAmount && budgetAmount > 0;

      return {
        category,
        budgetAmount,
        spent,
        remaining,
        percentageUsed,
        isExceeded
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingBudget) {
        await apiService.updateBudget(editingBudget.id, formData);
      } else {
        await apiService.createBudget(formData);
      }
      await loadBudgets();
      setShowForm(false);
      setEditingBudget(null);
      setFormData({ category: '', amount: '' });
    } catch (error) {
      console.error('Failed to save budget:', error);
      alert('Failed to save budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await apiService.deleteBudget(budgetId);
        await loadBudgets();
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({ category: '', amount: '' });
  };

  const budgetStatuses = calculateBudgetStatus();
  const usedCategories = budgets.map(b => b.category);
  const availableCategories = EXPENSE_REASONS.filter(
    cat => !usedCategories.includes(cat) || editingBudget?.category === cat
  );

  return (
    <div className="page-container">
      <div className="budget-container">
        <div className="budget-header">
          <h1>Budget Tracker</h1>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="add-budget-button">
              + Add Budget
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="budget-form">
            <h3>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</h3>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="budget-select"
                required
                disabled={!!editingBudget}
              >
                <option value="">Select a category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Budget Amount (₹)</label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setFormData(prev => ({ ...prev, amount: value }));
                  }
                }}
                className="budget-input"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-button" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Budget'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="budget-list">
          {budgetStatuses.map(status => {
            const budget = budgets.find(b => b.category === status.category);

            if (!budget) return null;

            return (
              <div key={status.category} className={`budget-card ${status.isExceeded ? 'exceeded' : ''}`}>
                <div className="budget-card-header">
                  <h3>{status.category}</h3>
                  <div className="budget-actions">
                    <button onClick={() => handleEdit(budget)} className="edit-btn">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="delete-btn">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="amount-row">
                    <span className="amount-label">Budget:</span>
                    <span className="amount-value">{formatCurrency(status.budgetAmount)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Spent:</span>
                    <span className={`amount-value ${status.isExceeded ? 'exceeded-text' : ''}`}>
                      {formatCurrency(status.spent)}
                    </span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Remaining:</span>
                    <span className={`amount-value ${status.isExceeded ? 'exceeded-text' : 'remaining-text'}`}>
                      {formatCurrency(status.remaining)}
                    </span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${status.isExceeded ? 'exceeded-fill' : ''}`}
                      style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {status.percentageUsed.toFixed(1)}% used
                    {status.isExceeded && <span className="exceeded-badge">⚠️ Over Budget</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {budgets.length === 0 && !showForm && (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No budgets set</h3>
            <p>Start tracking your spending by setting budgets for different categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
