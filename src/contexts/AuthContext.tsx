import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage with token expiry)
    const checkAuthStatus = () => {
      try {
        const storedAuth = localStorage.getItem('onepocket_auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);

          // Check if token is still valid (365 days)
          const tokenExpiry = new Date(authData.expiresAt);
          if (tokenExpiry > new Date()) {
            setUser(authData.user);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('onepocket_auth');
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem('onepocket_auth');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Call backend login API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const apiResponse = await response.json();

        if (apiResponse.success && apiResponse.data) {
          const { id, username: returnedUsername, token } = apiResponse.data;

          const user: User = {
            id,
            username: returnedUsername
          };

          // Store user and token with 365-day expiry
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 365);

          const authData = {
            user,
            token,
            expiresAt: expiresAt.toISOString(),
          };

          localStorage.setItem('onepocket_auth', JSON.stringify(authData));
          localStorage.setItem('auth_token', token);
          setUser(user);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log('Registering with:', { username, password });

      // Call backend registration API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Registration response status:', response.status);

      if (response.ok) {
        const apiResponse = await response.json();
        console.log('Registration response:', apiResponse);

        if (apiResponse.success && apiResponse.data) {
          const { id, username: returnedUsername, token } = apiResponse.data;

          const user: User = {
            id,
            username: returnedUsername
          };

          // Store user and token with 365-day expiry
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 365);

          const authData = {
            user,
            token,
            expiresAt: expiresAt.toISOString(),
          };

          localStorage.setItem('onepocket_auth', JSON.stringify(authData));
          localStorage.setItem('auth_token', token);
          setUser(user);
          return true;
        }
      } else {
        // Log the error response for debugging
        const errorResponse = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Registration failed:', response.status, errorResponse);
        // Don't suppress the error - let it bubble up to the UI
        return false;
      }

      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      // Re-throw the error so the UI can handle it properly
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('onepocket_auth');
    localStorage.removeItem('auth_token');
    // Also clear user-specific expense data if needed
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}