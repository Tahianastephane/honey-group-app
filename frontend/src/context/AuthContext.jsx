import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

 const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Erreur logout backend :', err);
  } finally {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setUsers([]);
  }
};

  // Charge / recharge la liste des utilisateurs
  const refreshUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs :', err);
    }
  }, [user]);

  // Charge automatiquement
  useEffect(() => {
  if (user?.role !== 'admin') return;

  refreshUsers();
  const interval = setInterval(() => {
    refreshUsers();
  }, 5000);

  return () => clearInterval(interval);
}, [user, refreshUsers]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, users, refreshUsers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);