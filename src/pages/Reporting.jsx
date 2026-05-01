// Reporting.jsx — Multi-Step Violation Submission Wizard

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Warning, MapPin, Camera, CheckCircle,
  ArrowRight, ArrowLeft, UploadSimple,
  NavigationArrow, Crosshair, X, Sparkle
} from '@phosphor-icons/react';
import { useAppContext } from '../useAppContext.js';
import mockDB from '../MockDB';

/* ── violation types with icons ── */
const violationTypes = [
  { value: 'Illegal Parking',  label: 'Illegal Parking',  icon: '🚗', color: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)' },
  { value: 'Littering',        label: 'Littering',        icon: '🗑️', color: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)' },
  { value: 'Vandalism',        label: 'Vandalism',        icon: '🔨', color: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.35)' },
  { value: 'Noise Violation',  label: 'Noise Violation',  icon: '📢', color: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)' },
  { value: 'Other',            label: 'Other',            icon: '⚠️', color: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.35)' },
];

const STEPS = ['Violation', 'Location & Evidence', 'Review & Submit'];

const EMPTY = { type: '', location: '', description: '', lat: '', lng: '', plateNumber: '', photos: [] };

/* ═══════════════════════════════════════════ */
const Reporting = () => {
  const { user } = useAppContext();
  const [step, setStep]         = useState(0);
  const [formData, setFormData] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [dragOver, setDragOver]    = useState(false);
  const [charCount, setCharCount]  = useState(0);
  const fileRef = useRef();

  /* helpers */
  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));
  const handleChange = e => {
    set(e.target.name, e.target.value);
    if (e.target.name === 'description') setCharCount(e.target.value.length);
  };

  const loadPhotos = (files) => {
    if (!files?.length) return;
    const images = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, 4 - formData.photos.length);
    images.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setFormData(p => ({
        ...p,
        photos: [...p.photos, { src: reader.result, name: file.name }]
      }));
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    loadPhotos(e.dataTransfer.files);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFormData(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  };

  /* step navigation */
  const canNext = () => {
    if (step === 0) return formData.type && formData.description.trim().length >= 10 && formData.plateNumber.trim().length > 0;
    if (step === 1) return formData.location.trim().length > 0 && formData.photos.length === 4;
    return true;
  };

  const handleSubmit = async () => {
    const payload = {
      type: formData.type,
      location: formData.location,
      description: formData.description,
      lat: formData.lat,
      lng: formData.lng,
      plateNumber: formData.plateNumber,
      photos: formData.photos,
      submittedBy: user?.name || user?.id || 'Citizen',
    };
    const report = await mockDB.addReport(payload);
    setSubmitted(report);
  };

  const reset = () => { setFormData(EMPTY); setStep(0); setSubmitted(null); setCharCount(0); };

  /* ── SUCCESS SCREEN ── */
  if (submitted) {
    return (
      <div className="report-success-screen">
        <div className="success-icon-ring">
          <CheckCircle size={52} weight="fill" style={{ color: 'var(--accent-green)' }} />
        </div>
        <h1>Report Submitted! 🎉</h1>
        <p>Your violation report has been filed and is now under review by our enforcement team.</p>

        <div className="success-id-card">
          <span>Your Report ID</span>
          <code>{submitted.id}</code>
          <button
            className="btn-ghost"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => navigator.clipboard.writeText(submitted.id)}
          >Copy</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Save your Report ID to track status updates on the Track page.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link to="/track" className="btn">
            <NavigationArrow size={15} /> Track This Report
          </Link>
          <button className="btn-ghost" onClick={reset}>Submit Another</button>
        </div>
      </div>
    );
  }

  /* ── WIZARD ── */
  return (
    <div>
      <div className="page-header">
        <h1>Report a Violation</h1>
        <p>Submit park violation details in 3 quick steps for official enforcement action.</p>
      </div>

      {/* Step indicator */}
      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="wizard-step-dot">
                {i < step ? <CheckCircle size={14} weight="fill" /> : i + 1}
              </div>
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`wizard-connector ${i < step ? 'done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 0: Violation Details ── */}
      {step === 0 && (
        <div className="wizard-card">
          <div className="wizard-card-header">
            <Warning size={20} weight="fill" style={{ color: 'var(--accent-red)' }} />
            <span>Violation Details</span>
          </div>

          <div className="form-group">
            <label>Violation Type *</label>
            <div className="violation-type-grid">
              {violationTypes.map(v => (
                <button
                  key={v.value}
                  type="button"
                  className={`violation-type-btn ${formData.type === v.value ? 'selected' : ''}`}
                  style={formData.type === v.value
                    ? { background: v.color, borderColor: v.border }
                    : {}}
                  onClick={() => set('type', v.value)}
                >
                  <span className="vtype-icon">{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="plateNumber">Vehicle Number Plate *</label>
            <input
              type="text" id="plateNumber" name="plateNumber"
              value={formData.plateNumber} onChange={handleChange}
              placeholder="e.g., KA01AB1234"
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Capture the full number plate so the enforcement team can identify the vehicle immediately.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description *
              <span className={`char-count ${charCount < 10 ? 'warn' : ''}`}>{charCount}/500</span>
            </label>
            <textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              rows={4} maxLength={500}
              placeholder="Describe the violation in detail — vehicle make/colour, time, people involved…"
            />
            {charCount < 10 && charCount > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginTop: '0.3rem' }}>
                ⚠ Please add at least 10 characters.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 1: Location & Evidence ── */}
      {step === 1 && (
        <div className="wizard-card">
          <div className="wizard-card-header">
            <MapPin size={20} weight="fill" style={{ color: 'var(--accent-cyan)' }} />
            <span>Location &amp; Evidence</span>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text" id="location" name="location"
              value={formData.location} onChange={handleChange}
              placeholder="e.g., Main St & 1st Ave, Central Park North Gate"
            />
          </div>

          <div className="form-group">
            <label>GPS Coordinates <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }} htmlFor="lat">Latitude</label>
                <input type="number" id="lat" name="lat" value={formData.lat} onChange={handleChange}
                  step="any" placeholder="40.7128" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }} htmlFor="lng">Longitude</label>
                <input type="number" id="lng" name="lng" value={formData.lng} onChange={handleChange}
                  step="any" placeholder="-74.0060" />
              </div>
              <button
                type="button" className="btn-ghost detect-btn"
                onClick={detectLocation} disabled={locLoading}
                title="Detect my location"
              >
                {locLoading
                  ? <span className="spin-icon">⌛</span>
                  : <Crosshair size={16} weight="bold" />}
                {locLoading ? 'Detecting…' : 'Auto-Detect'}
              </button>
            </div>
            {formData.lat && formData.lng && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '0.4rem' }}>
                ✓ GPS coordinates captured: {formData.lat}, {formData.lng}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Photo Evidence <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(required, 4 views)</span></label>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Capture the vehicle from all sides: front, rear, left, and right.
            </p>
            <div className="photo-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`photo-slot ${formData.photos[index] ? 'filled' : ''}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {formData.photos[index] ? (
                    <>
                      <img src={formData.photos[index].src} alt={`Evidence ${index + 1}`} />
                      <span>{formData.photos[index].name}</span>
                    </>
                  ) : (
                    <>
                      <Camera size={24} style={{ marginBottom: '0.5rem' }} />
                      <strong>Upload view {index + 1}</strong>
                    </>
                  )}
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple
              onChange={e => loadPhotos(e.target.files)}
              style={{ display: 'none' }} />
            <p style={{ fontSize: '0.78rem', color: formData.photos.length === 4 ? 'var(--accent-green)' : 'var(--accent-amber)', marginTop: '0.55rem' }}>
              {formData.photos.length === 4
                ? 'All four photos are attached.'
                : `${formData.photos.length}/4 photos attached`}
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 2: Review ── */}
      {step === 2 && (
        <div className="wizard-card">
          <div className="wizard-card-header">
            <Sparkle size={20} weight="fill" style={{ color: 'var(--accent-violet)' }} />
            <span>Review &amp; Submit</span>
          </div>

          <div className="review-grid">
            <div className="review-row">
              <span>Violation Type</span>
              <strong>
                {violationTypes.find(v => v.value === formData.type)?.icon} {formData.type}
              </strong>
            </div>
            <div className="review-row">
              <span>Location</span>
              <strong>{formData.location}</strong>
            </div>
            <div className="review-row">
              <span>Number Plate</span>
              <strong>{formData.plateNumber || 'Not provided'}</strong>
            </div>
            {formData.lat && (
              <div className="review-row">
                <span>GPS</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {formData.lat}, {formData.lng}
                </strong>
              </div>
            )}
            <div className="review-row">
              <span>Description</span>
              <strong style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{formData.description}</strong>
            </div>
            <div className="review-row">
              <span>Photos</span>
              <strong>{formData.photos.length === 4 ? '✓ 4 photos attached' : `${formData.photos.length}/4 photos`}</strong>
            </div>
          </div>

          {formData.photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.85rem', marginTop: '1rem' }}>
              {formData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.src}
                  alt={`Evidence ${index + 1}`}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-subtle)' }}
                />
              ))}
            </div>
          )}

          <div className="review-notice">
            <CheckCircle size={15} weight="fill" style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>By submitting, you confirm this report is accurate and submitted in good faith.</span>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="wizard-nav">
        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
            <ArrowLeft size={15} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <button className="btn" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button className="btn" onClick={handleSubmit} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
            <CheckCircle size={15} weight="fill" /> Submit Report
          </button>
        )}
      </div>
    </div>
  );
};

export default Reporting;