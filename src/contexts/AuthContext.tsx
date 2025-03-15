
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Teacher',
    email: 'teacher@example.com',
    role: 'teacher',
    avatar: 'https://ui-avatars.com/api/?name=John+Teacher&background=1e40af&color=fff'
  },
  {
    id: '2',
    name: 'Jane Student',
    email: 'student@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Student&background=3b82f6&color=fff'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('examease-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (mock login)
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (foundUser && password === 'password') { // mock password check
        localStorage.setItem('examease-user', JSON.stringify(foundUser));
        setUser(foundUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user (in a real app, this would be a backend call)
      const newUser: User = {
        id: (MOCK_USERS.length + 1).toString(),
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=${role === 'teacher' ? '1e40af' : '3b82f6'}&color=fff`
      };
      
      // In a real app, this would be a database save
      MOCK_USERS.push(newUser);
      
      // Log the user in
      localStorage.setItem('examease-user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Account created",
        description: `Welcome to ExamEase, ${name}!`,
      });
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Signup failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('examease-user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
