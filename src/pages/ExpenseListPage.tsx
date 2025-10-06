import ExpenseList from '../components/ExpenseList';
import type { Expense } from '../types';

interface ExpenseListPageProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export default function ExpenseListPage({ expenses, onDeleteExpense }: ExpenseListPageProps) {
  return (
    <div className="page-container">
      <ExpenseList expenses={expenses} onDeleteExpense={onDeleteExpense} />
    </div>
  );
}