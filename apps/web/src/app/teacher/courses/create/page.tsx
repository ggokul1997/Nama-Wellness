'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { getAuthUser } from '../../../../lib/auth-store';

export default function CreateCoursePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [courseType, setCourseType] = useState('live'); // live, recorded, hybrid
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
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

    // Load categories list
    api.get('/category')
      .then((res) => {
        const cats = res.data || res;
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(() => {
        setError('Failed to load course categories.');
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/courses', {
        title,
        courseType,
        categoryId,
        description
      });
      
      setSuccess('Course initialized successfully! Redirecting to course editor...');
      const newCourseId = res.data?.id || res.id;
      setTimeout(() => {
        window.location.href = `/teacher/courses/${newCourseId}/edit`;
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize course. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '600px', padding: '2.5rem' }}>
        <button 
          onClick={() => window.location.href = '/teacher/courses'}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', padding: 0 }}
        >
          ← Cancel & Go Back
        </button>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Initialize <span className="text-gradient">Course</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Create a draft placeholder. You can schedule batches, chapters, and pricing in the next step.
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              placeholder="e.g., Vinyasa Flow for Beginners"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="courseType">Course Format</label>
              <select
                id="courseType"
                value={courseType}
                onChange={(e) => setCourseType(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '0.8rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              >
                <option value="live" style={{ background: '#1e293b' }}>Live Interactive Sessions</option>
                <option value="recorded" style={{ background: '#1e293b' }}>Self-Paced Recorded</option>
                <option value="hybrid" style={{ background: '#1e293b' }}>Hybrid Structure</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Specialty Category</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '0.8rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1e293b' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Curriculum Summary / Description</label>
            <textarea
              id="description"
              placeholder="Detail the course contents, syllabus, learning objectives, and benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
          >
            {loading ? 'Initializing Draft...' : 'Create Course Draft'}
          </button>
        </form>
      </div>
    </div>
  );
}
