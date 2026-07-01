import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Nama Wellness — Premium Wellness & Learning Platform',
  description: 'Connect with expert teachers for live yoga, meditation, music, and corporate wellness programs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="bg-glow" />
        {children}
      </body>
    </html>
  );
}
