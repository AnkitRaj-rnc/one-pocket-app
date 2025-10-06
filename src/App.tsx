import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useExpenses } from './hooks/useExpenses';
import AddExpensePage from './pages/AddExpensePage';
import ExpenseListPage from './pages/ExpenseListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import HistoryPage from './pages/HistoryPage';
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
    }
  }, [user]);

  const { expenses, addExpense, deleteExpense, isLoading, isInitialLoading } = useExpenses();

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
            element={<AddExpensePage onAddExpense={addExpense} isLoading={isLoading} expenses={expenses} onDeleteExpense={deleteExpense} />}
          />
          <Route
            path="/expenses"
            element={<ExpenseListPage expenses={expenses} onDeleteExpense={deleteExpense} />}
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
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
