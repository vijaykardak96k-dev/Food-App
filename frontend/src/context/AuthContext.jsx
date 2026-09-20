import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/services.js';
import { setUnauthorizedHandler, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is saved we must check it before deciding whether the visitor is logged in.
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi.me()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.status === 401 || err.status === 403) tokenStore.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  const finishAuth = (data) => {
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(() => ({
    user,
    loading,
    login: async (email, password) => finishAuth(await authApi.login(email, password)),
    register: async (form) => finishAuth(await authApi.register(form)),
    registerRestaurant: async (form) => finishAuth(await authApi.registerRestaurant(form)),
    refreshUser: async () => { const data = await authApi.me(); setUser(data.user); },
    logout,
  }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const homePathFor = (user) => (user?.role === 'admin' ? '/admin' : user?.role === 'restaurant' ? '/partner' : '/');
