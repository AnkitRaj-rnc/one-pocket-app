/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';
import type { Category } from '../types';
import { DEFAULT_EXPENSE_REASONS } from '../types';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  addCategory: (name: string) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadCategories = async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiService.getCategories();

      // If user has no categories, seed with defaults
      if (data.length === 0) {
        console.log('No categories found, seeding defaults...');
        for (const categoryName of DEFAULT_EXPENSE_REASONS) {
          try {
            await apiService.createCategory(categoryName);
          } catch (error) {
            console.error(`Failed to create default category: ${categoryName}`, error);
          }
        }
        // Reload categories after seeding
        const newData = await apiService.getCategories();
        setCategories(newData);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories when user changes
  useEffect(() => {
    loadCategories();
  }, [user]);

  const addCategory = async (name: string): Promise<Category> => {
    const newCategory = await apiService.createCategory(name);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    await apiService.deleteCategory(categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const refreshCategories = async (): Promise<void> => {
    await loadCategories();
  };

  const seedDefaultCategories = async (): Promise<void> => {
    try {
      // Only seed if user has no categories
      if (categories.length === 0) {
        console.log('Seeding default categories for new user...');

        // Create each default category
        for (const categoryName of DEFAULT_EXPENSE_REASONS) {
          try {
            await apiService.createCategory(categoryName);
          } catch (error) {
            console.error(`Failed to create default category: ${categoryName}`, error);
          }
        }

        // Reload categories after seeding
        await loadCategories();
        console.log('Default categories seeded successfully');
      }
    } catch (error) {
      console.error('Failed to seed default categories:', error);
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      isLoading,
      addCategory,
      deleteCategory,
      refreshCategories,
      seedDefaultCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
