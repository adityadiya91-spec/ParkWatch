// Leaderboard.jsx — Enhanced with Search, Civic Score & Animated Podium

import React, { useState, useEffect } from 'react';
import { Trophy, MagnifyingGlass, Medal, Star, TrendUp, Users, ShieldStar } from '@phosphor-icons/react';
import mockDB from '../MockDB';
import { useAppContext } from '../useAppContext.js';

/* ── civic score: resolved reports weight more ── */
const civicScore = (user, reports) => {
  let score = 0;
  reports.filter(r => r.submittedBy === user).forEach(r => {
    if (r.status === 'Resolved')     score += 30;
    else if (r.status === 'Pending') score += 10;
    else if (r.status === 'Under Review') score += 15;
    else if (r.status === 'Rejected')    score += 2;
  });
  return score;
};

const getBadge = (count) => {
  if (count >= 20) return { label: 'Platinum', emoji: '💎', color: '#38bdf8' };
  if (count >= 10) return { label: 'Gold',     emoji: '🥇', color: '#fbbf24' };
  if (count >= 5)  return { label: 'Silver',   emoji: '🥈', color: '#94a3b8' };
  if (count >= 1)  return { label: 'Bronze',   emoji: '🥉', color: '#d97706' };
  return                  { label: 'New',      emoji: '🌱', color: '#64748b' };
};

