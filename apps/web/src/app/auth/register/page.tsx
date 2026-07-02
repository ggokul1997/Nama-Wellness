'use client';

import React, { useState } from 'react';
import { api } from '../../../lib/api';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', {
        email,
        password,
        phone,
        firstName,
        lastName,
        role
      });

      setSuccess('Account created successfully! Please verify your email.');
      
      // Reset inputs
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Create <span className="text-gradient">Account</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Join as a student or register as a certified teacher
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="first-name-input">First Name</label>
              <input
                id="first-name-input"
                type="text"
                className="form-input"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last-name-input">Last Name</label>
              <input
                id="last-name-input"
                type="text"
                className="form-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className="form-label" htmlFor="phone-input">Phone Number (with Country Code)</label>
            <input
              id="phone-input"
              type="tel"
              className="form-input"
              placeholder="+919999988888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password (Min 8 chars)</label>
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
            <label className="form-label" htmlFor="role-select">Select Role</label>
            <select
              id="role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student (Explore wellness & learning courses)</option>
              <option value="teacher">Teacher (Offer classes, yoga, or coaching)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <a href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
