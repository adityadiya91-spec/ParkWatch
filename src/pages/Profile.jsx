// Profile.jsx - User Profile Page

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../useAppContext.js';
import { MapPin, Phone, Calendar, User, User as UserIcon, Shield } from '@phosphor-icons/react';

const Profile = () => {
  const { user, role, authenticated } = useAppContext();
  const [locality, setLocality] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    
    // Get user's current location
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simulate locality based on coordinates
          const localities = {
            '40.7128,-74.0060': 'Downtown Manhattan',
            '40.7580,-73.9855': 'Midtown East',
            '40.7489,-73.9680': 'Upper East Side',
            '40.8088,-73.9282': 'Harlem',
          };
          
          const nearestLocality = Object.entries(localities).reduce((closest, [coords, name]) => {
            const [lat, lng] = coords.split(',').map(Number);
            const distance = Math.sqrt((latitude - lat) ** 2 + (longitude - lng) ** 2);
            return distance < (closest.distance || Infinity) ? { name, distance } : closest;
          }, {});
          
          setLocality({
            name: nearestLocality.name || 'Unknown Area',
            lat: latitude,
            lng: longitude,
          });
          setLoadingLocation(false);
        },
        () => {
          setLocality({
            name: 'Location access denied - Using default area',
            lat: 40.7128,
            lng: -74.0060,
          });
          setLoadingLocation(false);
        }
      );
    }
  }, [authenticated]);

  if (!authenticated) {
    return <div className="page-center"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>User Profile</h1>
        <p>Your account information and preferences</p>
      </div>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            {role === 'Admin' ? (
              <Shield size={48} weight="fill" style={{ color: 'var(--accent-violet)' }} />
            ) : (
              <UserIcon size={48} weight="fill" style={{ color: 'var(--accent-cyan)' }} />
            )}
            <div>
              <h2>{user?.name || user?.id || 'User'}</h2>
              <p className="role-badge" style={{ color: role === 'Admin' ? 'var(--accent-violet)' : 'var(--accent-cyan)' }}>
                {role}
              </p>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">
                <User size={16} /> Name
              </span>
              <span className="info-value">{user?.name || user?.id || 'N/A'}</span>
            </div>

            {user?.mobile && (
              <div className="info-row">
                <span className="info-label">
                  <Phone size={16} /> Mobile
                </span>
                <span className="info-value">+{user.mobile}</span>
              </div>
            )}

            {user?.createdAt && (
              <div className="info-row">
                <span className="info-label">
                  <Calendar size={16} /> Member Since
                </span>
                <span className="info-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="info-row">
              <span className="info-label">
                <MapPin size={16} /> Current Location
              </span>
              <span className="info-value">
                {loadingLocation ? 'Detecting...' : locality?.name || 'Location not available'}
              </span>
            </div>

            {locality && !loadingLocation && (
              <div className="info-row">
                <span className="info-label">
                  <MapPin size={16} /> Coordinates
                </span>
                <span className="info-value" style={{ fontSize: '0.9rem' }}>
                  {locality.lat.toFixed(4)}, {locality.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="profile-section">
          <h3>Account Type</h3>
          <p>
            {role === 'Admin'
              ? 'You are an administrator with full access to violation reports and enforcement tools.'
              : 'You are a citizen with the ability to report park violations and track your reports.'}
          </p>
        </div>

        {/* Nearest Office Info */}
        <div className="profile-section">
          <h3>Nearest Enforcement Office</h3>
          {locality ? (
            <div>
              <p>
                <strong>Location:</strong> {locality.name}
              </p>
              <p>
                <strong>Coordinates:</strong> {locality.lat.toFixed(4)}, {locality.lng.toFixed(4)}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Complaints reported from your area are routed to the nearest enforcement office.
              </p>
            </div>
          ) : (
            <p>Loading location information...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
