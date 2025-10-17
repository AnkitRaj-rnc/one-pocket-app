import { useState, useEffect } from 'react';
import type { MonthlySummary } from '../types';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import MonthlyComparisonChart from '../components/MonthlyComparisonChart';
import './HistoryPage.css';

export default function HistoryPage() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadMonthlySummary(selectedMonth);
    }
  }, [selectedMonth]);

  const loadAvailableMonths = async () => {
    try {
      const months = await apiService.getAvailableMonths();
      setAvailableMonths(months);
      if (months.length > 0) {
        setSelectedMonth(months[0]); // Select most recent month
      }
    } catch (error) {
      console.error('Failed to load available months:', error);
    }
  };

  const loadMonthlySummary = async (month: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.getMonthlySummary(month);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load monthly summary:', error);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonthDisplay = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (availableMonths.length === 0) {
    return (
      <div className="page-container">
        <div className="history-container">
          <h1>History</h1>
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No historical data</h3>
            <p>Your expense history will appear here once you have data from previous months.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="history-container">
        <div className="history-header">
          <h1>History</h1>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-selector"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Comparison Chart - Show before month-specific data */}
        <MonthlyComparisonChart months={6} />

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading summary...</p>
          </div>
        ) : summary ? (
          <>
            {/* Total Spending Card */}
            <div className="summary-card total-card">
              <h2>Total Spent</h2>
              <div className="spending-row">
                <div className="total-amount">{formatCurrency(summary.totalSpent)}</div>
                {summary.totalReimbursable !== undefined && summary.totalReimbursable > 0 && (
                  <div className="reimbursable-info">
                    <span className="reimbursable-label">Reimbursable:</span>
                    <span className="reimbursable-amount">{formatCurrency(summary.totalReimbursable)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Spending Categories */}
            <div className="summary-card">
              <h2>Top Spending Categories</h2>
              <div className="category-list">
                {summary.categoryBreakdown
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map(cat => (
                    <div key={cat.category} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{cat.category}</span>
                        <span className="category-percentage">{cat.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="category-amount">{formatCurrency(cat.amount)}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Budget vs Actual */}
            {summary.budgetComparisons.length > 0 && (
              <div className="summary-card">
                <h2>Budget vs Actual</h2>
                <div className="budget-comparison-list">
                  {summary.budgetComparisons.map(comp => (
                    <div key={comp.category} className="budget-comparison-item">
                      <div className="comparison-header">
                        <span className="comparison-category">{comp.category}</span>
                        <span className={`comparison-status ${comp.difference < 0 ? 'over' : 'under'}`}>
                          {comp.difference < 0 ? '⚠️ Over' : '✓ Under'}
                        </span>
                      </div>
                      <div className="comparison-amounts">
                        <div className="amount-row">
                          <span className="amount-label">Budget:</span>
                          <span className="amount-value">{formatCurrency(comp.budgetAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Actual:</span>
                          <span className="amount-value">{formatCurrency(comp.actualSpent)}</span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Difference:</span>
                          <span className={`amount-value ${comp.difference < 0 ? 'negative' : 'positive'}`}>
                            {comp.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(comp.difference))}
                          </span>
                        </div>
                      </div>
                      <div className="comparison-progress">
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${comp.percentageUsed > 100 ? 'exceeded' : ''}`}
                            style={{ width: `${Math.min(comp.percentageUsed, 100)}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{comp.percentageUsed.toFixed(1)}% used</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No data available</h3>
            <p>No expense data found for the selected month.</p>
          </div>
        )}
      </div>
    </div>
  );
}
