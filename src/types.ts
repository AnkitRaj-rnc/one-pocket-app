export type PaymentMethod = 'upi' | 'cash' | 'credit_card';

export interface Expense {
  id: string;
  amount: number;
  reason: string;
  date: string; // ISO date string
  createdAt: string; // ISO datetime string
  paymentMethod?: PaymentMethod; // Optional, defaults to 'upi'
  note?: string; // Optional comment/note about the expense
  reimbursable?: boolean; // Optional, marks expense as reimbursable (excluded from budget)
  reimbursed?: boolean; // Optional, marks expense as already reimbursed
}

export interface ExpenseFormData {
  amount: string;
  reason: string;
  date?: string; // Optional, defaults to today if not provided
  paymentMethod?: PaymentMethod; // Optional, defaults to 'upi'
  note?: string; // Optional comment/note about the expense
  reimbursable?: boolean; // Optional, marks expense as reimbursable
}

export type ExpenseReason = string; // Changed to string to support custom categories

// Default categories - used for new users or as fallback
export const DEFAULT_EXPENSE_REASONS: string[] = [
  'Household',
  'Transportation',
  'Shopping',
  'Travel',
  'Food/Drinks',
  'Luxury',
  'Miscellaneous',
  'Bills',
  'Investment',
  'For someone',
  'EMI'
];

// Deprecated - kept for backwards compatibility
export const EXPENSE_REASONS = DEFAULT_EXPENSE_REASONS;

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseReason;
  amount: number;
  month: string; // Format: "YYYY-MM"
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  month?: string; // Format: "YYYY-MM", defaults to current month
}

export interface BudgetStatus {
  category: ExpenseReason;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isExceeded: boolean;
}

export interface CategorySpending {
  category: ExpenseReason;
  amount: number;
  percentage: number;
}

export interface BudgetComparison {
  category: ExpenseReason;
  budgetAmount: number;
  actualSpent: number;
  difference: number;
  percentageUsed: number;
}

export interface MonthlySummary {
  month: string; // Format: "YYYY-MM"
  totalSpent: number;
  totalReimbursable?: number; // Total amount of reimbursable expenses
  categoryBreakdown: CategorySpending[];
  budgetComparisons: BudgetComparison[];
}