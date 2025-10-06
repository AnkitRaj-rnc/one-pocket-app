import { useState, useEffect } from 'react';
import type { Expense, ExpenseFormData } from '../types';
import { apiService } from '../services/api';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
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

  return {
    expenses,
    addExpense,
    deleteExpense,
    isLoading,
    isInitialLoading
  };
}