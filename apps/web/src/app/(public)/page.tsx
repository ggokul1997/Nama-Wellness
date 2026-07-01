import React from 'react';

export default function LandingPage() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '4rem'
    }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        <div style={{
          display: 'inline-block',
          alignSelf: 'center',
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--primary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          Elevate Your Well-being
        </div>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em'
        }}>
          Expert-Led Live Wellness & <span style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Skill Learning</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          lineHeight: 1.6,
          opacity: 0.7,
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          Connect with approved teachers for live yoga, meditation, music, arts, and corporate wellness solutions tailored for employee growth.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <a href="/courses" style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            color: '#0b0f19',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s'
          }}>Explore Courses</a>
          <a href="/auth/register/corporate" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border)',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}>Nama Corporate</a>
        </div>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        width: '100%',
        marginTop: '2rem'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'left',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 800 }}>EdPro</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Learning Marketplace</h3>
          <p style={{ opacity: 0.7, lineHeight: 1.5, flex: 1 }}>
            A B2C marketplace for yoga, meditation, music, vocal training, instruments, and creative learning. Enroll in live interactive courses led by verified instructors.
          </p>
          <a href="/auth/register?role=student" style={{
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Register as Student &rarr;
          </a>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'left',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ color: 'var(--secondary)', fontSize: '2rem', fontWeight: 800 }}>Corporate</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>B2B Wellness Solutions</h3>
          <p style={{ opacity: 0.7, lineHeight: 1.5, flex: 1 }}>
            Empower employee well-being with customized packages, direct company code access, wellness tracking dashboards, and AI-powered participation reporting.
          </p>
          <a href="/auth/register/corporate" style={{
            color: 'var(--secondary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Get Company Code &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
