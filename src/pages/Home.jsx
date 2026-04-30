// Home.jsx — Enhanced Citizen Dashboard

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../useAppContext.js';
import mockDB from '../MockDB';
import {
  Warning, MagnifyingGlass, MapPin, Trophy,
  Bell, Star, TrendUp, CheckCircle, Clock,
  ArrowRight, Flame, ShieldCheck, SmileyXEyes,
  FileText, LightbulbFilament
} from '@phosphor-icons/react';

/* ── helpers ── */
const statusBadge = (status) => {
  const map = {
    Pending:        { cls: 'badge pending',  icon: '🟡' },
    'Under Review': { cls: 'badge review',   icon: '🔵' },
    Resolved:       { cls: 'badge resolved', icon: '🟢' },
    Rejected:       { cls: 'badge rejected', icon: '🔴' },
  };
  const b = map[status] || { cls: 'badge', icon: '⚪' };
  return <span className={b.cls}>{b.icon} {status}</span>;
};

const tips = [
  'Always include a photo when submitting a violation — it speeds up enforcement by 3×.',
  'Use the Track page to check your report status anytime without contacting the office.',
  'Reports with GPS coordinates are prioritised over location-text-only submissions.',
  'You earn leaderboard points for every verified report accepted by our admins.',
  'Illegal parking near fire hydrants is one of the fastest-resolved violation types.',
];

/* ── quick action cards ── */
const quickActions = [
  {
    icon: <Warning size={22} weight="fill" />,
    iconBg: 'rgba(239,68,68,0.12)', iconColor: 'var(--accent-red)',
    title: 'Report Violation', desc: 'File an official park violation report in under 2 minutes.',
    link: '/reporting', label: 'Report Now',
  },
  {
    icon: <MagnifyingGlass size={22} weight="fill" />,
    iconBg: 'rgba(59,130,246,0.12)', iconColor: 'var(--accent-blue)',
    title: 'Track My Report', desc: 'Check real-time status of your submitted reports.',
    link: '/track', label: 'Track Report',
  },
  {
    icon: <MapPin size={22} weight="fill" />,
    iconBg: 'rgba(6,182,212,0.12)', iconColor: 'var(--accent-cyan)',
    title: 'Violation Map', desc: 'View city-wide incident heatmap with live statuses.',
    link: '/map', label: 'View Map',
  },
  {
    icon: <Trophy size={22} weight="fill" />,
    iconBg: 'rgba(245,158,11,0.12)', iconColor: 'var(--accent-amber)',
    title: 'Leaderboard', desc: 'Compete with fellow citizens to keep the city safe.',
    link: '/leaderboard', label: 'View Rankings',
  },
];

