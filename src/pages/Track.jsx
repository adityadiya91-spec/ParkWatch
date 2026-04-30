// Track.jsx — Enhanced Report Tracker with Browse Mode

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass, MapPin, Tag, User, Calendar,
  Clock, CheckCircle, XCircle, Spinner,
  Binoculars, Funnel, ArrowRight
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import mockDB from '../MockDB';

/* ── status config ── */
const STATUS = {
  'Pending':      { color: 'var(--accent-amber)',  icon: <Clock      size={15} weight="fill" />, cls: 'badge pending'  },
  'Under Review': { color: 'var(--accent-blue)',   icon: <Spinner    size={15} weight="fill" />, cls: 'badge review' },
  'Resolved':     { color: 'var(--accent-green)',  icon: <CheckCircle size={15} weight="fill" />, cls: 'badge resolved' },
  'Rejected':     { color: 'var(--accent-red)',    icon: <XCircle    size={15} weight="fill" />, cls: 'badge rejected' },
};

const getStatus = (s) => STATUS[s] || STATUS['Pending'];

/* ── Timeline dot ── */
const TimelineDot = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <div style={{
      position: 'absolute', left: '-1.7rem', top: '0.3rem',
      width: 24, height: 24, borderRadius: '50%',
      background: `${cfg.color}22`,
      border: `2px solid ${cfg.color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: cfg.color,
      boxShadow: `0 0 10px ${cfg.color}44`,
    }}>
      {cfg.icon}
    </div>
  );
};

/* ═══════════════════════════════════════════ */
const Track = () => {
  const [reportId, setReportId]   = useState('');
  const [report, setReport]       = useState(null);
  const [searched, setSearched]   = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [filter, setFilter]       = useState('all');

  useEffect(() => { mockDB.getReports().then(setAllReports); }, []);

  const handleSearch = async () => {
    if (!reportId.trim()) return;
    const r = await mockDB.getReportById(reportId.trim().toUpperCase());
    setReport(r);
    setSearched(true);
  };

  const clearSearch = () => { setReportId(''); setReport(null); setSearched(false); };

  const filtered = filter === 'all'
    ? allReports
    : allReports.filter(r => r.status === filter);

  /* ── FORMAT STATUS for table ── */
  const statusBadge = (s) => {
    const c = getStatus(s);
    return <span className={c.cls}>{c.icon} {s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Track Your Report</h1>
        <p>Search by Report ID or browse all reports below.</p>
      </div>

      {/* ── Search bar ── */}
      <div className="track-hero-search">
        <div className="track-search-input-wrap">
          <Binoculars size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          <input
            type="text" value={reportId}
            onChange={e => setReportId(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter Report ID — e.g., PW001"
            className="track-search-input"
          />
          {reportId && (
            <button className="track-clear-btn" onClick={clearSearch} title="Clear">✕</button>
          )}
        </div>
        <button className="btn" onClick={handleSearch}>
          <MagnifyingGlass size={16} weight="bold" /> Search
        </button>
      </div>

      {/* ── Search Result ── */}
      {searched && !report && (
        <div className="track-not-found">
          <XCircle size={36} style={{ color: 'var(--accent-red)', marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Report not found</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Double-check the ID and try again. Report IDs look like PW001, PW002…
          </p>
        </div>
      )}

      {report && (
        <div className="track-result" style={{ marginBottom: '2rem' }}>
          {/* Report header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${getStatus(report.status).color}18`,
              border: `1px solid ${getStatus(report.status).color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: getStatus(report.status).color, flexShrink: 0,
            }}>
              {getStatus(report.status).icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                  Report <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{report.id}</span>
                </h2>
                {statusBadge(report.status)}
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                Filed {new Date(report.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
              </p>
            </div>
          </div>

          {/* Meta grid */}
          <div className="report-meta-grid">
            <div className="report-meta-item">
              <span><Tag size={11} style={{ display:'inline', marginRight:4 }} />Violation Type</span>
              <strong>{report.type}</strong>
            </div>
            <div className="report-meta-item">
              <span><MapPin size={11} style={{ display:'inline', marginRight:4 }} />Location</span>
              <strong>{report.location}</strong>
            </div>
            <div className="report-meta-item">
              <span><User size={11} style={{ display:'inline', marginRight:4 }} />Submitted By</span>
              <strong>{report.submittedBy || '—'}</strong>
            </div>
            <div className="report-meta-item">
              <span><Calendar size={11} style={{ display:'inline', marginRight:4 }} />Submitted At</span>
              <strong>{new Date(report.submittedAt).toLocaleString()}</strong>
            </div>
          </div>

          {report.description && (
            <div className="report-meta-item" style={{ marginTop: '0.75rem' }}>
              <span>Description</span>
              <strong style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {report.description}
              </strong>
            </div>
          )}

          {/* Photo */}
          {report.photo && (
            <div style={{ marginTop: '1.25rem' }}>
              <p className="section-title" style={{ marginBottom: '0.5rem' }}>Photo Evidence</p>
              <img src={report.photo} alt="Report evidence"
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 14,
                  border: '1px solid var(--border-subtle)' }} />
            </div>
          )}

          {/* Timeline */}
          <div className="section-title" style={{ marginTop: '1.75rem' }}>Status Timeline</div>
          <div className="timeline" style={{ marginTop: '1rem' }}>
            {report.updates.map((u, i) => (
              <div key={i} className="timeline-item" style={{ paddingBottom: i < report.updates.length - 1 ? '1.25rem' : 0 }}>
                <TimelineDot status={u.status} />
                <div className="timeline-bubble">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h4 style={{ color: getStatus(u.status).color, margin: 0 }}>{u.status}</h4>
                    {i === report.updates.length - 1 && (
                      <span style={{ fontSize: '0.68rem', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
                        padding: '0.1rem 0.45rem', borderRadius: 99, fontWeight: 700 }}>Latest</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(u.timestamp).toLocaleString()}
                  </p>
                  {u.note && (
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {u.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="btn-ghost" style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
            onClick={clearSearch}>
            ← Search another report
          </button>
        </div>
      )}

      {/* ── Browse All Reports ── */}
      {!report && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div className="section-title" style={{ margin: 0, border: 0, paddingBottom: 0 }}>
              <Funnel size={15} weight="fill" style={{ display:'inline', marginRight:6, color:'var(--accent-blue)' }} />
              Browse All Reports
              <span className="mini-badge" style={{ marginLeft: '0.5rem' }}>{filtered.length}</span>
            </div>
            <div className="filter-tabs">
              {['all','Pending','Under Review','Resolved','Rejected'].map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="browse-cards">
            {filtered.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No reports match this filter.
              </p>
            )}
            {filtered.map(r => {
              const cfg = getStatus(r.status);
              return (
                <div key={r.id} className="browse-report-card">
                  <div className="browse-report-left">
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${cfg.color}18`,
                      border: `1px solid ${cfg.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cfg.color, flexShrink: 0,
                    }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily:'monospace', color:'var(--accent-cyan)', fontWeight:700, fontSize:'0.85rem' }}>{r.id}</span>
                        {statusBadge(r.status)}
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.type}</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MapPin size={10} style={{ display:'inline', marginRight:3 }} />{r.location}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </p>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                      onClick={async () => { 
                        setReportId(r.id); 
                        const details = await mockDB.getReportById(r.id);
                        setReport(details); 
                        setSearched(true); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }}
                    >
                      Details <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Track;