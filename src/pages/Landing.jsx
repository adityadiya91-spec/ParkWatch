import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext.js';
import { ShieldCheck, MapPin, ChartBar, ArrowRight } from '@phosphor-icons/react';

const Landing = () => {
  const { authenticated, role } = useAppContext();

  if (authenticated) {
    return <Navigate to={role === 'Admin' ? '/dashboard' : '/home'} replace />;
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        {/* Left — Copy */}
        <div className="landing-copy">
          <span className="eyebrow">🏙️ Official City Park Enforcement</span>

          <h1>
            <span>ParkWatch</span> — Safer parks,<br />
            stronger communities.
          </h1>

          <p>
            The city's official park enforcement portal. Report violations,
            review trends, and support safer public spaces with transparent
            civic reporting.
          </p>

          <div className="landing-actions">
            <Link to="/login" className="btn">
              Access Portal <ArrowRight size={16} weight="bold" />
            </Link>
            <Link to="/login" className="btn-ghost">
              Login Options
            </Link>
          </div>

          <div className="landing-stats">
            <div className="landing-stat-item">
              <strong>2,400+</strong>
              <span>Reports Filed</span>
            </div>
            <div className="landing-stat-item">
              <strong>98%</strong>
              <span>Resolution Rate</span>
            </div>
            <div className="landing-stat-item">
              <strong>140+</strong>
              <span>Active Zones</span>
            </div>
          </div>
        </div>

        {/* Right — Feature cards */}
        <div className="landing-panel">
          <div className="feature-card">
            <div className="feature-icon blue">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <div>
              <h2>Trusted Service</h2>
              <p>Secure park reporting and government-grade transparency you can rely on.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon cyan">
              <MapPin size={22} weight="fill" />
            </div>
            <div>
              <h2>Live Park Data</h2>
              <p>Visualize reported violations and enforcement activity across the city in real time.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon violet">
              <ChartBar size={22} weight="fill" />
            </div>
            <div>
              <h2>Actionable Insights</h2>
              <p>Access clean reports and open data tools for smarter decision-making.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
