import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './TopNavigation.css';

export default function TopNavigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="top-navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">💰</span>
          OnePocket
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Add Expense
          </Link>
          <Link
            to="/expenses"
            className={`nav-link ${location.pathname === '/expenses' ? 'active' : ''}`}
          >
            View Expenses
          </Link>
          <Link
            to="/analytics"
            className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            Analytics
          </Link>
          <Link
            to="/budget"
            className={`nav-link ${location.pathname === '/budget' ? 'active' : ''}`}
          >
            Budget
          </Link>
          <Link
            to="/history"
            className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
          >
            History
          </Link>

          <div className="user-menu">
            <span className="user-name">{user?.username}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}