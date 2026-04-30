// AdminLogin.jsx - Admin Authentication Form

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext.js';
import { Shield, ArrowLeft } from '@phosphor-icons/react';

const AdminLogin = () => {
  const { login } = useAppContext();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const expectedPassword = 'AdminPass2026!';
    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and password.');
      return;
    }
    if (password !== expectedPassword) {
      setError('Invalid admin credentials. Please verify your login details.');
      return;
    }
    login({ userId: adminId.trim(), role: 'Admin' });
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    login({ userId: 'DemoAdmin', role: 'Admin' });
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-panel">
          <section className="login-header">
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--accent-violet)'
            }}>
              <Shield size={26} weight="fill" />
            </div>
            <h1>Admin Sign-In</h1>
            <p>Access the secure ParkWatch administrative dashboard.</p>
          </section>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="adminId">Admin ID</label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter your Admin ID"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-required="true"
              />
            </div>

            {error && <p className="form-error" role="alert">⚠ {error}</p>}

            <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }}>
              Sign In
            </button>
          </form>

          <div className="demo-section">
            <button onClick={handleDemoLogin} className="btn btn-demo">
              🚀 Demo Version
            </button>
            <p>Use demo credentials to explore the admin dashboard.</p>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Back to login options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
