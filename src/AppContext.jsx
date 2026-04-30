// AppContext.js - Global Context for Role and Sidebar State

import React, { useState, useEffect } from 'react';
import { AppContext } from './AppContextData.js';

export const AppProvider = ({ children }) => {
  const getSavedRole = () => localStorage.getItem('parkwatch_role') || 'Citizen';
  const getSavedUser = () => {
    const raw = localStorage.getItem('parkwatch_user');
    return raw ? JSON.parse(raw) : null;
  };
  const getSavedAuth = () => localStorage.getItem('parkwatch_authenticated') === 'true';
  const getSavedTheme = () => localStorage.getItem('parkwatch_theme') || 'dark';

  const [role, setRole] = useState(getSavedRole());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth <= 992 : false
  );
  const [authenticated, setAuthenticated] = useState(getSavedAuth());
  const [user, setUser] = useState(getSavedUser());
  const [accounts, setAccounts] = useState(() => {
    const raw = localStorage.getItem('parkwatch_accounts');
    return raw ? JSON.parse(raw) : [];
  });
  const [theme, setThemeState] = useState(getSavedTheme());

  // Apply theme class to <html> on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    localStorage.setItem('parkwatch_theme', next);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('parkwatch_role', newRole);
    if (newRole === 'Citizen') {
      setAuthenticated(false);
      localStorage.setItem('parkwatch_authenticated', 'false');
    }
  };

  const login = async ({ userId, role: userRole = 'Citizen', name }) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: userRole, name })
      });
      const data = await res.json();
      
      setAuthenticated(true);
      const userData = { id: data.id, name: data.name };
      setUser(userData);
      setRole(data.role);
      localStorage.setItem('parkwatch_authenticated', 'true');
      localStorage.setItem('parkwatch_user', JSON.stringify(userData));
      localStorage.setItem('parkwatch_role', data.role);
    } catch (error) {
      console.error(error);
    }
  };

  const createAccount = async ({ name, mobile }) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile })
      });
      const account = await res.json();
      
      const nextAccounts = [...accounts, account];
      setAccounts(nextAccounts);
      localStorage.setItem('parkwatch_accounts', JSON.stringify(nextAccounts));
      return account;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    localStorage.setItem('parkwatch_authenticated', 'false');
    localStorage.removeItem('parkwatch_user');
  };

  return (
    <AppContext.Provider value={{
      role,
      switchRole,
      sidebarCollapsed,
      setSidebarCollapsed,
      authenticated,
      user,
      accounts,
      login,
      createAccount,
      logout,
      theme,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};