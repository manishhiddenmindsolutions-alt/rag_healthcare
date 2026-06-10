import React from 'react';
import { CalendarCheck, Clock, Trash2, UserCheck } from 'lucide-react';

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
}

interface AppointmentTrackerProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
}

export const AppointmentTracker: React.FC<AppointmentTrackerProps> = ({
  appointments,
  onCancelAppointment,
}) => {
  return (
    <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-panel animate-scale-in" style={{ padding: '32px', borderLeft: '4px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--accent-teal-glow)',
            color: 'var(--accent-teal)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Live Booking Tracker</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Appointments scheduled interactively via your n8n AI Booking Agent session
            </p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--glass-border)',
            color: 'var(--text-muted)'
          }}>
            <Clock size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No Active Appointments Found
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Instruct the Chat Assistant to book a slot (e.g., *"Book a general consult for tomorrow at 10 AM"*), or click "Schedule Consult" on any specialist card above.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(20, 184, 166, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  borderLeft: '4px solid var(--accent-teal)'
                }}
              >
                <div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--accent-teal)',
                    background: 'var(--accent-teal-glow)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    {appt.status}
                  </span>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} color="var(--accent-cyan)" />
                    {appt.doctor}
                  </h4>
                  
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    {appt.specialty}
                  </span>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>📅 <b>{appt.date}</b></span>
                    <span>⏰ <b>{appt.time}</b></span>
                  </div>
                </div>

                <button
                  onClick={() => onCancelAppointment(appt.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'var(--accent-rose)';
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Cancel Consultation"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
