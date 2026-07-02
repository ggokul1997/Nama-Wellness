'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { getAuthUser } from '../../../lib/auth-store';

export default function TeacherOnboardingPaymentPage() {
  const [app, setApp] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    try {
      // 1. Check if profile exists first
      try {
        const profileRes = await api.get('/teacher/profile/me');
        if (profileRes.data) {
          if (profileRes.data.onboardingFeePaid) {
            window.location.href = '/teacher/dashboard';
            return;
          }
          // Profile exists but onboarding fee is not paid yet (approved state)
          setApp({ status: 'approved' });
          setFetching(false);
          return;
        }
      } catch (profileErr) {
        // Profile not created yet or not found (normal if application is pending or rejected)
      }

      // 2. Fetch active application details
      const appRes = await api.get('/teacher/applications/me');
      setApp(appRes.data);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        // Session expired or unauthorized: redirect to login
        window.location.href = '/auth/login';
        return;
      }
      if (err.status === 404) {
        // No active application found: redirect to apply page
        window.location.href = '/teacher/apply';
        return;
      }
      setError('Failed to fetch onboarding status.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const user = getAuthUser();
    if (!user || !user.roles.includes('teacher')) {
      window.location.href = '/auth/login';
      return;
    }
    fetchStatus();
  }, []);

  const handleInitiatePayment = async () => {
    setInitiating(true);
    setError('');
    try {
      const res = await api.post('/payments/onboarding', { gateway: 'razorpay' });
      setPaymentDetails(res.data || res);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate onboarding payment.');
    } finally {
      setInitiating(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!paymentDetails) return;
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Simulate Razorpay payment webhook trigger
      await api.post('/webhooks/razorpay', {
        id: `evt_mock_${Date.now()}`,
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_mock_${Math.floor(Math.random() * 1000000)}`,
              order_id: paymentDetails.gatewayOrderId
            }
          }
        }
      }, {
        headers: {
          'x-razorpay-signature': 'webhook_bypass_sig'
        }
      });

      setSuccess('Payment captured successfully! Your teacher profile is now active.');
      
      setTimeout(() => {
        window.location.href = '/teacher/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to capture payment.');
      setProcessing(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-container">
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading onboarding details...</p>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '500px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Onboarding <span className="text-gradient">Gate</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Track application status and complete registration
        </p>

        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {app?.status === 'pending' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              color: '#fef08a',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 500,
              lineHeight: 1.5,
              marginBottom: '1.5rem'
            }}>
              Application Status: Pending Review ⏳
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Our admissions team is evaluating your specialty choices and credentials. We will notify you by email as soon as we make a decision.
            </p>
          </div>
        )}

        {app?.status === 'rejected' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="alert-danger" style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
              Application Status: Rejected ❌
            </div>
            {app?.adminNotes && (
              <p style={{ color: '#fca5a5', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Reason: "{app.adminNotes}"
              </p>
            )}
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Please reach out to support if you have any questions.
            </p>
          </div>
        )}

        {app?.status === 'approved' && !paymentDetails && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#a7f3d0',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              Application Approved! 🎉
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#94a3b8' }}>Onboarding Fee</span>
                <span style={{ fontWeight: 600 }}>500.00 INR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>500.00 INR</span>
              </div>
            </div>
            <button
              onClick={handleInitiatePayment}
              className="btn-primary"
              disabled={initiating}
            >
              {initiating ? 'Creating Order...' : 'Pay Onboarding Fee'}
            </button>
          </div>
        )}

        {paymentDetails && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Order ID: {paymentDetails.gatewayOrderId}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{paymentDetails.amount} {paymentDetails.currency}</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Click below to complete the simulated checkout process. This will capture the webhook event and activate your profile instantly.
            </p>
            <button
              onClick={handleSimulatePaymentSuccess}
              className="btn-primary"
              disabled={processing}
              style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
            >
              {processing ? 'Processing Payment...' : 'Complete Mock Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
