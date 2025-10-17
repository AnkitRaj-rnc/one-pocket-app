import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';
import { DEFAULT_EXPENSE_REASONS } from '../types';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { categories, isLoading, addCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    // Check if category already exists (case-insensitive)
    const exists = categories.some(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      setError('Category already exists');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addCategory(trimmedName);
      setNewCategoryName('');
      setShowAddCategory(false);
      setSuccessMessage('Category added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to add category:', error);
      setError('Failed to add category. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(
      `Are you sure you want to delete "${categoryName}"? This cannot be undone.`
    )) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category. It may be in use by existing expenses.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User Profile Section */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.username}</h2>
              <p className="user-id">ID: {user?.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="notification error-notification">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="notification success-notification">
            {successMessage}
          </div>
        )}

        {/* Categories Section */}
        <div className="categories-card">
          <div className="categories-header">
            <h3>Manage Categories</h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="add-category-toggle"
            >
              {showAddCategory ? '✕' : '+ Add'}
            </button>
          </div>

          {showAddCategory && (
            <form onSubmit={handleAddCategory} className="add-category-form">
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="category-input"
                maxLength={50}
                disabled={isAdding}
                autoFocus
              />
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                  className="cancel-button"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isAdding || !newCategoryName.trim()}
                >
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          <div className="categories-list">
            {categories.length === 0 ? (
              <div className="empty-categories">
                <div className="empty-icon">📁</div>
                <p>No categories yet</p>
                <small>Add your first category to get started</small>
              </div>
            ) : (
              <div className="category-grid">
                {categories.map((category) => {
                  const isDefault = DEFAULT_EXPENSE_REASONS.includes(category.name);
                  return (
                    <div key={category.id} className="category-chip">
                      <span className="category-name">{category.name}</span>
                      {isDefault && <span className="default-badge">Default</span>}
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="delete-chip-button"
                        title={`Delete ${category.name}`}
                        aria-label={`Delete ${category.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* App Info Section */}
        <div className="app-info-card">
          <h4>About OnePocket</h4>
          <p>Your personal expense tracking companion</p>
          <div className="app-version">Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
