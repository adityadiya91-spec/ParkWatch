// DataPortal.jsx - Open Data, Filters, CSV Export

import React, { useState, useEffect } from 'react';
import { DownloadSimple, Funnel } from '@phosphor-icons/react';
import mockDB from '../MockDB';

const DataPortal = () => {
  const [filter, setFilter] = useState('');
  const [reports, setReports] = useState([]);

  useEffect(() => {
    mockDB.getReports().then(setReports);
  }, []);

  const filteredReports = reports.filter(report =>
    report.type.toLowerCase().includes(filter.toLowerCase()) ||
    report.location.toLowerCase().includes(filter.toLowerCase()) ||
    report.status.toLowerCase().includes(filter.toLowerCase())
  );

  const handleExport = () => { mockDB.exportToCSV(); };

  const statusBadge = (status) => {
    const map = {
      'Pending':      'badge pending',
      'Under Review': 'badge review',
      'Resolved':     'badge resolved',
      'Rejected':     'badge rejected',
    };
    return <span className={map[status] || 'badge'}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Data Portal</h1>
        <p>Open data portal for ParkWatch reports — filter, search, and export records.</p>
      </div>

      {/* Controls */}
      <div className="portal-controls">
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <label htmlFor="filter">
            <Funnel size={13} style={{ display: 'inline', marginRight: 5 }} />
            Filter Reports
          </label>
          <input
            type="text" id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by type, location, or status…"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleExport} className="btn">
            <DownloadSimple size={16} weight="bold" /> Export CSV
          </button>
        </div>
      </div>

      {/* Result count */}
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Showing {filteredReports.length} of {reports.length} records
      </p>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Submitted By</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td><span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>{report.id}</span></td>
                <td>{report.type}</td>
                <td>{report.location}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.description}</td>
                <td>{statusBadge(report.status)}</td>
                <td>{report.submittedBy}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(report.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPortal;