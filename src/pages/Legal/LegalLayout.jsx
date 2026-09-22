import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined, SafetyCertificateOutlined, FileTextOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons';
import { NaracordIcon, NaracordLogo } from '../../components/NaracordLogo';

const LegalLayout = ({ children, title, subtitle, lastUpdated = 'August 03, 2026' }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/privacy-policy', label: 'Privacy Policy', icon: <SafetyCertificateOutlined /> },
    { path: '/terms', label: 'Terms of Service', icon: <FileTextOutlined /> },
    { path: '/data-deletion', label: 'User Data Deletion', icon: <DeleteOutlined /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NaracordIcon size={38} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px', color: '#0f172a' }}>
                NARACORD<span style={{ color: '#5850EC', marginLeft: '2px' }}>.AI</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                by Alisons Technology
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#f1f5f9',
                color: '#334155',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '56px 24px 48px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 20,
            background: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16
          }}>
            <SafetyCertificateOutlined /> Legal & Compliance Center
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {title}
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            {subtitle}
          </p>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 16 }}>
            Last Updated & Effective: <strong style={{ color: '#cbd5e1' }}>{lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 18px',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <main style={{ maxWidth: 960, margin: '40px auto 80px', padding: '0 24px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '48px 48px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          lineHeight: 1.8,
          fontSize: 15,
          color: '#334155'
        }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 24px 32px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NaracordIcon size={36} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#ffffff' }}>
                NARACORD<span style={{ color: '#5850EC', marginLeft: '2px' }}>.AI</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Enterprise WhatsApp Automation SaaS by Alisons Technology
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link to="/privacy-policy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/data-deletion" style={{ color: '#94a3b8', textDecoration: 'none' }}>User Data Deletion</Link>
            <a href="mailto:info@alisonstech.com" style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined /> Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
