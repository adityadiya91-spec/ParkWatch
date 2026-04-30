// CitizenLogin.jsx - Citizen Authentication Form

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext.js';
import { User, Lock, ArrowLeft } from '@phosphor-icons/react';

const CitizenLogin = () => {
  const { login } = useAppContext();
  const [citizenId, setCitizenId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!citizenId.trim() || !pin.trim()) {
      setError('Please enter both Citizen ID and Security PIN.');
      return;
    }
    login({ userId: citizenId.trim(), role: 'Citizen' });
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-panel">
          <section className="login-header">
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--accent-cyan)'
            }}>
              <User size={26} weight="fill" />
            </div>
            <h1>Citizen Sign-In</h1>
            <p>Access the ParkWatch citizen portal to report and track violations.</p>
          </section>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="citizenId">Citizen ID</label>
              <input
                id="citizenId"
                name="citizenId"
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="Enter your official Citizen ID"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin">Security PIN</label>
              <input
                id="pin"
                name="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your security PIN"
                aria-required="true"
              />
            </div>

            {error && <p className="form-error" role="alert">⚠ {error}</p>}

            <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }}>
              Sign In
            </button>
          </form>

          <p className="form-note" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            New to ParkWatch?{' '}
            <Link to="/create-account">Create an account</Link>
          </p>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Back to login options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
