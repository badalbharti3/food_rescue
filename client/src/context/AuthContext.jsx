import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fr_user')); } catch { return null; }
  });
  const [org, setOrg] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fr_org')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fr_token');
    if (token) {
      api.get('/auth/me').then((r) => {
        setUser(r.data.data.user);
        setOrg(r.data.data.org);
        localStorage.setItem('fr_user', JSON.stringify(r.data.data.user));
        localStorage.setItem('fr_org', JSON.stringify(r.data.data.org));
      }).catch(() => {
        localStorage.removeItem('fr_token'); localStorage.removeItem('fr_user'); localStorage.removeItem('fr_org');
        setUser(null); setOrg(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    const { token, user: u, org: o } = r.data.data;
    localStorage.setItem('fr_token', token);
    localStorage.setItem('fr_user', JSON.stringify(u));
    localStorage.setItem('fr_org', JSON.stringify(o));
    setUser(u); setOrg(o);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('fr_token'); localStorage.removeItem('fr_user'); localStorage.removeItem('fr_org');
    setUser(null); setOrg(null);
  };

  return <AuthContext.Provider value={{ user, org, loading, login, logout, setUser, setOrg }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
