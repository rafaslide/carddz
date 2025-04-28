
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this would check for an existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('carddz_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('carddz_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    // For now, we'll simulate with some default users
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo users
    if (email === 'admin@carddz.com' && password === 'password') {
      const adminUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@carddz.com',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('carddz_user', JSON.stringify(adminUser));
      return;
    }
    
    if (email === 'restaurant@carddz.com' && password === 'password') {
      const restaurantUser: User = {
        id: '2',
        name: 'Restaurant Owner',
        email: 'restaurant@carddz.com',
        role: 'restaurant',
        restaurantId: 'rest1'
      };
      setUser(restaurantUser);
      localStorage.setItem('carddz_user', JSON.stringify(restaurantUser));
      return;
    }
    
    if (email === 'customer@carddz.com' && password === 'password') {
      const customerUser: User = {
        id: '3',
        name: 'Customer',
        email: 'customer@carddz.com',
        role: 'customer'
      };
      setUser(customerUser);
      localStorage.setItem('carddz_user', JSON.stringify(customerUser));
      return;
    }
    
    throw new Error('Invalid email or password');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('carddz_user');
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
