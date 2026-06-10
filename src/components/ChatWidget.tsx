import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, MessageSquare, Send, Calendar, 
  Home, Newspaper, HelpCircle, ArrowRight, 
  Stethoscope, ShieldAlert, BookOpen 
} from 'lucide-react';
import { sendMessageToAgent, generateSessionId } from '../services/agentService';
import type { Appointment } from './AppointmentTracker';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isBookingCard?: boolean;
  bookingDetails?: {
    doctor?: string;
    specialty?: string;
    date?: string;
    time?: string;
  };
}

interface ChatWidgetProps {
  onAppointmentBooked: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  openTrigger: boolean;
  setOpenTrigger: (val: boolean) => void;
  prefilledPrompt: string;
  clearPrefilledPrompt: () => void;
}

type TabType = 'home' | 'messages' | 'news' | 'help';

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  onAppointmentBooked,
  openTrigger,
  setOpenTrigger,
  prefilledPrompt,
  clearPrefilledPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  
  // Track FAQ active toggles
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync open trigger from parent
  useEffect(() => {
    if (openTrigger) {
      setIsOpen(true);
      setActiveTab('messages');
      setOpenTrigger(false);
    }
  }, [openTrigger, setOpenTrigger]);

  // Sync prefilled prompt when clicked on doctor list
  useEffect(() => {
    if (prefilledPrompt) {
      setIsOpen(true);
      setActiveTab('messages');
      
      // Auto submit or populate
      setInputVal(prefilledPrompt);
      clearPrefilledPrompt();
    }
  }, [prefilledPrompt, clearPrefilledPrompt]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Clear any active streaming
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    // Append user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAgent(textToSend, sessionId);
      
      // Setup dynamic streaming
      const agentMsgId = Math.random().toString();
      const placeholderMsg: Message = {
        id: agentMsgId,
        sender: 'agent',
        text: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, placeholderMsg]);
      setIsLoading(false); // Hide standard loading dots once streaming starts

      const fullText = response.text;
      const words = fullText.split(/(\s+)/); // Retain spaces while splitting words
      let currentWordIndex = 0;
      let accumulatedText = '';

      streamingIntervalRef.current = setInterval(() => {
        if (currentWordIndex < words.length) {
          accumulatedText += words[currentWordIndex];
          currentWordIndex++;
          
          setMessages(prev => prev.map(msg => 
            msg.id === agentMsgId 
              ? { ...msg, text: accumulatedText }
              : msg
          ));
        } else {
          if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
          }

          // Streaming complete, trigger booking card if registered
          if (response.isAppointmentBooked && response.appointmentDetails) {
            setMessages(prev => prev.map(msg => 
              msg.id === agentMsgId 
                ? { 
                    ...msg, 
                    isBookingCard: true, 
                    bookingDetails: response.appointmentDetails 
                  }
                : msg
            ));

            onAppointmentBooked({
              doctor: response.appointmentDetails.doctor || 'Dr. Emily Watson',
              specialty: response.appointmentDetails.specialty || 'General Consultation',
              date: response.appointmentDetails.date || 'Tomorrow',
              time: response.appointmentDetails.time || '10:00 AM'
            });
          }
        }
      }, 25); // ~25ms per word is the sweet-spot speed for clean conversational streaming

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'agent',
        text: "I experienced a brief server timeout connecting to the clinic. Please retry your message.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const startChat = () => {
    // Clear any active streaming
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    const welcomeText = `### Welcome to HMS Hospital! 🩺\n\nI am your helpful Patient Assistant. \n\nI can:\n* **Book Clinic Appointments** (e.g. *"Book Dr. Emily Watson tomorrow at 10 AM"*)\n* **Answer simple medical questions**\n\n*How can I help you today?*`;
    
    const agentMsgId = 'welcome';
    const placeholderMsg: Message = {
      id: agentMsgId,
      sender: 'agent',
      text: '',
      timestamp: new Date()
    };
    setMessages([placeholderMsg]);

    const words = welcomeText.split(/(\s+)/);
    let currentWordIndex = 0;
    let accumulatedText = '';

    streamingIntervalRef.current = setInterval(() => {
      if (currentWordIndex < words.length) {
        accumulatedText += words[currentWordIndex];
        currentWordIndex++;
        
        setMessages(prev => prev.map(msg => 
          msg.id === agentMsgId 
            ? { ...msg, text: accumulatedText }
            : msg
        ));
      } else {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
        }
      }
    }, 20);
  };

  const formatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

      // Handle main Markdown headers
      if (line.startsWith('###')) {
        return <h3 key={idx} style={{ marginTop: '8px', marginBottom: '4px', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.95rem' }}>{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('##')) {
        return <h3 key={idx} style={{ marginTop: '10px', marginBottom: '4px', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '1rem' }}>{line.replace('##', '').trim()}</h3>;
      }

      // Handle bold tags
      if (line.includes('**')) {
        const parts = line.split('**');
        content = parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{part}</strong>;
          }
          return part;
        });
      }

      // Handle bullet points
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <li key={idx} style={{ marginLeft: '14px', marginBottom: '3px', listStyleType: 'disc', fontSize: '0.85rem' }}>
            {typeof content === 'string' ? line.substring(1).trim() : content}
          </li>
        );
      }

      // Handle numbered lists
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} style={{ marginLeft: '14px', marginBottom: '3px', listStyleType: 'decimal', fontSize: '0.85rem' }}>
            {numMatch[2]}
          </li>
        );
      }

      return <p key={idx} style={{ marginBottom: '6px', fontSize: '0.85rem' }}>{content}</p>;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div 
          className="chat-toggle-container"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999
          }}
        >
          {/* Glowing suggestion badge with toggle arrow pointing toward the chatbot */}
          <div 
            onClick={() => setIsOpen(true)}
            className="chat-suggestion-pill"
            style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--accent-teal)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(15, 118, 110, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--accent-teal)',
              cursor: 'pointer',
              animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseGlow 3s infinite ease-in-out',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-teal)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Ask Health Assistant</span>
            <span style={{ 
              display: 'inline-block',
              animation: 'bounceLeftRight 1.2s infinite ease-in-out',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: 'var(--accent-cyan)'
            }}>
              ➔
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="pulse-active"
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-teal))',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(15, 118, 110, 0.3)',
              transition: 'var(--transition-smooth)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquare size={26} />
          </button>
        </div>
      )}

      {/* Primary Chat Box Widget Panel */}
      {isOpen && (
        <div
          className="glass-panel chat-widget-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'scaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            boxShadow: '0 12px 40px rgba(148, 163, 184, 0.25)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-secondary)'
          }}
        >
          {/* Header Panel matching user screenshot perfectly */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--bg-tertiary)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                margin: 0
              }}>
                Messages
              </h3>
            </div>

            {/* Dropdown/Collapse Arrow exactly matching user screenshot */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--accent-cyan)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Body Content dynamically rendered based on Active Tab */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-primary)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
              messages.length === 0 ? (
                /* Matches user screenshot exactly when there are no messages */
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}>
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Messages</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>No messages yet</p>
                  </div>
                  <button 
                    onClick={startChat}
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '260px', 
                      justifyContent: 'center',
                      background: 'var(--text-primary)',
                      color: '#ffffff',
                      border: 'none',
                      marginTop: '20px',
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '700'
                    }}
                  >
                    Send us a message
                    <ArrowRight size={16} color="#ffffff" style={{ marginLeft: '6px' }} />
                  </button>
                </div>
              ) : (
                /* Message history */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                      }}
                    >
                      {/* Message Bubble */}
                      <div style={{
                        background: msg.sender === 'user' 
                          ? '#e0f2fe' /* Soft sky blue */
                          : 'var(--bg-secondary)', /* Clinical white */
                        border: msg.sender === 'user'
                          ? '1px solid rgba(2, 132, 199, 0.15)'
                          : '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'user' 
                          ? '16px 16px 2px 16px' 
                          : '16px 16px 16px 2px',
                        boxShadow: '0 2px 10px rgba(148, 163, 184, 0.05)',
                        lineHeight: 1.4
                      }}>
                        <div className="message-markdown" style={{ fontSize: '0.85rem' }}>
                          {formatText(msg.text)}
                        </div>
                      </div>

                      {/* Interactive Appointment Confirmation Card Inside Message */}
                      {msg.sender === 'agent' && msg.isBookingCard && msg.bookingDetails && (
                        <div style={{
                          marginTop: '6px',
                          background: 'var(--accent-teal-glow)',
                          border: '1px solid var(--accent-teal)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px',
                          boxShadow: '0 2px 8px rgba(15,118,110,0.06)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-teal)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                            <Calendar size={12} />
                            Appointment Scheduled
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                            {msg.bookingDetails.doctor}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                            {msg.bookingDetails.specialty || 'General Consultation'}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                            <span>📅 <b>{msg.bookingDetails.date}</b></span>
                            <span>⏰ <b>{msg.bookingDetails.time}</b></span>
                          </div>
                        </div>
                      )}

                      {/* Time badge */}
                      <span style={{
                        display: 'block',
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                        textAlign: msg.sender === 'user' ? 'right' : 'left'
                      }}>
                        {msg.sender === 'user' ? 'Patient' : 'Assistant'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}

                  {/* Typing/Loading Indicator */}
                  {isLoading && (
                    <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        padding: '10px 14px',
                        borderRadius: '16px 16px 16px 2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-teal)', animation: 'typing 1.4s infinite ease-in-out', animationDelay: '0s' }} />
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'typing 1.4s infinite ease-in-out', animationDelay: '0.2s' }} />
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'typing 1.4s infinite ease-in-out', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )
            )}

            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--accent-teal-glow)',
                    color: 'var(--accent-teal)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}>
                    <Stethoscope size={28} />
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Welcome to patient portal</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Access immediate health advice or secure doctor bookings
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
                  <h5 style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Quick Actions
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', textAlign: 'left', fontWeight: 600 }}
                    >
                      <span>💬 Chat with Patient Helper</span>
                      <ArrowRight size={12} color="var(--accent-teal)" />
                    </button>
                    <button 
                      onClick={() => handleSend("Book an appointment")}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', textAlign: 'left', fontWeight: 600 }}
                    >
                      <span>📅 Book a Clinic Slot</span>
                      <ArrowRight size={12} color="var(--accent-teal)" />
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(190, 18, 60, 0.06)',
                  border: '1px solid rgba(190, 18, 60, 0.15)',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
                    <ShieldAlert size={14} />
                    EMERGENCY NOTE
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    If you are experiencing severe symptoms like heavy breathing or sudden chest pains, please dial <b>911</b> or proceed directly to an emergency ward.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: NEWS */}
            {activeTab === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '8px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={15} color="var(--accent-teal)" />
                    Hospital Guidelines & News
                  </h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Clinical bulletins updated recently
                  </p>
                </div>

                {/* News Card 1 */}
                <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', fontWeight: 800, textTransform: 'uppercase' }}>Healthy Heart</span>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>Tips for Cardiovascular Health</h5>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Keeping active for at least 30 minutes daily and cutting back on processed salt levels helps improve overall cardiac metrics...
                  </p>
                </div>

                {/* News Card 2 */}
                <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase' }}>Hydration Routine</span>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>Water Intake During Hot Days</h5>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Regularly drinking fluids during high temperature intervals aids body temperature control and maintains active energy levels...
                  </p>
                </div>

                {/* News Card 3 */}
                <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--accent-indigo)', fontWeight: 800, textTransform: 'uppercase' }}>Child Care</span>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>Managing Autumn Pollen Triggers</h5>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Keeping bedroom windows closed during high pollen counts helps child patients avoid typical seasonal allergy symptoms...
                  </p>
                </div>
              </div>
            )}

            {/* TAB: FAQs (HELP) */}
            {activeTab === 'help' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '8px' }}>
                  Frequently Answered Questions
                </h4>
                
                {[
                  {
                    q: "What is this clinical assistant?",
                    a: "It is a smart digital assistant designed to answer simple clinical queries, explain generic symptoms, and book appointment schedules with doctors."
                  },
                  {
                    q: "How can I book an appointment?",
                    a: "Just type a message like 'Book Emily Watson tomorrow at 10 AM'. The assistant registers the spot and automatically displays it in your Live Booking Tracker."
                  },
                  {
                    q: "Is my personal data safe?",
                    a: "Yes. All communication data in this system is encrypted to secure your patient privacy completely."
                  },
                  {
                    q: "Is this helper a real doctor?",
                    a: "No, the assistant provides medical guidance and schedules clinic bookings. For diagnostic advice or critical scripts, please speak with an actual hospital clinician."
                  }
                ].map((item, index) => (
                  <div key={index} style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '8px' }}>
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: expandedFaq === index ? 'var(--accent-teal)' : 'var(--text-primary)',
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{item.q}</span>
                      <span>{expandedFaq === index ? '−' : '+'}</span>
                    </button>
                    {expandedFaq === index && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '4px', lineHeight: 1.4 }}>
                        {item.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Chat input bar */}
          {activeTab === 'messages' && messages.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--bg-tertiary)',
              padding: '12px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Type your health or booking request..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
                style={{
                  flex: 1,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              />
              <button
                onClick={() => handleSend(inputVal)}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-teal))',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(15, 118, 110, 0.15)'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Footer Tabs matching user screenshot style */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--bg-tertiary)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0',
            fontSize: '0.72rem'
          }}>
            {/* Tab: HOME */}
            <button
              onClick={() => setActiveTab('home')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'home' ? 'var(--accent-teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '64px',
                fontWeight: activeTab === 'home' ? 700 : 500,
                transition: 'var(--transition-smooth)'
              }}
            >
              <Home size={18} />
              <span>Home</span>
            </button>

            {/* Tab: MESSAGES */}
            <button
              onClick={() => {
                setActiveTab('messages');
                if (messages.length === 0) {
                  startChat();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'messages' ? 'var(--accent-teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '64px',
                fontWeight: activeTab === 'messages' ? 700 : 500,
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ position: 'relative' }}>
                <MessageSquare size={18} />
                {messages.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--accent-rose)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <span>Messages</span>
            </button>

            {/* Tab: NEWS */}
            <button
              onClick={() => setActiveTab('news')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'news' ? 'var(--accent-teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '64px',
                fontWeight: activeTab === 'news' ? 700 : 500,
                transition: 'var(--transition-smooth)'
              }}
            >
              <Newspaper size={18} />
              <span>News</span>
            </button>

            {/* Tab: HELP */}
            <button
              onClick={() => setActiveTab('help')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'help' ? 'var(--accent-teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '64px',
                fontWeight: activeTab === 'help' ? 700 : 500,
                transition: 'var(--transition-smooth)'
              }}
            >
              <HelpCircle size={18} />
              <span>Help</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
