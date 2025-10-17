import { useSearchParams } from 'react-router-dom';
import ExpenseList from '../components/ExpenseList';
import type { Expense } from '../types';

interface ExpenseListPageProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onReimburseExpense: (expenseId: string) => Promise<void>;
}

export default function ExpenseListPage({ expenses, onDeleteExpense, onReimburseExpense }: ExpenseListPageProps) {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  return (
    <div className="page-container">
      <ExpenseList
        expenses={expenses}
        onDeleteExpense={onDeleteExpense}
        onReimburseExpense={onReimburseExpense}
        initialCategoryFilter={categoryFilter}
      />
    </div>
  );
}