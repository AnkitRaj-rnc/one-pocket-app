import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Category } from '../types';
import { DEFAULT_EXPENSE_REASONS } from '../types';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const seedDefaultCategories = async () => {
    setIsAdding(true);
    setError(null);
    try {
      const createdCategories: Category[] = [];

      // Create each default category
      for (const categoryName of DEFAULT_EXPENSE_REASONS) {
        try {
          // Check if category already exists before creating
          const exists = categories.some(
            cat => cat.name.toLowerCase() === categoryName.toLowerCase()
          );

          if (!exists) {
            const newCategory = await apiService.createCategory(categoryName);
            createdCategories.push(newCategory);
          }
        } catch (error) {
          console.error(`Failed to create category: ${categoryName}`, error);
        }
      }

      // Reload all categories after seeding
      await loadCategories();

      if (createdCategories.length > 0) {
        setError(`Successfully added ${createdCategories.length} default categories!`);
      } else {
        setError('All default categories already exist.');
      }
    } catch (error) {
      console.error('Failed to seed default categories:', error);
      setError('Failed to initialize default categories');
    } finally {
      setIsAdding(false);
    }
  };

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
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const newCategory = await apiService.createCategory(trimmedName);
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
    } catch (error) {
      console.error('Failed to add category:', error);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Check if it's a default category
    if (DEFAULT_EXPENSE_REASONS.includes(categoryName)) {
      if (!window.confirm(
        `"${categoryName}" is a default category. Are you sure you want to remove it? This cannot be undone.`
      )) {
        return;
      }
    } else {
      if (!window.confirm(
        `Are you sure you want to delete "${categoryName}"? This cannot be undone.`
      )) {
        return;
      }
    }

    try {
      await apiService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category. It may be in use by existing expenses.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="categories-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="categories-container">
        <div className="categories-header">
          <h1>Manage Categories</h1>
          <p className="categories-description">
            Add or remove expense categories to customize your tracking experience
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        <form onSubmit={handleAddCategory} className="add-category-form">
          <div className="form-group-inline">
            <input
              type="text"
              placeholder="Enter new category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="category-input"
              maxLength={50}
              disabled={isAdding}
            />
            <button
              type="submit"
              className="add-button"
              disabled={isAdding || !newCategoryName.trim()}
            >
              {isAdding ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>

        {categories.length === 0 && (
          <div className="seed-default-section">
            <p>Or start with default categories:</p>
            <button
              type="button"
              onClick={seedDefaultCategories}
              className="seed-button"
              disabled={isAdding}
            >
              {isAdding ? 'Adding Default Categories...' : 'Add Default Categories'}
            </button>
          </div>
        )}

        <div className="categories-list">
          <div className="list-header">
            <h2>Your Categories ({categories.length})</h2>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>No categories yet. Add your first category above!</p>
            </div>
          ) : (
            <div className="category-items">
              {categories.map((category) => {
                const isDefault = DEFAULT_EXPENSE_REASONS.includes(category.name);
                return (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      {isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="delete-category-button"
                      title={`Delete ${category.name}`}
                      aria-label={`Delete ${category.name} category`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
