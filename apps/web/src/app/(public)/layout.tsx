import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nama Wellness
        </div>
        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem', fontWeight: 500 }}>
          <a href="/courses" style={{ opacity: 0.8, transition: 'opacity 0.2s' }}>Courses</a>
          <a href="/auth/login" style={{ opacity: 0.8, transition: 'opacity 0.2s' }}>Login</a>
          <a href="/auth/register" style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            color: '#0b0f19',
            fontWeight: 600,
            transition: 'transform 0.2s'
          }}>Sign Up</a>
        </nav>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{
        textAlign: 'center',
        padding: '2.5rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.875rem',
        opacity: 0.5
      }}>
        &copy; {new Date().getFullYear()} Nama Wellness. All rights reserved.
      </footer>
    </>
  );
}
