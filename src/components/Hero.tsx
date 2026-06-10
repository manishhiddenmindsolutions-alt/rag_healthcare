import React from 'react';
import { ArrowRight, Bot, Calendar, Heart, ShieldCheck, UserCheck } from 'lucide-react';
import hospitalLobby from '../assets/hospital_lobby.png';

interface HeroProps {
  onOpenChat: () => void;
  onAskQuestion: (prompt: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenChat, onAskQuestion }) => {
  const quickQuestions = [
    "Book a slot with Dr. Emily Watson tomorrow",
    "What are some tips to manage seasonal fever?",
    "Schedule a dentist consult with Dr. Marcus Vance",
    "Find opening timings for children's care"
  ];

  return (
    <section id="overview" style={{ padding: '40px 24px 20px 24px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in-up">
      {/* 2-Column Banner Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(148, 163, 184, 0.08)',
        marginBottom: '40px'
      }} className="hero-banner-grid">
        
        {/* Left Side: Welcoming Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--glass-border)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '16px'
          }}>
            <Heart size={12} color="var(--accent-teal)" fill="var(--accent-teal)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
              Caring for You, Every Step of the Way
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            lineHeight: 1.2,
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Welcome to <br />
            <span style={{ color: 'var(--accent-teal)' }}>HMS Hospital</span> Patient Portal
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.6,
            maxWidth: '550px'
          }}>
            Experience compassionate clinical care and simple booking scheduling. Ask our digital Patient Assistant your medical queries or instantly schedule a consultation with our specialized medical team.
          </p>

          {/* Clinical Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <button className="btn-primary" onClick={onOpenChat} style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <Bot size={18} />
              Talk to Patient Helper
              <ArrowRight size={16} />
            </button>
            <a href="#doctors" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '12px 24px', fontSize: '0.95rem' }}>
              <Calendar size={16} color="var(--accent-teal)" />
              Find a Doctor
            </a>
          </div>

          {/* Quick Prompts */}
          <div>
            <span style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '1px',
              marginBottom: '10px'
            }}>
              Suggested questions (Click to ask assistant)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskQuestion(q)}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-teal)';
                    e.currentTarget.style.color = 'var(--accent-teal)';
                    e.currentTarget.style.background = 'var(--accent-teal-glow)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-primary)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Hospital Lobby Image */}
        <div style={{
          width: '100%',
          height: '350px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(148, 163, 184, 0.1)',
          border: '4px solid var(--bg-primary)'
        }} className="hero-banner-image">
          <img 
            src={hospitalLobby} 
            alt="HMS Hospital Lobby" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

      </div>

      {/* Grid of Hospital Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {/* Pillar 1 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            background: 'var(--accent-teal-glow)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-teal)'
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>Specialist Clinicians</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Direct access to pediatricians, cardiologists, dental surgeons, and family physicians.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            background: 'var(--accent-teal-glow)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-teal)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>Secure Patient Portals</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Your interactions and health records are handled with maximum security and absolute privacy.
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            background: 'var(--accent-teal-glow)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-teal)'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>Instant Bookings</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Simply tell the Patient Assistant when you are free, and your spot gets registered immediately.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hero-banner-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
          .hero-banner-image {
            height: 400px !important;
          }
        }
      `}</style>
    </section>
  );
};
