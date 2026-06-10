import React from 'react';
import { CalendarDays, Star, Stethoscope } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  availability: string;
  bio: string;
  imageColor: string;
}

interface DoctorListProps {
  onBookDoctor: (doctorName: string, specialty: string) => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({ onBookDoctor }) => {
  const doctors: Doctor[] = [
    {
      id: 'doc1',
      name: 'Dr. Emily Watson',
      specialty: 'General Physician',
      rating: 4.9,
      reviews: 245,
      availability: 'Mon - Fri (8:00 AM - 4:00 PM)',
      bio: 'Over 12 years of experience in family medicine, focusing on preventative care and wellness counseling.',
      imageColor: '#14b8a6' // Teal
    },
    {
      id: 'doc2',
      name: 'Dr. Alexander Chen',
      specialty: 'Cardiology Specialist',
      rating: 5.0,
      reviews: 189,
      availability: 'Tue, Thu (10:00 AM - 6:00 PM)',
      bio: 'Leading cardiovascular expert specializing in preventative cardiology and heart rhythm disorders.',
      imageColor: '#06b6d4' // Cyan
    },
    {
      id: 'doc3',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Pediatrics Care',
      rating: 4.8,
      reviews: 312,
      availability: 'Mon - Thu (9:00 AM - 5:00 PM)',
      bio: 'Compassionate pediatric care focusing on early development, nutrition, and childhood asthma management.',
      imageColor: '#6366f1' // Indigo
    },
    {
      id: 'doc4',
      name: 'Dr. Marcus Vance',
      specialty: 'Dental Surgeon',
      rating: 4.9,
      reviews: 154,
      availability: 'Wed, Fri (9:00 AM - 3:00 PM)',
      bio: 'Specialist in aesthetic dentistry and oral surgery, committed to painless treatments and dental education.',
      imageColor: '#ec4899' // Pink
    }
  ];

  return (
    <section id="doctors" style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            HMS CLINICAL NETWORK
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Our Medical Specialists
          </h2>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}
          >
            <div>
              {/* Doctor Avatar Placeholder with Graphic details */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${doc.imageColor}, rgba(8, 12, 20, 0.9))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 15px ${doc.imageColor}33`,
                  border: `2px solid ${doc.imageColor}`
                }}>
                  <Stethoscope size={24} color="#f8fafc" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>{doc.name}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: doc.imageColor,
                    background: `${doc.imageColor}11`,
                    border: `1px solid ${doc.imageColor}33`,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {doc.specialty}
                  </span>
                </div>
              </div>

              {/* Bio & Availability */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '60px' }}>
                {doc.bio}
              </p>

              {/* Star Rating & Review count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} color="#eab308" fill="#eab308" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{doc.rating.toFixed(1)}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({doc.reviews} reviews)</span>
              </div>
            </div>

            {/* Availability info & Book button */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <CalendarDays size={14} color="var(--accent-teal)" />
                <span>{doc.availability}</span>
              </div>

              <button
                className="btn-secondary"
                onClick={() => onBookDoctor(doc.name, doc.specialty)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: `${doc.imageColor}33`,
                  color: '#f8fafc',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${doc.imageColor}, ${doc.imageColor}dd)`;
                  e.currentTarget.style.color = '#080c14';
                  e.currentTarget.style.fontWeight = '700';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.color = '#f8fafc';
                  e.currentTarget.style.fontWeight = '500';
                  e.currentTarget.style.borderColor = `${doc.imageColor}33`;
                }}
              >
                Schedule Consult
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
