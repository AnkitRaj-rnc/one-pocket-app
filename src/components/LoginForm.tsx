import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginForm.css';

export default function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success;
      if (isRegistering) {
        if (!formData.username.trim()) {
          setError('Username is required.');
          setIsLoading(false);
          return;
        }
        success = await register(formData.username, formData.password);
        if (!success) {
          setError('Registration failed. Please check your details and try again.');
        }
      } else {
        success = await login(formData.username, formData.password);
        if (!success) {
          setError('Invalid username or password. Password must be at least 4 characters.');
        }
      }
    } catch (error) {
      // Handle specific error messages from the backend
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(isRegistering ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({
      username: '',
      password: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <div className="app-logo">💰</div>
          <h1>OnePocket</h1>
          <p>Personal Expense Tracker</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="login-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="login-input"
              placeholder="Enter your password"
              required
              minLength={4}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading
              ? (isRegistering ? 'Creating Account...' : 'Signing In...')
              : (isRegistering ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        <div className="mode-toggle">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-button"
              disabled={isLoading}
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}