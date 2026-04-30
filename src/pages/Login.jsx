// Login.jsx - Authentication Selection Page

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, UserPlus, ArrowRight } from '@phosphor-icons/react';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-panel">
          <section className="login-header">
            <h1>ParkWatch Access</h1>
            <p>Select your portal access path below to get started.</p>
          </section>

          <div className="auth-select">
            <Link to="/citizen-login" className="auth-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="feature-icon cyan" style={{ width: 36, height: 36, borderRadius: 8 }}>
                  <User size={18} weight="fill" />
                </div>
                <h2 style={{ margin: 0 }}>Citizen Portal</h2>
              </div>
              <p>Submit and track park violation reports through the official citizen gateway.</p>
              <span>Citizen Sign-In <ArrowRight size={13} weight="bold" /></span>
            </Link>

            <Link to="/admin-login" className="auth-card admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="feature-icon violet" style={{ width: 36, height: 36, borderRadius: 8 }}>
                  <Shield size={18} weight="fill" />
                </div>
                <h2 style={{ margin: 0 }}>Admin Portal</h2>
              </div>
              <p>Access the administrative dashboard and open data tools.</p>
              <span>Admin Sign-In <ArrowRight size={13} weight="bold" /></span>
            </Link>

            <Link to="/create-account" className="auth-card create-account-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="feature-icon blue" style={{ width: 36, height: 36, borderRadius: 8 }}>
                  <UserPlus size={18} weight="fill" />
                </div>
                <h2 style={{ margin: 0 }}>Create Citizen Account</h2>
              </div>
              <p>Register with your mobile number to report non-parking car violations instantly.</p>
              <span>New Account <ArrowRight size={13} weight="bold" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
