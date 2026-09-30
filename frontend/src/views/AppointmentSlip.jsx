import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { 
  FaHospital, FaUserMd, FaCalendarAlt, FaClock, FaUser, 
  FaEnvelope, FaPhoneAlt, FaPrint, FaCheckCircle, 
  FaFilePdf, FaArrowLeft, FaShieldAlt, FaMapMarkerAlt 
} from 'react-icons/fa';

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const AppointmentSlip = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendOrigin}/api/Appointments/${id}`);
        setAppointment(res.data);
      } catch (err) {
        console.error('Error fetching appointment slip:', err);
        setError('Appointment record not found or could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-border text-teal" role="status" style={{ width: '3rem', height: '3rem', color: '#0d9488' }}>
            <span className="visually-hidden">Loading Appointment Pass...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#475569', fontWeight: 500 }}>Generating Official Appointment Slip...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '520px', width: '100%', background: '#fff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
            !
          </div>
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.75rem' }}>Appointment Not Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error || 'We could not locate this appointment pass. It may have been updated or cancelled.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/doctors" style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#0d9488', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              Find Doctors
            </Link>
            <Link to="/" style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#f1f5f9', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              Hospital Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = appointment.date 
    ? new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Scheduled Date';

  return (
    <>
      <Helmet>
        <title>Appointment Slip #{appointment.id} - HealingWave Hospital</title>
      </Helmet>

      <div className="appointment-slip-container" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* Action Header (Hidden during Print) */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
              <FaArrowLeft /> Back to HealingWave
            </Link>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handlePrint} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '0.65rem 1.35rem', 
                  borderRadius: '10px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)' 
                }}
              >
                <FaPrint /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Official Hospital Appointment Slip Document */}
          <div 
            id="printable-slip"
            style={{ 
              background: '#ffffff', 
              borderRadius: '18px', 
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)', 
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            {/* Top Security Banner */}
            <div style={{ background: '#0f766e', color: '#ffffff', padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              <span><FaShieldAlt style={{ marginRight: '6px' }} /> OFFICIAL OUTPATIENT CONSULTATION PASS</span>
              <span>VERIFIED ENTRY TOKEN</span>
            </div>

            {/* Hospital Header */}
            <div style={{ padding: '2rem 2.5rem', borderBottom: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.75rem' }}>
                  <FaHospital />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                    HealingWave <span style={{ color: '#0d9488' }}>Hospital</span>
                  </h1>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaMapMarkerAlt size={12} /> Gulshan-2, Dhaka | 24/7 Helpline: +880-9612-444444
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block',
                  background: appointment.status === 'confirmed' ? '#dcfce7' : '#e0f2fe',
                  color: appointment.status === 'confirmed' ? '#15803d' : '#0369a1',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <FaCheckCircle style={{ marginRight: '5px' }} />
                  Slot Confirmed
                </span>
                <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                  Ref: <strong style={{ color: '#334155', fontFamily: 'monospace', fontSize: '0.9rem' }}>{appointment.id}</strong>
                </p>
              </div>
            </div>

            {/* Slip Core Grid */}
            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Patient Details Column */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUser style={{ color: '#0d9488' }} /> Patient Information
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Patient Name</span>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{appointment.patientName || 'Patient'}</strong>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                    <span style={{ color: '#334155', fontSize: '0.95rem' }}>{appointment.patientEmail || 'Not Provided'}</span>
                  </div>

                  {appointment.patientPhone && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Phone</span>
                      <span style={{ color: '#334155', fontSize: '0.95rem' }}>{appointment.patientPhone}</span>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Payment Mode</span>
                    <span style={{ 
                      display: 'inline-block',
                      background: appointment.paidStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: appointment.paidStatus === 'paid' ? '#15803d' : '#b45309',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      marginTop: '0.25rem'
                    }}>
                      {appointment.paidStatus === 'paid' ? 'PAID ONLINE' : 'PAY AT HOSPITAL COUNTER 3'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation & Schedule Column */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUserMd style={{ color: '#0d9488' }} /> Doctor & Consultation
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Assigned Specialist</span>
                    <strong style={{ fontSize: '1.15rem', color: '#0f766e' }}>{appointment.doctorName || 'Consultant Specialist'}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Department</span>
                    <span style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>{appointment.department || 'General Medicine'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaCalendarAlt size={10} color="#0d9488" /> DATE
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
                        {formattedDate}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaClock size={10} color="#0d9488" /> TIME SLOT
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0d9488', display: 'block', marginTop: '0.2rem' }}>
                        {appointment.timeSlot || 'Morning Session'}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Chamber Location</span>
                    <span style={{ color: '#334155', fontSize: '0.9rem' }}>OPD Block B, Room 204 (Level 2)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Verification Barcode & Instructions */}
            <div style={{ padding: '1.5rem 2.5rem', background: '#fcfdfd', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ maxWidth: '480px' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Patient Instructions:
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                  <li>Please arrive 15 minutes before your time slot to complete initial vitals checking.</li>
                  <li>Present this physical slip or digital QR at OPD Counter 3 to collect your consultation token.</li>
                  <li>Please carry any previous prescriptions or recent diagnostic test reports.</li>
                </ul>
              </div>

              {/* Simulated Digital Security Verification Barcode */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '3px', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '42px', 
                  padding: '4px 10px', 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '6px' 
                }}>
                  {[4, 2, 5, 1, 3, 2, 6, 2, 4, 1, 3, 5, 2, 4, 1, 6, 2, 3, 5, 1, 4, 2].map((w, i) => (
                    <div key={i} style={{ width: `${w}px`, height: '34px', background: '#0f172a' }}></div>
                  ))}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '2px', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>
                  *{appointment.id?.substring(0, 12).toUpperCase()}*
                </span>
              </div>
            </div>

            {/* Bottom Hospital Footer */}
            <div style={{ background: '#f8fafc', padding: '0.75rem 2.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
              HealingWave Hospital Web Portal &bull; Automated Health Agent Service &bull; Valid without physical signature
            </div>

          </div>

          {/* Post-slip help actions */}
          <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            Need to reschedule or cancel? You can ask the <strong>HealingWave AI Assistant</strong> anytime or contact support at <a href="mailto:support@healingwave.com" style={{ color: '#0d9488' }}>support@healingwave.com</a>.
          </div>

        </div>
      </div>

      {/* Embedded Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, header, nav, footer, .chatbot-icon-wrap, .chatbox-window {
            display: none !important;
          }
          .appointment-slip-container {
            padding: 0 !important;
            background: #ffffff !important;
          }
          #printable-slip {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default AppointmentSlip;
