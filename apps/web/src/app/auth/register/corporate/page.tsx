'use client';

import React, { useState } from 'react';
import { api } from '../../../../lib/api';

export default function RegisterCorporatePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register/corporate', {
        email,
        password,
        phone: phone || undefined,
        firstName,
        lastName,
        companyCode,
        role
      });

      setSuccess('Corporate account created successfully! Please proceed to login.');
      
      // Reset inputs
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setCompanyCode('');
      
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check company code and registration details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Nama <span className="text-gradient">Corporate</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Employee signup gate via corporate invite code
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="company-code-input">Company Invite Code</label>
            <input
              id="company-code-input"
              type="text"
              className="form-input"
              style={{ borderColor: 'var(--secondary)', boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.05)' }}
              placeholder="e.g. GOOGLE-WEL-481"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              required
            />
          </div>

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
            <label className="form-label" htmlFor="email-input">Work Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone-input">Phone Number (Optional)</label>
            <input
              id="phone-input"
              type="tel"
              className="form-input"
              placeholder="+16505550199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <label className="form-label" htmlFor="role-select">Corporate Role</label>
            <select
              id="role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employee">Employee (Wellness benefits recipient)</option>
              <option value="company_admin">Company Admin (Manage programs & view reports)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
            disabled={loading}
          >
            {loading ? 'Registering Employee...' : 'Activate Membership'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <a href="/auth/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
