import type { Expense } from '../types';

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export function getCategoryAnalytics(expenses: Expense[]): CategoryData[] {
  if (expenses.length === 0) return [];

  // Filter out reimbursable expenses
  const nonReimbursableExpenses = expenses.filter(expense => !expense.reimbursable);

  if (nonReimbursableExpenses.length === 0) return [];

  // Calculate totals by category
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  let totalAmount = 0;

  nonReimbursableExpenses.forEach(expense => {
    if (!categoryTotals[expense.reason]) {
      categoryTotals[expense.reason] = { amount: 0, count: 0 };
    }
    categoryTotals[expense.reason].amount += expense.amount;
    categoryTotals[expense.reason].count += 1;
    totalAmount += expense.amount;
  });

  // Color palette for categories
  const colors = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#059669', // Green
    '#d97706', // Orange
    '#7c3aed', // Purple
    '#0891b2', // Cyan
    '#be185d', // Pink
    '#65a30d', // Lime
    '#4338ca', // Indigo
  ];

  // Convert to CategoryData array
  const categoryData = Object.entries(categoryTotals).map(([category, data], index) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: (data.amount / totalAmount) * 100,
    color: colors[index % colors.length]
  }));

  // Sort by amount (highest first)
  return categoryData.sort((a, b) => b.amount - a.amount);
}

export function getTopCategories(expenses: Expense[], limit: number = 3): CategoryData[] {
  return getCategoryAnalytics(expenses).slice(0, limit);
}

export function getTotalSpending(expenses: Expense[]): number {
  // Exclude reimbursable expenses from total spending
  return expenses
    .filter(expense => !expense.reimbursable)
    .reduce((total, expense) => total + expense.amount, 0);
}

export function getSpendingByTimeRange(expenses: Expense[], days: number): Expense[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return expenses.filter(expense =>
    new Date(expense.date) >= cutoffDate
  );
}