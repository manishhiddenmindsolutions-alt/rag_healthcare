import React from 'react';
import { Activity, Heart } from 'lucide-react';

interface HeaderProps {
  webhookConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ webhookConnected }) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      {/* Hospital Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-teal))',
          borderRadius: 'var(--radius-sm)',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(15, 118, 110, 0.15)'
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)'
          }}>
            HMS Hospital
          </span>
          <span style={{
            display: 'block',
            fontSize: '0.68rem',
            color: 'var(--accent-teal)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '-2px'
          }}>
            Patient Care & Booking Portal
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{
        display: 'none',
        alignItems: 'center',
        gap: '24px'
      }} className="nav-links-desktop">
        <a href="#overview" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-teal)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Home</a>
        <a href="#doctors" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-teal)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Our Doctors</a>
        <a href="#services" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-teal)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Medical Services</a>
      </nav>
      
      <style>{`
        @media (min-width: 768px) {
          .nav-links-desktop {
            display: flex !important;
          }
        }
      `}</style>

      {/* Reassuring Clinical Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          className="assistant-status-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px 5px 8px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          <div style={{
            background: webhookConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            boxShadow: webhookConnected 
              ? '0 0 6px var(--accent-emerald)' 
              : '0 0 6px var(--accent-rose)',
          }} />
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Assistant Online
          </span>
        </div>

        <div 
          className="clinical-desk-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(15, 118, 110, 0.08))',
            border: '1px solid rgba(15, 118, 110, 0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-teal)',
          }}
        >
          <Heart size={13} color="var(--accent-teal)" fill="var(--accent-teal)" />
          24/7 Clinical Desk
        </div>
      </div>
    </header>
  );
};
