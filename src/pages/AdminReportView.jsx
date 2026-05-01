// AdminReportView.jsx - Dedicated admin report detail page

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Tag,
  User,
  Calendar,
  Warning,
} from '@phosphor-icons/react';
import mockDB from '../MockDB';

const statusBadge = (status) => {
  const map = {
    Pending: { cls: 'badge pending', label: 'Pending' },
    'Under Review': { cls: 'badge review', label: 'Under Review' },
    Resolved: { cls: 'badge resolved', label: 'Resolved' },
    Rejected: { cls: 'badge rejected', label: 'Rejected' },
  };
  const cfg = map[status] || { cls: 'badge', label: status };
  return <span className={cfg.cls}>{cfg.label}</span>;
};

const AdminReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setLoading(true);
    const data = await mockDB.getReportById(id);
    if (!data) {
      setError('Report not found.');
      setLoading(false);
      return;
    }
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const getChallanAmount = () => {
    const mapping = {
      'Illegal Parking': 500,
      Littering: 300,
      Vandalism: 1200,
      'Noise Violation': 400,
      Other: 350,
    };
    return mapping[report?.type] || 500;
  };

  const handleAccept = async () => {
    await mockDB.updateReport(id, { status: 'Under Review', note: 'Report accepted for challan processing' });
    await loadReport();
  };

  const handleIssueChallan = async () => {
    const amount = getChallanAmount();
    const challan = {
      amount,
      issuedAt: new Date().toISOString(),
      plateNumber: report?.plateNumber || 'N/A',
      location: report?.location || 'N/A',
    };
    await mockDB.updateReport(id, { status: 'Resolved', note: `Challan issued: ₹${amount}`, challan });
    await loadReport();
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1>Loading report...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-header">
        <h1>Admin Report View</h1>
        <p>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1>Report Details</h1>
          <p>Review the report evidence, number plate, and issue a challan from this admin page.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="report-card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>{report.type}</h2>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)' }}>{report.location}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {statusBadge(report.status)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="report-meta-item">
            <span><Tag size={11} style={{ display: 'inline', marginRight: 4 }} />Number Plate</span>
            <strong>{report.plateNumber || 'Not provided'}</strong>
          </div>
          <div className="report-meta-item">
            <span><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />Location</span>
            <strong>{report.location}</strong>
          </div>
          <div className="report-meta-item">
            <span><User size={11} style={{ display: 'inline', marginRight: 4 }} />Reported By</span>
            <strong>{report.submittedBy || 'Citizen'}</strong>
          </div>
          <div className="report-meta-item">
            <span><Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />Submitted At</span>
            <strong>{new Date(report.submittedAt).toLocaleString()}</strong>
          </div>
        </div>

        {report.description && (
          <div className="report-meta-item" style={{ marginTop: '1rem' }}>
            <span>Description</span>
            <strong style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{report.description}</strong>
          </div>
        )}

        {report.lat && report.lng && (
          <div className="report-meta-item" style={{ marginTop: '1rem' }}>
            <span>GPS Coordinates</span>
            <strong>{report.lat}, {report.lng}</strong>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Evidence Photos</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{report.photos?.length || 0} photos attached</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
            {report.photos?.length > 0 ? report.photos.map((photo, index) => (
              <div key={index} style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <img
                  src={photo.src || photo}
                  alt={`Evidence ${index + 1}`}
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <div style={{ padding: '0.75rem', background: 'var(--bg-card)' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{photo.name || `Photo ${index + 1}`}</strong>
                </div>
              </div>
            )) : (
              <div style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                No evidence photos attached.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Warning size={16} />
              <strong>Suggested Challan</strong>
            </div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>₹{getChallanAmount()}</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Issue a fine based on the violation type.</p>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {report.status === 'Pending' && (
              <button className="btn btn-accept" onClick={handleAccept}>
                Accept for Challan
              </button>
            )}
            {report.status === 'Under Review' && (
              <button className="btn btn-accept" onClick={handleIssueChallan}>
                Issue Challan & Resolve
              </button>
            )}
            {report.status === 'Resolved' && report.challan && (
              <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)' }}>
                <strong>Challan issued</strong>
                <p style={{ margin: '0.45rem 0 0', color: 'var(--text-muted)' }}>₹{report.challan.amount} for {report.challan.plateNumber}</p>
              </div>
            )}
            <button className="btn btn-ghost" onClick={() => navigate(`/map/${report.lat || 40.7128}/${report.lng || -74.0060}`, { state: { selectedReport: report } })}>
              View on Map
            </button>
          </div>
        </div>

        {report.updates?.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="section-title">Report Timeline</div>
            <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
              {report.updates.map((update, index) => (
                <div key={index} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                    <strong>{update.status}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(update.timestamp).toLocaleString()}</span>
                  </div>
                  {update.note && (
                    <p style={{ margin: '0.45rem 0 0', color: 'var(--text-secondary)' }}>{update.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportView;
