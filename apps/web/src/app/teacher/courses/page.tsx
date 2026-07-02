'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { getAuthUser, clearAuthSession } from '../../../lib/auth-store';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchCourses = async (userId: string) => {
    try {
      const res = await api.get(`/courses?teacherId=${userId}`);
      setCourses(res.data?.courses || res.data || res);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        window.location.href = '/auth/login';
        return;
      }
      setError('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeUser = getAuthUser();
    if (!activeUser || !activeUser.roles.includes('teacher')) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(activeUser);

    // Verify activation before listing courses
    api.get('/teacher/profile/me')
      .then((res) => {
        if (!res.data?.onboardingFeePaid) {
          window.location.href = '/teacher/onboarding-payment';
        } else {
          fetchCourses(activeUser.id);
        }
      })
      .catch((err) => {
        if (err.status === 403 || err.status === 404) {
          window.location.href = '/teacher/onboarding-payment';
        } else {
          setError('Failed to verify profile activation status.');
          setLoading(false);
        }
      });
  }, []);

  const handleLogoutClick = () => {
    clearAuthSession();
    window.location.href = '/auth/login';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'published':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'approved':
        return { background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' };
      case 'pending_review':
        return { background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24', border: '1px solid rgba(234, 179, 8, 0.2)' };
      case 'draft':
        return { background: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.2)' };
      default:
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <button 
            onClick={() => window.location.href = '/teacher/dashboard'}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            My <span className="text-gradient">Courses</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Manage your curriculum content, lessons, pricing, and live batches</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => window.location.href = '/teacher/courses/create'}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
          >
            + Create New Course
          </button>
          <button
            onClick={handleLogoutClick}
            className="btn-secondary"
            style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {error && <div className="alert-danger">{error}</div>}

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', textAlign: 'center', marginTop: '3rem' }}>Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>You have not created any wellness courses yet.</p>
          <button
            onClick={() => window.location.href = '/teacher/courses/create'}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.75rem 2rem' }}
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {courses.map((courseItem) => (
            <div key={courseItem.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    color: 'var(--secondary)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {courseItem.courseType}
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    ...getStatusBadgeStyle(courseItem.status)
                  }}
                >
                  {courseItem.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {courseItem.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {courseItem.description}
                </p>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Created: {new Date(courseItem.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => window.location.href = `/teacher/courses/${courseItem.id}/edit`}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Edit Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