/* ═══════════════════════════════════════════ */
const Leaderboard = () => {
  const { user } = useAppContext();
  const [reports, setReports] = useState([]);
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('count'); // 'count' | 'score'

  useEffect(() => { mockDB.getReports().then(setReports); }, []);

  /* Build contributor table */
  const contributorMap = {};
  reports.forEach(r => {
    if (!contributorMap[r.submittedBy]) {
      contributorMap[r.submittedBy] = { count: 0, resolved: 0, pending: 0, rejected: 0 };
    }
    contributorMap[r.submittedBy].count++;
    if (r.status === 'Resolved')  contributorMap[r.submittedBy].resolved++;
    if (r.status === 'Pending' || r.status === 'Under Review') contributorMap[r.submittedBy].pending++;
    if (r.status === 'Rejected')  contributorMap[r.submittedBy].rejected++;
  });

  let sorted = Object.entries(contributorMap).map(([name, data]) => ({
    name,
    ...data,
    score: civicScore(name, reports),
    badge: getBadge(data.count),
    isMe: name === (user?.name || user?.id),
  }));

  sorted.sort((a, b) => sortBy === 'score' ? b.score - a.score : b.count - a.count);

  const filtered = sorted.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* Global stats */
  const totalReports = reports.length;
  const totalCitizens = sorted.length;
  const resolvedPct = totalReports
    ? Math.round((reports.filter(r => r.status === 'Resolved').length / totalReports) * 100)
    : 0;

  /* top three for podium */
  const top3 = sorted.slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <h1>Leaderboard 🏆</h1>
        <p>Top ParkWatch contributors — ranked by reports filed and civic score.</p>
      </div>

      {/* ── Community Stats Bar ── */}
      <div className="lb-community-stats">
        <div className="lb-stat">
          <Users size={18} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <strong>{totalCitizens}</strong>
            <span>Active Citizens</span>
          </div>
        </div>
        <div className="lb-stat">
          <ShieldStar size={18} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <strong>{totalReports}</strong>
            <span>Total Reports</span>
          </div>
        </div>
        <div className="lb-stat">
          <TrendUp size={18} style={{ color: 'var(--accent-green)' }} />
          <div>
            <strong>{resolvedPct}%</strong>
            <span>Resolution Rate</span>
          </div>
        </div>
        <div className="lb-stat">
          <Star size={18} style={{ color: 'var(--accent-amber)' }} />
          <div>
            <strong>{sorted[0]?.score || 0}</strong>
            <span>Top Civic Score</span>
          </div>
        </div>
      </div>

      {/* ── Podium ── */}
      {top3.length >= 3 && (
        <div className="podium-wrap">
          {/* 2nd */}
          <div className="podium-card silver" style={{ animationDelay: '0.1s' }}>
            <div className="podium-medal">🥈</div>
            <div className="podium-avatar silver-av">{top3[1].name[0]?.toUpperCase()}</div>
            <p className="podium-name">{top3[1].name}</p>
            <p className="podium-count">{top3[1].count} reports</p>
            <div className="podium-score">
              <Star size={12} /> {top3[1].score} pts
            </div>
            <div className="podium-pedestal silver-ped">2</div>
          </div>

          {/* 1st */}
          <div className="podium-card gold" style={{ animationDelay: '0s' }}>
            <Trophy size={28} weight="fill" style={{ color: '#fbbf24', marginBottom: '0.4rem', filter: 'drop-shadow(0 0 10px #fbbf2480)' }} />
            <div className="podium-avatar gold-av">{top3[0].name[0]?.toUpperCase()}</div>
            <p className="podium-name">{top3[0].name}</p>
            <p className="podium-count">{top3[0].count} reports</p>
            <div className="podium-score">
              <Star size={12} /> {top3[0].score} pts
            </div>
            <div className="podium-pedestal gold-ped">1</div>
          </div>

          {/* 3rd */}
          <div className="podium-card bronze" style={{ animationDelay: '0.2s' }}>
            <div className="podium-medal">🥉</div>
            <div className="podium-avatar bronze-av">{top3[2].name[0]?.toUpperCase()}</div>
            <p className="podium-name">{top3[2].name}</p>
            <p className="podium-count">{top3[2].count} reports</p>
            <div className="podium-score">
              <Star size={12} /> {top3[2].score} pts
            </div>
            <div className="podium-pedestal bronze-ped">3</div>
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="lb-controls">
        <div className="lb-search-wrap">
          <MagnifyingGlass size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search citizen…"
            className="lb-search-input"
          />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${sortBy === 'count' ? 'active' : ''}`} onClick={() => setSortBy('count')}>
            By Reports
          </button>
          <button className={`filter-tab ${sortBy === 'score' ? 'active' : ''}`} onClick={() => setSortBy('score')}>
            By Civic Score
          </button>
        </div>
      </div>

      {/* ── Full Table ── */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Rank</th>
              <th>Citizen</th>
              <th>Badge</th>
              <th>Reports</th>
              <th>Resolved</th>
              <th>Civic Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const rank = sorted.indexOf(c);
              return (
                <tr key={c.name} style={c.isMe ? { background: 'rgba(59,130,246,0.06)' } : {}}>
                  <td>
                    <span className={`rank-badge ${rank === 0 ? 'gold' : rank === 1 ? 'silver' : rank === 2 ? 'bronze' : 'other'}`}>
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: rank < 3 ? `${['#fbbf24','#94a3b8','#d97706'][rank]}22` : 'var(--bg-card)',
                        border: `1px solid ${rank < 3 ? ['#fbbf24','#94a3b8','#d97706'][rank] : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700,
                        color: rank < 3 ? ['#fbbf24','#94a3b8','#d97706'][rank] : 'var(--text-muted)',
                      }}>
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: rank < 3 ? 700 : 400, color: 'var(--text-primary)' }}>
                        {c.name} {c.isMe && <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginLeft: 4 }}>You</span>}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: c.badge.color }}>
                      {c.badge.emoji} {c.badge.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{c.count}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{c.resolved}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', minWidth: 50 }}>
                        <div style={{ height: '100%', background: 'var(--accent-amber)', borderRadius: 99,
                          width: `${Math.min((c.score / (sorted[0]?.score || 1)) * 100, 100)}%` }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.85rem', flexShrink: 0 }}>
                        {c.score}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign:'center', padding:'2.5rem', color:'var(--text-muted)' }}>
                  No citizens found matching "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Score explanation */}
      <div style={{
        marginTop: '1.25rem', padding: '1rem 1.25rem',
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
        borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      }}>
        <Star size={16} weight="fill" style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Civic Score</strong> — Resolved reports = 30 pts,
          Under Review = 15 pts, Pending = 10 pts, Rejected = 2 pts. Earn more by submitting quality reports!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;