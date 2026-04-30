// Layout.jsx - Main Layout Component

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from './useAppContext.js';
import { User, Shield, List, Car, Sun, Moon } from '@phosphor-icons/react';

const Layout = ({ children }) => {
  const {
    role, sidebarCollapsed, setSidebarCollapsed,
    authenticated, user, logout,
    theme, toggleTheme
  } = useAppContext();
  const location = useLocation();

  const citizenMenu = [
    { path: '/home',        label: 'Home' },
    { path: '/reporting',   label: 'Report Violation' },
    { path: '/track',       label: 'Track Report' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  const adminMenu = [
    { path: '/dashboard',   label: 'Dashboard' },
    { path: '/map',         label: 'Violation Map' },
    { path: '/data-portal', label: 'Data Portal' },
  ];

  const menu = role === 'Citizen' ? citizenMenu : adminMenu;

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar-left">
          {authenticated && (
            <button
              className="menu-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle navigation"
            >
              <List size={20} />
            </button>
          )}
          <Link to="/" className="logo">
            <Car size={22} weight="fill" />
            <span className="logo-text">ParkWatch</span>
          </Link>
        </div>

        {authenticated && (
          <nav className="navbar-nav" aria-label="Primary navigation">
            <ul>
              {menu.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="navbar-right">
          {/* 🌗 Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun size={18} weight="fill" />
              : <Moon size={18} weight="fill" />
            }
          </button>

          <Link 
            to="/profile"
            className="user-badge" 
            aria-live="polite"
            title="Click to view profile"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            {role === 'Admin'
              ? <Shield size={15} weight="fill" style={{ color: 'var(--accent-violet)' }} />
              : <User size={15} weight="fill" style={{ color: 'var(--accent-cyan)' }} />
            }
            <span>
              {authenticated && user
                ? `${role} · ${user.name || user.id}`
                : 'Portal login required'}
            </span>
          </Link>

          {authenticated && (
            <button className="btn-citizen" onClick={logout} aria-label="Logout">
              Logout
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main id="main-content" className="content">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>Official ParkWatch Portal — City Government</p>
        <p>
          <a href="#privacy">Privacy Policy</a>
          {' · '}
          <a href="#foia">FOIA Request</a>
          {' · '}
          v1.0.0
        </p>
      </footer>
    </div>
  );
};

export default Layout;