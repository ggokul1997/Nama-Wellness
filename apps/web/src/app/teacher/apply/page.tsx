'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { getAuthUser } from '../../../lib/auth-store';

const SPECIALTY_OPTIONS = [
  { value: 'yoga', label: 'Yoga & Asanas' },
  { value: 'meditation', label: 'Mindful Meditation' },
  { value: 'breathwork', label: 'Breathwork & Pranayama' },
  { value: 'music', label: 'Vocal & Instrumental Music' },
  { value: 'arts', label: 'Creative Arts & Writing' },
  { value: 'coaching', label: 'Life Coaching & Wellness' }
];

export default function TeacherApplyPage() {
  const [bio, setBio] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = getAuthUser();
    if (!user || !user.roles.includes('teacher')) {
      window.location.href = '/auth/login';
      return;
    }

    // Check if user already submitted application
    api.get('/teacher/applications/me')
      .then((res) => {
        if (res.data) {
          window.location.href = '/teacher/onboarding-payment';
        }
      })
      .catch(() => {
        // App record doesn't exist yet, which is expected
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialties.length === 0) {
      setError('Please select at least one specialty.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/teacher/applications', {
        specialties: selectedSpecialties,
        bio: bio || undefined
      });

      setSuccess('Application submitted successfully! Redirecting to status tracker...');
      setTimeout(() => {
        window.location.href = '/teacher/onboarding-payment';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Checking application status...</p>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Teacher <span className="text-gradient">Application</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Submit your biography and select specialties to apply as a certified Nama Wellness teacher
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Specialties</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {SPECIALTY_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(30, 41, 59, 0.25)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedSpecialties.includes(opt.value) ? 'var(--primary)' : 'rgba(148,163,184,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(opt.value)}
                    onChange={() => handleSpecialtyChange(opt.value)}
                    style={{
                      accentColor: 'var(--primary)',
                      width: '1.1rem',
                      height: '1.1rem'
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="bio-input">Professional Biography (Min 10 characters)</label>
            <textarea
              id="bio-input"
              className="form-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Tell us about your training, credentials, experience, and why you would love to teach on Nama Wellness..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              minLength={10}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