/* ── badge tiers ── */
const getBadge = (count) => {
  if (count >= 20) return { label: 'Platinum Guardian', color: '#38bdf8', emoji: '💎' };
  if (count >= 10) return { label: 'Gold Enforcer',     color: '#fbbf24', emoji: '🥇' };
  if (count >= 5)  return { label: 'Silver Watcher',    color: '#94a3b8', emoji: '🥈' };
  if (count >= 1)  return { label: 'Bronze Reporter',   color: '#d97706', emoji: '🥉' };
  return              { label: 'New Citizen',            color: '#64748b', emoji: '🌱' };
};

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const Home = () => {
  const { user } = useAppContext();
  const [allReports, setAllReports]   = useState([]);
  const [tipIndex]                     = useState(() => Math.floor(Math.random() * tips.length));
  const [showAllReports, setShowAllReports] = useState(false);

  useEffect(() => { mockDB.getReports().then(setAllReports); }, []);

  /* Reports submitted by this user (fallback: show all for demo) */
  const userId      = user?.name || user?.id || '';
  const myReports   = allReports.filter(r => r.submittedBy === userId);
  const displayReports = myReports.length > 0 ? myReports : allReports;   // Demo fallback

  const total    = displayReports.length;
  const pending  = displayReports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const resolved = displayReports.filter(r => r.status === 'Resolved').length;
  const rejected = displayReports.filter(r => r.status === 'Rejected').length;

  const badge        = getBadge(total);
  const recentSlice  = showAllReports ? displayReports : displayReports.slice(0, 4);

  /* progress toward next tier */
  const tiers = [1, 5, 10, 20];
  const nextTier = tiers.find(t => t > total) || 20;
  const prevTier = tiers.filter(t => t <= total).pop() || 0;
  const progress = nextTier === prevTier ? 100
    : Math.round(((total - prevTier) / (nextTier - prevTier)) * 100);

  return (
    <div className="citizen-dashboard">

      {/* ══ WELCOME HERO ══ */}
      <div className="hero-card" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.3rem' }}>
            Welcome back, {user?.name || user?.id || 'Citizen'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
            Official Citizen Enforcement Portal · Keep your city safe.
          </p>
        </div>
        <div className="hero-tag">
          <span>Your Badge</span>
          <strong style={{ color: badge.color, fontSize: '1rem' }}>
            {badge.emoji} {badge.label}
          </strong>
        </div>
      </div>

      {/* ══ PERSONAL STATS ══ */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card total">
          <h3>Total Reports</h3>
          <p>{total}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending / Review</h3>
          <p>{pending}</p>
        </div>
        <div className="stat-card resolved">
          <h3>Resolved</h3>
          <p>{resolved}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p>{rejected}</p>
        </div>
      </div>

      {/* ══ BADGE PROGRESS ══ */}
      <div className="dash-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={16} weight="fill" style={{ color: 'var(--accent-amber)' }} />
          Citizen Progress
        </div>
        <div className="badge-progress-card">
          <div className="badge-info">
            <div className="badge-icon" style={{ background: `${badge.color}22`, borderColor: `${badge.color}44`, color: badge.color }}>
              <span style={{ fontSize: '1.5rem' }}>{badge.emoji}</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', fontSize: '1rem' }}>
                {badge.label}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {total} report{total !== 1 ? 's' : ''} filed · Next tier at {nextTier} reports
              </p>
            </div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%`, background: badge.color }}
              />
            </div>
            <span className="progress-label">{progress}%</span>
          </div>
          {/* tier milestones */}
          <div className="tier-milestones">
            {[
              { count: 1,  label: 'Bronze',   emoji: '🥉' },
              { count: 5,  label: 'Silver',   emoji: '🥈' },
              { count: 10, label: 'Gold',     emoji: '🥇' },
              { count: 20, label: 'Platinum', emoji: '💎' },
            ].map(t => (
              <div key={t.count} className={`tier-milestone ${total >= t.count ? 'achieved' : ''}`}>
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div className="dash-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={16} weight="fill" style={{ color: 'var(--accent-red)' }} />
          Quick Actions
        </div>
        <div className="home-grid">
          {quickActions.map((card) => (
            <article className="home-card" key={card.title}>
              <div>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: card.iconBg, color: card.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                  border: `1px solid ${card.iconColor}30`,
                }}>
                  {card.icon}
                </div>
                <h2>{card.title}</h2>
                <p>{card.desc}</p>
              </div>
              <Link to={card.link} className="btn" style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
                {card.label} <ArrowRight size={13} weight="bold" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* ══ ACTIVITY + TIP — 2-column layout ══ */}
      <div className="dash-two-col">

        {/* Recent Activity */}
        <div className="dash-section" style={{ flex: 2 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} weight="fill" style={{ color: 'var(--accent-blue)' }} />
            Recent Reports
            <span className="mini-badge">{displayReports.length}</span>
          </div>

          {displayReports.length === 0 ? (
            <div className="empty-state">
              <SmileyXEyes size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <p>No reports yet. Be the first to report a violation!</p>
              <Link to="/reporting" className="btn" style={{ marginTop: '0.75rem' }}>File First Report</Link>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSlice.map(r => (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                            {r.id}
                          </span>
                        </td>
                        <td>{r.type}</td>
                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.location}
                        </td>
                        <td>{statusBadge(r.status)}</td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                          {new Date(r.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {displayReports.length > 4 && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.85rem', justifyContent: 'center' }}
                  onClick={() => setShowAllReports(v => !v)}
                >
                  {showAllReports ? 'Show Less' : `Show All ${displayReports.length} Reports`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Right column: Tip + Alert */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Tip of the day */}
          <div className="dash-section tip-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <LightbulbFilament size={18} weight="fill" style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                Reporting Tip
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {tips[tipIndex]}
            </p>
          </div>

          {/* Resolution summary donut-style */}
          <div className="dash-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendUp size={16} weight="fill" style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                Resolution Overview
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Resolved',  value: resolved, total, color: 'var(--accent-green)' },
                { label: 'Pending',   value: pending,  total, color: 'var(--accent-amber)' },
                { label: 'Rejected',  value: rejected, total, color: 'var(--accent-red)'   },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 700 }}>
                      {item.total ? Math.round((item.value / item.total) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: item.color,
                      width: item.total ? `${(item.value / item.total) * 100}%` : '0%',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Civic awareness */}
          <div className="dash-section awareness-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <ShieldCheck size={18} weight="fill" style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                Did You Know?
              </span>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Every report you submit contributes to city enforcement analytics. Your data helps 
              allocate patrol officers and design safer public spaces. 🏙️
            </p>
          </div>

          {/* Notification callout */}
          <div className="dash-section notify-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Bell size={16} weight="fill" style={{ color: 'var(--accent-violet)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                Notifications
              </span>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {pending > 0
                ? `You have ${pending} report${pending > 1 ? 's' : ''} under review. Check back soon!`
                : resolved > 0
                  ? `🎉 All your reports have been resolved. Thank you for your civic duty!`
                  : `No active alerts. File a report to start contributing.`}
            </p>
            {pending > 0 && (
              <Link to="/track" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '0.5rem' }}>
                <CheckCircle size={13} /> Track pending reports
              </Link>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
