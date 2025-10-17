import ExpenseForm from '../components/ExpenseForm';
import RecentTransactions from '../components/RecentTransactions';
import type { ExpenseFormData, Expense } from '../types';

interface AddExpensePageProps {
  onAddExpense: (expenseData: ExpenseFormData) => void;
  isLoading: boolean;
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onReimburseExpense: (expenseId: string) => Promise<void>;
}

export default function AddExpensePage({ onAddExpense, isLoading, expenses, onDeleteExpense, onReimburseExpense }: AddExpensePageProps) {
  return (
    <div className="page-container">
      <ExpenseForm onAddExpense={onAddExpense} isLoading={isLoading} />
      <RecentTransactions expenses={expenses} onDeleteExpense={onDeleteExpense} onReimburseExpense={onReimburseExpense} />
    </div>
  );
}