import { useState, useEffect } from 'react';
import type { Expense, ExpenseFormData } from '../types';
import { apiService } from '../services/api';

export function useExpenses(userId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Clear expenses if no user
    if (!userId) {
      setExpenses([]);
      setIsInitialLoading(false);
      return;
    }

    // Load expenses when user changes
    loadExpenses();
  }, [userId]); // Re-run when userId changes

  const loadExpenses = async () => {
    setIsInitialLoading(true);
    try {
      const data = await apiService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const addExpense = async (expenseData: ExpenseFormData) => {
    setIsLoading(true);
    try {
      const newExpense = await apiService.addExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await apiService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  };

  const reimburseExpense = async (expenseId: string) => {
    try {
      await apiService.reimburseExpense(expenseId);
      // Remove the reimbursed expense from the local state
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Failed to reimburse expense:', error);
      throw error;
    }
  };

  return {
    expenses,
    addExpense,
    deleteExpense,
    reimburseExpense,
    isLoading,
    isInitialLoading
  };
}