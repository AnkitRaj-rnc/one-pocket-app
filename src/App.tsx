import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { useExpenses } from './hooks/useExpenses';
import AddExpensePage from './pages/AddExpensePage';
import ExpenseListPage from './pages/ExpenseListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';
import TopNavigation from './components/TopNavigation';
import LoginForm from './components/LoginForm';
import { apiService } from './services/api';
import { useEffect } from 'react';
import './App.css';

function AppContent() {
  const { user, isLoading: authLoading } = useAuth();

  // Set user ID in API service before initializing expenses hook
  useEffect(() => {
    if (user) {
      apiService.setUserId(user.id);
    } else {
      apiService.setUserId(null);
    }
  }, [user]);

  const { expenses, addExpense, deleteExpense, reimburseExpense, isLoading, isInitialLoading } = useExpenses(user?.id || null);

  if (authLoading || isInitialLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="app">
        <TopNavigation />
        <Routes>
          <Route
            path="/"
            element={<AddExpensePage onAddExpense={addExpense} isLoading={isLoading} expenses={expenses} onDeleteExpense={deleteExpense} onReimburseExpense={reimburseExpense} />}
          />
          <Route
            path="/expenses"
            element={<ExpenseListPage expenses={expenses} onDeleteExpense={deleteExpense} onReimburseExpense={reimburseExpense} />}
          />
          <Route
            path="/analytics"
            element={<AnalyticsPage expenses={expenses} />}
          />
          <Route
            path="/budget"
            element={<BudgetPage expenses={expenses} />}
          />
          <Route
            path="/history"
            element={<HistoryPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage />}
          />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <AppContent />
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;
