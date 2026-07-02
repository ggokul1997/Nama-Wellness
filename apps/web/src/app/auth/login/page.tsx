'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { saveAuthSession, getAuthUser, getRedirectPath } from '../../../lib/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    const activeUser = getAuthUser();
    if (activeUser) {
      window.location.href = getRedirectPath(activeUser);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });

      setSuccess('Logged in successfully!');
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Save auth payload and redirect
      saveAuthSession(accessToken, refreshToken, user);
      
      setTimeout(() => {
        window.location.href = getRedirectPath(user);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Invalid email, password or role selection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Welcome <span className="text-gradient">Back</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Access your premium learning or teaching profile
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role-select">Access Portal</label>
            <select
              id="role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student Portal</option>
              <option value="teacher">Teacher Dashboard</option>
              <option value="company_admin">Corporate Admin</option>
              <option value="admin">Platform Moderator</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          New to Nama?{' '}
          <a href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create an Account
          </a>
        </p>
      </div>
    </div>
  );
}
