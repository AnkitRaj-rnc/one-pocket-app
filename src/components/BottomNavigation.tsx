import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './BottomNavigation.css';

export default function BottomNavigation() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <nav className="bottom-navigation">
      <Link
        to="/"
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <div className="nav-icon">➕</div>
        <span className="nav-label">Add</span>
      </Link>

      <Link
        to="/expenses"
        className={`nav-item ${location.pathname === '/expenses' ? 'active' : ''}`}
      >
        <div className="nav-icon">📋</div>
        <span className="nav-label">Expenses</span>
      </Link>

      <Link
        to="/analytics"
        className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
      >
        <div className="nav-icon">📊</div>
        <span className="nav-label">Analytics</span>
      </Link>

      <Link
        to="/budget"
        className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}
      >
        <div className="nav-icon">💰</div>
        <span className="nav-label">Budget</span>
      </Link>

      <Link
        to="/history"
        className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
      >
        <div className="nav-icon">📅</div>
        <span className="nav-label">History</span>
      </Link>

      <button
        onClick={logout}
        className="nav-item logout-nav-item"
      >
        <div className="nav-icon">🚪</div>
        <span className="nav-label">Logout</span>
      </button>
    </nav>
  );
}