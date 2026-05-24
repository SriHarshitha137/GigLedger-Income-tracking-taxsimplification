import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gigledger_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gigledger_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const savedToken = localStorage.getItem('gigledger_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
        setToken(savedToken);
        localStorage.setItem('gigledger_user', JSON.stringify(data.user));
      } catch (err) {
        localStorage.removeItem('gigledger_token');
        localStorage.removeItem('gigledger_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const login = (nextToken, nextUser) => {
    localStorage.setItem('gigledger_token', nextToken);
    localStorage.setItem('gigledger_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('gigledger_token');
    localStorage.removeItem('gigledger_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({ user, token, loading, login, logout, setUser }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
