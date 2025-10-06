import type { Expense } from '../types';
import { getCategoryAnalytics } from '../utils/analytics';
// import { formatCurrency } from '../utils/helpers';
import ExpensePieChart from '../components/ExpensePieChart';
import './AnalyticsPage.css';

interface AnalyticsPageProps {
  expenses: Expense[];
}

export default function AnalyticsPage({ expenses }: AnalyticsPageProps) {
  const categoryData = getCategoryAnalytics(expenses);

  // Calculate spending by payment method (excluding reimbursable)
  const upiSpending = expenses
    .filter(expense => expense.paymentMethod === 'upi' && !expense.reimbursable)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const cashSpending = expenses
    .filter(expense => expense.paymentMethod === 'cash' && !expense.reimbursable)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const creditCardSpending = expenses
    .filter(expense => expense.paymentMethod === 'credit_card' && !expense.reimbursable)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Count only non-reimbursable transactions
  const nonReimbursableCount = expenses.filter(expense => !expense.reimbursable).length;

  // Calculate pending reimbursement
  const reimbursableExpenses = expenses.filter(expense => expense.reimbursable);
  const pendingReimbursement = reimbursableExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="page-container">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Expense Analytics</h1>
          <div className="analytics-summary">
            <div className="summary-item">
              <div className="summary-value">{nonReimbursableCount}</div>
              <div className="summary-label">Total Transactions</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{categoryData.length}</div>
              <div className="summary-label">Categories</div>
            </div>
            <div className="summary-item payment-methods-item">
              <div className="payment-methods-breakdown">
                <div className="payment-method-row">
                  <span className="payment-label">UPI:</span>
                  <span className="payment-value">₹{upiSpending.toFixed(2)}</span>
                </div>
                <div className="payment-method-row">
                  <span className="payment-label">Cash:</span>
                  <span className="payment-value">₹{cashSpending.toFixed(2)}</span>
                </div>
                <div className="payment-method-row">
                  <span className="payment-label">Card:</span>
                  <span className="payment-value">₹{creditCardSpending.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {pendingReimbursement > 0 && (
              <div className="summary-item reimbursement-item">
                <div className="summary-value">₹{pendingReimbursement.toFixed(2)}</div>
                <div className="summary-label">Pending Reimbursement</div>
              </div>
            )}
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="no-expenses">
            <div className="no-expenses-icon">📊</div>
            <h3>No Expense Data</h3>
            <p>Start adding expenses to see your spending analytics and insights.</p>
          </div>
        ) : (
          <ExpensePieChart data={categoryData} />
        )}
      </div>
    </div>
  );
}