'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { getAuthUser } from '../../../../lib/auth-store';

export default function TeacherCourseEditPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Details Form States
  const [title, setTitle] = useState('');
  const [courseType, setCourseType] = useState('live');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  // New Module Form State
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  // New Lesson Form States (keyed by moduleId)
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'document' | 'live'>('video');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState('15');

  // Pricing Form States
  const [pricingAmount, setPricingAmount] = useState('');

  // Batch Form States
  const [batchName, setBatchName] = useState('');
  const [batchCapacity, setBatchCapacity] = useState('20');
  const [batchStart, setBatchStart] = useState('');
  const [batchEnd, setBatchEnd] = useState('');

  const fetchDetails = async () => {
    try {
      // 1. Fetch course details (includes modules, lessons, pricing, batches inline!)
      const courseRes = await api.get(`/courses/${id}`);
      const courseData = courseRes.data || courseRes;
      setCourse(courseData);

      setTitle(courseData.title);
      setCourseType(courseData.courseType);
      setCategoryId(courseData.categoryId);
      setDescription(courseData.description);

      // 2. Fetch categories
      const catRes = await api.get('/category');
      setCategories(catRes.data || catRes);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        window.location.href = '/auth/login';
        return;
      }
      setError(err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getAuthUser();
    if (!user || !user.roles.includes('teacher')) {
      window.location.href = '/auth/login';
      return;
    }
    fetchDetails();
  }, [id]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.patch(`/courses/${id}`, {
        title,
        courseType,
        categoryId,
        description
      });
      setSuccess('Course details updated successfully!');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to update details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/courses/${id}/modules`, {
        title: moduleTitle,
        description: moduleDescription || undefined
      });
      setSuccess('Module added successfully!');
      setModuleTitle('');
      setModuleDescription('');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to add module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/courses/${id}/modules/${moduleId}`);
      setSuccess('Module deleted.');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to delete module.');
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const durationSeconds = lessonDurationMinutes ? parseInt(lessonDurationMinutes, 10) * 60 : undefined;
      await api.post(`/courses/${id}/modules/${moduleId}/lessons`, {
        title: lessonTitle,
        lessonType,
        contentUrl: lessonUrl || undefined,
        durationSeconds: durationSeconds || undefined
      });
      setSuccess('Lesson added to chapter!');
      setLessonTitle('');
      setLessonUrl('');
      setLessonDurationMinutes('15');
      setActiveModuleForLesson(null);
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to add lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}`);
      setSuccess('Lesson deleted.');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson.');
    }
  };

  const handleProposePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingAmount) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/courses/${id}/pricing`, {
        amount: parseFloat(pricingAmount),
        currency: 'INR'
      });
      setSuccess('Pricing proposed successfully!');
      setPricingAmount('');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to propose pricing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !batchStart) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/courses/${id}/batches`, {
        name: batchName,
        capacity: parseInt(batchCapacity, 10),
        startDate: new Date(batchStart).toISOString(),
        endDate: batchEnd ? new Date(batchEnd).toISOString() : null
      });
      setSuccess('TIMED batch scheduled successfully!');
      setBatchName('');
      setBatchCapacity('20');
      setBatchStart('');
      setBatchEnd('');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/courses/${id}/submit`);
      setSuccess('Course submitted for evaluation successfully!');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to submit course. Ensure modules/pricing are configured.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading course content...</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'pending_review':
        return { background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24', border: '1px solid rgba(234, 179, 8, 0.2)' };
      default:
        return { background: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.2)' };
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <button 
          onClick={() => window.location.href = '/teacher/courses'}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem', padding: 0 }}
        >
          ← Back to Courses
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              Edit <span className="text-gradient">Course</span>
            </h1>
            <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Course ID: {course.id}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              ...getStatusStyle(course.status)
            }}>
              Status: {course.status.replace('_', ' ')}
            </span>
            {course.status === 'draft' && (
              <button
                onClick={handleSubmitForReview}
                className="btn-primary"
                disabled={submitting}
                style={{ width: 'auto', padding: '0.6rem 1.5rem', background: '#10b981' }}
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </header>

      {error && <div className="alert-danger">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Basic Info Editor */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            Course Information
          </h2>
          <form onSubmit={handleUpdateDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="title">Course Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="courseType">Format</label>
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
              <label htmlFor="description">Curriculum Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.65rem 1.5rem' }}
            >
              {submitting ? 'Saving Details...' : 'Save Basic Info'}
            </button>
          </form>
        </div>

        {/* Pricing Panel */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            Course Pricing
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {(!course.pricing || course.pricing.length === 0) ? (
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No pricing proposed yet.</p>
            ) : (
              course.pricing.map((priceItem: any) => (
                <div key={priceItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {priceItem.amount} {priceItem.currency}
                    </span>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: priceItem.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: priceItem.status === 'approved' ? '#34d399' : '#fbbf24'
                  }}>
                    {priceItem.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleProposePricing} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="pricingAmount">Propose Pricing Amount (INR)</label>
              <input
                type="number"
                id="pricingAmount"
                placeholder="e.g., 1500"
                value={pricingAmount}
                onChange={(e) => setPricingAmount(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: 'auto', height: '42px', padding: '0 1.5rem' }}
            >
              Propose Pricing
            </button>
          </form>
        </div>

        {/* Batches Panel (visible only for live or hybrid) */}
        {(courseType === 'live' || courseType === 'hybrid') && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Timed Live Timetable Batches
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {(!course.batches || course.batches.length === 0) ? (
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No batch slots scheduled yet.</p>
              ) : (
                course.batches.map((batchItem: any) => (
                  <div key={batchItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{batchItem.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Starts: {new Date(batchItem.startDate).toLocaleString()} | Capacity: {batchItem.capacity} seats
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {batchItem.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="batchName">Batch Name</label>
                  <input
                    type="text"
                    id="batchName"
                    placeholder="e.g., Morning Yoga Core"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="batchCapacity">Seat Capacity</label>
                  <input
                    type="number"
                    id="batchCapacity"
                    value={batchCapacity}
                    onChange={(e) => setBatchCapacity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="batchStart">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    id="batchStart"
                    value={batchStart}
                    onChange={(e) => setBatchStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="batchEnd">End Date & Time</label>
                  <input
                    type="datetime-local"
                    id="batchEnd"
                    value={batchEnd}
                    onChange={(e) => setBatchEnd(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.65rem 1.5rem' }}
              >
                Schedule Batch
              </button>
            </form>
          </div>
        )}

        {/* Curriculum Modules Builder */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Course Curriculum (Chapters & Lectures)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
            {(!course.modules || course.modules.length === 0) ? (
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No modules added to curriculum yet.</p>
            ) : (
              course.modules.map((mod: any) => (
                <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{mod.title}</h3>
                      {mod.description && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>{mod.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      Delete Module
                    </button>
                  </div>

                  {/* Lessons list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1rem' }}>
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem', italic: 'true' }}>No lessons added in this chapter.</p>
                    ) : (
                      mod.lessons.map((les: any) => (
                        <div key={les.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div>
                            <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary)', marginRight: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                              {les.lessonType}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{les.title}</span>
                            {les.durationSeconds && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({Math.round(les.durationSeconds / 60)} mins)</span>}
                          </div>
                          <button
                            onClick={() => handleDeleteLesson(mod.id, les.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Lesson form trigger */}
                  {activeModuleForLesson === mod.id ? (
                    <form onSubmit={(e) => handleAddLesson(e, mod.id)} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add Lesson Detail</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Lesson Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Intro & Warm-up"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Format Type</label>
                          <select
                            value={lessonType}
                            onChange={(e) => setLessonType(e.target.value as any)}
                            style={{
                              width: '100%',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              padding: '0.75rem',
                              color: '#ffffff',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="video" style={{ background: '#1e293b' }}>Video Lecture</option>
                            <option value="document" style={{ background: '#1e293b' }}>Document / Text</option>
                            <option value="live" style={{ background: '#1e293b' }}>Live Interactive Slot</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Content URL (Optional)</label>
                          <input
                            type="text"
                            placeholder="http://..."
                            value={lessonUrl}
                            onChange={(e) => setLessonUrl(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Duration (Minutes)</label>
                          <input
                            type="number"
                            value={lessonDurationMinutes}
                            onChange={(e) => setLessonDurationMinutes(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                          Save Lesson
                        </button>
                        <button type="button" onClick={() => setActiveModuleForLesson(null)} className="btn-secondary" style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setActiveModuleForLesson(mod.id)}
                      className="btn-secondary"
                      style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.45rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                    >
                      + Add Lesson / Lecture
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Module form */}
          <form onSubmit={handleAddModule} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Curriculum Chapter</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group">
                <label htmlFor="modTitle">Chapter Name</label>
                <input
                  type="text"
                  id="modTitle"
                  placeholder="e.g., Week 1: Foundations"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="modDesc">Chapter Description (Optional)</label>
                <input
                  type="text"
                  id="modDesc"
                  placeholder="Summarize the core topics covered in this week..."
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}
            >
              Add Chapter Module
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
