import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/lib/types';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    async function loadUser() {
      try {
        if (api.isAuthenticated()) {
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        await api.logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await api.login(email, password);
      if (result.success) {
        setUser(result.user);
        router.push('/dashboard');
        return true;
      }
      setError('Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await api.register(email, password);
      if (result.success) {
        router.push('/dashboard');
        return true;
      }
      setError(result.error || 'Registration failed');
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
      return false;
    }
  };

  const logout = async () => {
    setError(null);
    await api.logout();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}