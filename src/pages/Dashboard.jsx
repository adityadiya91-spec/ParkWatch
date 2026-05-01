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
  const [selectedReports, setSelectedReports] = useState(new Set());

  useEffect(() => { mockDB.getReports().then(setReports); }, []);
  const refreshReports = async () => {
    const updated = await mockDB.getReports();
    setReports(updated);
    setSelectedReports(new Set()); // Clear selections after refresh
  };

  const getChallanAmount = (report) => {
    const mapping = {
      'Illegal Parking': 500,
      'Littering': 300,
      'Vandalism': 1200,
      'Noise Violation': 400,
      'Other': 350,
    };
    return mapping[report?.type] || 500;
  };

  const handleAction = async (id, action) => {
    const note = action === 'Resolved'
      ? 'Violation accepted and marked resolved.'
      : 'Violation rejected by administrator.';
    await mockDB.updateReport(id, { status: action, note });
    await refreshReports();
  };

  const handleBulkAction = async (action) => {
    if (selectedReports.size === 0) return;
    const note = action === 'Resolved'
      ? 'Bulk action: Violation accepted and marked resolved.'
      : 'Bulk action: Violation rejected by administrator.';
    const promises = Array.from(selectedReports).map(id =>
      mockDB.updateReport(id, { status: action, note })
    );
    await Promise.all(promises);
    await refreshReports();
  };

  const toggleSelectReport = (id) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReports(newSelected);
  };

  const selectAll = () => {
    if (selectedReports.size === reports.slice(0, 10).length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(reports.slice(0, 10).map(r => r.id)));
    }
  };

  const handleReview = (report) => {
    navigate(`/admin/report/${report.id}`);
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

      {selectedReports.size > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {selectedReports.size} report{selectedReports.size > 1 ? 's' : ''} selected
          </span>
          <button className="btn btn-accept" onClick={() => handleBulkAction('Resolved')}>
            Bulk Resolve
          </button>
          <button className="btn btn-reject" onClick={() => handleBulkAction('Rejected')}>
            Bulk Reject
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedReports.size === reports.slice(0, 10).length && reports.slice(0, 10).length > 0}
                  onChange={selectAll}
                />
              </th>
              <th>ID</th>
              <th>Type</th>
              <th>Plate</th>
              <th>Location</th>
              <th>Evidence</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 20).map(report => (
              <tr key={report.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReports.has(report.id)}
                    onChange={() => toggleSelectReport(report.id)}
                  />
                </td>
                <td><span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>{report.id}</span></td>
                <td>{report.type}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>{report.plateNumber || 'N/A'}</td>
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
                <td>
                  {report.photos?.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {report.photos.slice(0, 2).map((photo, index) => (
                        <img
                          key={index}
                          src={typeof photo === 'string' ? photo : photo?.src}
                          alt={`Evidence ${index + 1}`}
                          style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-subtle)' }}
                        />
                      ))}
                      {report.photos.length > 2 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          +{report.photos.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No photo</span>
                  )}
                </td>
                <td>{statusBadge(report.status)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(report.submittedAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => handleReview(report)}>
                      {report.status === 'Pending' ? 'Review' : 'View'}
                    </button>
                    {(report.status === 'Pending' || report.status === 'Under Review') && (
                      <button className="btn btn-reject" onClick={() => handleAction(report.id, 'Rejected')}>
                        Reject
                      </button>
                    )}
                  </div>
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