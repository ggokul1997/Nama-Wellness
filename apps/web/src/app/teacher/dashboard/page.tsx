'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { getAuthUser, clearAuthSession } from '../../../lib/auth-store';

export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const activeUser = getAuthUser();
    if (!activeUser || !activeUser.roles.includes('teacher')) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(activeUser);

    // Fetch profile and check activation status
    api.get('/teacher/profile/me')
      .then((res) => {
        setProfile(res.data);
        if (!res.data?.onboardingFeePaid) {
          window.location.href = '/teacher/onboarding-payment';
        }
      })
      .catch((err) => {
        // Forbidden onboarding gate error also triggers redirect
        if (err.status === 403 || err.status === 404) {
          window.location.href = '/teacher/onboarding-payment';
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogoutClick = () => {
    clearAuthSession();
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            Teacher <span className="text-gradient">Dashboard</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Welcome, {user?.firstName} {user?.lastName}!</p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="btn-secondary"
          style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
        >
          Sign Out
        </button>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '1rem'
      }}>
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>Account Status</div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>Active Profile ✅</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Onboarding payment completed. You are authorized to host classes and create learning contents.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>My Specialities</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {profile?.specialties?.map((spec: string) => (
              <span
                key={spec}
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  color: 'var(--secondary)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>Create Course</button>
            <button className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>Set Availability</button>
          </div>
        </div>
      </section>
    </div>
  );
}
