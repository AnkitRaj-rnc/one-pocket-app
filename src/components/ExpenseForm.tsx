import { useState, useEffect, useRef } from 'react';
import type { ExpenseFormData, PaymentMethod } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import './ExpenseForm.css';

interface ExpenseFormProps {
  onAddExpense: (expenseData: ExpenseFormData) => void;
  isLoading: boolean;
}

export default function ExpenseForm({ onAddExpense, isLoading }: ExpenseFormProps) {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    reason: '',
    date: '', // Empty means today's date
    paymentMethod: 'upi', // UPI by default
    note: '', // Optional note
    reimbursable: false // Unchecked by default
  });

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [maxDate, setMaxDate] = useState<string>('');

  // Update max date every time component renders to ensure it's always current
  useEffect(() => {
    const updateMaxDate = () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      setMaxDate(todayString);

      // Also update the input's max attribute directly
      if (dateInputRef.current) {
        dateInputRef.current.max = todayString;
      }
    };

    updateMaxDate();
    // Update every minute to handle day changes
    const interval = setInterval(updateMaxDate, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.reason) return;

    onAddExpense(formData);
    setFormData({ amount: '', reason: '', date: '', paymentMethod: 'upi', note: '', reimbursable: false });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];

    // Only allow today or past dates
    if (selectedDate && selectedDate <= today) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleDateFocus = () => {
    // Ensure max date is set when user opens the picker
    if (dateInputRef.current) {
      const today = new Date().toISOString().split('T')[0];
      dateInputRef.current.max = today;
      dateInputRef.current.setAttribute('max', today);

      // Additional mobile browser constraints
      dateInputRef.current.setAttribute('data-max', today);
    }
  };

  const handleDateInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Prevent typing future dates
    const target = e.currentTarget;
    const value = target.value;
    const today = new Date().toISOString().split('T')[0];

    if (value > today) {
      target.value = '';
      setFormData(prev => ({ ...prev, date: '' }));
    }
  };

  // Show message if no categories
  if (!isCategoriesLoading && categories.length === 0) {
    return (
      <div className="expense-form-container">
        <h1>Add Expense</h1>
        <div className="no-categories-message">
          <div className="message-icon">📁</div>
          <h3>No Categories Found</h3>
          <p>You need to add at least one category before you can create expenses.</p>
          <a href="/categories" className="add-categories-link">
            Go to Categories Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-form-container">
      <h1>Add Expense</h1>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleAmountChange}
            className="amount-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Category</label>
          <select
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            className="reason-select"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="note">Note (optional)</label>
          <input
            id="note"
            type="text"
            placeholder="e.g., Electricity bill, Netflix subscription"
            value={formData.note || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            className="note-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date (optional)</label>
          <div className="date-input-container">
            <input
              ref={dateInputRef}
              id="date"
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              onFocus={handleDateFocus}
              onInput={handleDateInput}
              className="date-input"
              max={maxDate}
              onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
              placeholder="Select date"
              data-testid="date-picker"
            />
            {formData.date && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, date: '' }))}
                className="clear-date-button"
                title="Clear date (use today's date)"
                aria-label="Clear selected date"
              >
                ×
              </button>
            )}
          </div>
          <small className="date-help">
            {formData.date ? 'Click × to use today\'s date' : 'Leave empty for today\'s date'}
          </small>
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={formData.paymentMethod === 'upi'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                className="radio-input"
              />
              <span className="radio-text">UPI</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                className="radio-input"
              />
              <span className="radio-text">Cash</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                className="radio-input"
              />
              <span className="radio-text">Credit Card</span>
            </label>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              id="reimbursable"
              type="checkbox"
              checked={formData.reimbursable || false}
              onChange={(e) => setFormData(prev => ({ ...prev, reimbursable: e.target.checked }))}
              className="checkbox-input"
            />
            <span className="checkbox-text">Reimbursable (paid on someone's behalf)</span>
          </label>
        </div>

        <button
          type="submit"
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || !formData.amount || !formData.reason}
        >
          {isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}