// Map.jsx - Interactive Leaflet Violation Map

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import { useParams, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import mockDB from '../MockDB';

const Map = () => {
  const { lat, lng } = useParams();
  const locationState = useLocation().state;
  const selectedReport = locationState?.selectedReport;
  const [reports, setReports] = useState([]);

  const centerLat = lat ? parseFloat(lat) : 40.7128;
  const centerLng = lng ? parseFloat(lng) : -74.0060;

  useEffect(() => {
    mockDB.getReports().then(setReports);
  }, []);

  const pending  = reports.filter(r => r.status !== 'Resolved').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="map-page-wrapper">
      <div className="page-header">
        <h1>Violation Map</h1>
        <p>Interactive heatmap showing reported violations across the city.</p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Pending / Active ({pending})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Resolved ({resolved})</span>
        </div>
      </div>

      <div id="map">
        <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Highlight the selected report if coming from dashboard */}
          {selectedReport && (
            <Marker 
              position={[selectedReport.lat || centerLat, selectedReport.lng || centerLng]}
              title="Selected Report"
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: '#10b981' }}>📍 Selected Report</strong>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{selectedReport.type}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#555' }}>{selectedReport.location}</span><br />
                  {selectedReport.plateNumber && (
                    <span style={{ fontSize: '0.82rem', color: '#555' }}>Plate: {selectedReport.plateNumber}</span>
                  )}<br />
                  <span style={{ fontSize: '0.82rem', color: '#555' }}>Status: {selectedReport.status}</span><br />
                  <code style={{ fontSize: '0.78rem', color: '#888' }}>{selectedReport.id}</code>
                </div>
              </Popup>
            </Marker>
          )}
          {reports.map(report => (
            <Circle
              key={report.id}
              center={[report.lat || 40.7128, report.lng || -74.0060]}
              radius={120}
              color={report.status === 'Resolved' ? '#10b981' : '#ef4444'}
              fillColor={report.status === 'Resolved' ? '#10b981' : '#ef4444'}
              fillOpacity={0.45}
              weight={2}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{report.type}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#555' }}>{report.location}</span><br />
                  {report.plateNumber && (
                    <span style={{ fontSize: '0.82rem', color: '#555' }}>Plate: {report.plateNumber}</span>
                  )}<br />
                  <span style={{ fontSize: '0.82rem', color: '#555' }}>Status: {report.status}</span><br />
                  <code style={{ fontSize: '0.78rem', color: '#888' }}>{report.id}</code>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;