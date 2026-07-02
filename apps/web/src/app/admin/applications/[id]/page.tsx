'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { getAuthUser } from '../../../../lib/auth-store';

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [interviewDate, setInterviewDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchApplicationDetails = async () => {
    try {
      const res = await api.get(`/teacher/applications/${id}`);
      setApp(res.data || res);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        window.location.href = '/auth/login';
        return;
      }
      setError(err.message || 'Failed to fetch application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getAuthUser();
    if (!user || !user.roles.includes('admin')) {
      window.location.href = '/auth/login';
      return;
    }
    fetchApplicationDetails();
  }, [id]);

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      setError('Please select a date and time for the interview.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const isoDate = new Date(interviewDate).toISOString();
      await api.post(`/teacher/applications/${id}/interviews`, {
        scheduledAt: isoDate
      });
      setSuccess('Interview scheduled successfully!');
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/teacher/applications/${id}/approve`, {
        notes: adminNotes || undefined
      });
      setSuccess('Teacher application approved successfully!');
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to approve application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason) {
      setError('Rejection reason is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/teacher/applications/${id}/reject`, {
        reason: rejectionReason,
        notes: adminNotes || undefined
      });
      setSuccess('Application rejected successfully.');
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to reject application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyDoc = async (docId: string, verifyStatus: boolean) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/teacher/applications/${id}/documents/${docId}/verify`, {
        verified: verifyStatus
      });
      setSuccess(`Document marked as ${verifyStatus ? 'Verified' : 'Unverified'}!`);
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to verify document.');
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading application details...</p>
      </div>
    );
  }

  if (error && !app) {
    return (
      <div className="auth-container">
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', textAlign: 'center' }}>
          <div className="alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>
          <button onClick={() => window.location.href = '/admin/applications'} className="btn-secondary">
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <button 
            onClick={() => window.location.href = '/admin/applications'}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}
          >
            ← Back to Applications List
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            Application <span className="text-gradient">Review</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Review biographical statements, verify credentials, and schedule final decisions</p>
        </div>
      </header>

      {error && <div className="alert-danger">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Profile Details */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Applicant Info</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>User ID: {app.userId}</p>
            </div>
            <span style={{
              alignSelf: 'center',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              color: app.status === 'approved' ? '#a7f3d0' : app.status === 'rejected' ? '#fca5a5' : '#fef08a',
              border: app.status === 'approved' ? '1px solid rgba(16, 185, 129, 0.2)' : app.status === 'rejected' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)'
            }}>
              {app.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Biography</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {app.bio || 'No biography submitted.'}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Chosen Specialties</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {app.specialties.map((spec: string) => (
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
          </div>
        </div>

        {/* Credentials & Verification Documents */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Verification Certificates & Documents
          </h2>
          {(!app.documents || app.documents.length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No verification documents uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {app.documents.map((doc: any) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doc.fileName}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Type: {doc.documentType.toUpperCase()} | Size: {(doc.fileSizeBytes / 1024).toFixed(1)} KB</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      View File
                    </a>
                    {doc.verified ? (
                      <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>Verified ✓</span>
                    ) : (
                      <button
                        onClick={() => handleVerifyDoc(doc.id, true)}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#059669' }}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {app.status !== 'approved' && app.status !== 'rejected' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* Interview Scheduler */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                Schedule Interview
              </h2>
              <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="interview-date" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    id="interview-date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
                >
                  {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </form>
            </div>

            {/* Decision Portal */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                Onboarding Decision
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="admin-notes" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>Decision Notes (Private)</label>
                  <textarea
                    id="admin-notes"
                    placeholder="Enter private review evaluation notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleApprove}
                    className="btn-primary"
                    disabled={submitting}
                    style={{ flex: 1, background: '#10b981', color: '#ffffff' }}
                  >
                    Approve Application
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ef4444' }}>Reject Application</h3>
                  <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Specify rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-secondary"
                      disabled={submitting}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      Reject Application
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
