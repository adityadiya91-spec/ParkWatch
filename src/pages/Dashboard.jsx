// Dashboard.jsx - Admin Dashboard & Stats

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBar, CheckCircle, XCircle, Clock, MapPin } from '@phosphor-icons/react';
import mockDB from '../MockDB';

const statusBadge = (status) => {
  const map = {
    'Pending':      { cls: 'badge pending',  label: 'Pending' },
    'Under Review': { cls: 'badge review',   label: 'Under Review' },
    'Resolved':     { cls: 'badge resolved', label: 'Resolved' },
    'Rejected':     { cls: 'badge rejected', label: 'Rejected' },
  };
  const b = map[status] || { cls: 'badge', label: status };
  return <span className={b.cls}>{b.label}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => { mockDB.getReports().then(setReports); }, []);
  const refreshReports = () => mockDB.getReports().then(setReports);

  const handleAction = (id, action) => {
    const note = action === 'Resolved'
      ? 'Violation accepted and marked resolved.'
      : 'Violation rejected by administrator.';
    mockDB.updateReport(id, { status: action, note }).then(() => refreshReports());
    refreshReports();
  };

  const handleLocationClick = (report) => {
    const lat = report.lat || 40.7128;
    const lng = report.lng || -74.0060;
    navigate(`/map/${lat}/${lng}`, { state: { selectedReport: report } });
  };

  const total    = reports.length;
  const pending  = reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const rejected = reports.filter(r => r.status === 'Rejected').length;

  const stats = [
    { label: 'Total Reports', value: total,    cls: 'total',    icon: <ChartBar size={18} /> },
    { label: 'Pending',       value: pending,  cls: 'pending',  icon: <Clock    size={18} /> },
    { label: 'Resolved',      value: resolved, cls: 'resolved', icon: <CheckCircle size={18} /> },
    { label: 'Rejected',      value: rejected, cls: 'rejected', icon: <XCircle  size={18} /> },
  ];

  return (
    <div>
      {/* header */}
      <div className="admin-tag">
        <span>🛡 Admin Dashboard — Demo Version</span>
        <span className="admin-tag-subtitle">Manage park violation reports and enforcement actions</span>
      </div>

      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of ParkWatch enforcement statistics and pending actions.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <h3>{s.label}</h3>
            <p>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="section-title" style={{ marginTop: '2rem' }}>Recent Reports</div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 10).map(report => (
              <tr key={report.id}>
                <td><span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>{report.id}</span></td>
                <td>{report.type}</td>
                <td>
                  <button
                    onClick={() => handleLocationClick(report)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    title="Click to view on map"
                  >
                    <MapPin size={14} />
                    {report.location}
                  </button>
                </td>
                <td>{statusBadge(report.status)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(report.submittedAt).toLocaleDateString()}</td>
                <td>
                  {(report.status === 'Pending' || report.status === 'Under Review') ? (
                    <div className="action-buttons">
                      <button className="btn btn-accept" onClick={() => handleAction(report.id, 'Resolved')}>Accept</button>
                      <button className="btn btn-reject" onClick={() => handleAction(report.id, 'Rejected')}>Reject</button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;