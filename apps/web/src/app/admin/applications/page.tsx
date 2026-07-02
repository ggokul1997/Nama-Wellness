'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { getAuthUser, clearAuthSession } from '../../../lib/auth-store';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, under_review, interview_scheduled, approved, rejected
  const [user, setUser] = useState<any>(null);

  const fetchApplications = async (statusFilter: string) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = statusFilter === 'all' 
        ? '/teacher/applications' 
        : `/teacher/applications?status=${statusFilter}`;
      
      const res = await api.get(endpoint);
      setApplications(res.data || res);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        window.location.href = '/auth/login';
        return;
      }
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeUser = getAuthUser();
    if (!activeUser || !activeUser.roles.includes('admin')) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(activeUser);
    fetchApplications(activeTab);
  }, [activeTab]);

  const handleLogoutClick = () => {
    clearAuthSession();
    window.location.href = '/auth/login';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'rejected':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'pending':
        return { background: 'rgba(234, 179, 8, 0.1)', color: '#fef08a', border: '1px solid rgba(234, 179, 8, 0.2)' };
      default:
        return { background: 'rgba(99, 102, 241, 0.1)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.2)' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            Admissions <span className="text-gradient">Console</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Manage teacher registrations and professional onboarding applications</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Admin: {user?.firstName}</span>
          <button
            onClick={handleLogoutClick}
            className="btn-secondary"
            style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Tabs Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['all', 'pending', 'under_review', 'interview_scheduled', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
              border: activeTab === tab ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', textAlign: 'center', marginTop: '3rem' }}>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No teacher applications found for the selected filter.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {applications.map((appItem) => (
            <div key={appItem.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                  ID: {appItem.id.substring(0, 8)}...
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    ...getStatusBadgeStyle(appItem.status)
                  }}
                >
                  {appItem.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Biography</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {appItem.bio || 'No bio submitted.'}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#cbd5e1' }}>Specialties</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {appItem.specialties.map((spec: string) => (
                    <span
                      key={spec}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        textTransform: 'capitalize'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Submitted: {new Date(appItem.submittedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => window.location.href = `/admin/applications/${appItem.id}`}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
