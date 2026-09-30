import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { 
  FaTint, FaHospital, FaCalendarAlt, FaUser, 
  FaPhoneAlt, FaPrint, FaCheckCircle, 
  FaArrowLeft, FaShieldAlt, FaAward, FaHeartbeat 
} from 'react-icons/fa';

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const BloodSlip = () => {
  const { type, id } = useParams(); // type: 'donor' or 'recipient'
  const isDonor = type === 'donor';

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const endpoint = isDonor 
          ? `${backendOrigin}/api/BloodDonor/${id}`
          : `${backendOrigin}/api/BloodRecipient/${id}`;
        
        const res = await axios.get(endpoint);
        setRecord(res.data);
      } catch (err) {
        console.error('Error fetching blood pass:', err);
        setError(`Blood ${isDonor ? 'donor' : 'requisition'} record could not be retrieved.`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecord();
    }
  }, [type, id, isDonor]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading Record...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#475569', fontWeight: 500 }}>
            Generating Official Blood Bank {isDonor ? 'Donor Pass' : 'Requisition Slip'}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '520px', width: '100%', background: '#fff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
            !
          </div>
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.75rem' }}>Record Not Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error || 'We could not locate this blood bank record.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/blood-bank" style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#dc2626', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              Blood Bank Home
            </Link>
            <Link to="/" style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#f1f5f9', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              Hospital Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bloodGroup = record.bloodGroup || record.bloodNeeded || 'Unknown';
  const personName = record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Valued Individual';
  const formattedDate = record.donationDate || record.createdAt 
    ? new Date(record.donationDate || record.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>{isDonor ? 'Donor Pass' : 'Blood Requisition'} #{record.id} - HealingWave Blood Bank</title>
      </Helmet>

      <div className="blood-slip-container" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* Action Header (Hidden during Print) */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link to="/blood-bank" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>
              <FaArrowLeft /> Back to Blood Bank
            </Link>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handlePrint} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: isDonor ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '0.65rem 1.35rem', 
                  borderRadius: '10px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)' 
                }}
              >
                <FaPrint /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Document Card */}
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
            <div style={{ 
              background: isDonor ? '#991b1b' : '#0f766e', 
              color: '#ffffff', 
              padding: '0.6rem 2rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.8rem', 
              letterSpacing: '0.5px' 
            }}>
              <span><FaShieldAlt style={{ marginRight: '6px' }} /> HEALINGWAVE CENTRAL BLOOD BANK & TRANSFUSION MEDICINE</span>
              <span>{isDonor ? 'VOLUNTEER DONOR CERTIFICATE' : 'EMERGENCY REQUISITION SLIP'}</span>
            </div>

            {/* Header */}
            <div style={{ padding: '2rem 2.5rem', borderBottom: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  background: isDonor ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontSize: '1.75rem' 
                }}>
                  <FaTint />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                    HealingWave <span style={{ color: isDonor ? '#dc2626' : '#0d9488' }}>Blood Bank</span>
                  </h1>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Plot 15, Road 27, Gulshan-2, Dhaka | Blood Line: +880-9612-444445
                  </p>
                </div>
              </div>

              {/* Big Blood Badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  background: '#fee2e2', 
                  color: '#dc2626', 
                  border: '2px solid #fca5a5', 
                  padding: '0.5rem 1.4rem', 
                  borderRadius: '14px' 
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isDonor ? 'DONOR GROUP' : 'REQUIRED GROUP'}
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
                    {bloodGroup}
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                  Ref: <strong style={{ color: '#334155', fontFamily: 'monospace' }}>{record.id}</strong>
                </p>
              </div>
            </div>

            {/* Donor Acknowledgment Banner (If Donor) */}
            {isDonor && (
              <div style={{ background: '#fef2f2', padding: '1rem 2.5rem', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaAward size={24} color="#dc2626" />
                <span style={{ color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
                  Thank you for your life-saving generosity! Every voluntary donation supports critical surgeries and emergency trauma care.
                </span>
              </div>
            )}

            {/* Core Details Grid */}
            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Personal Details */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUser style={{ color: isDonor ? '#dc2626' : '#0d9488' }} /> {isDonor ? 'Donor Profile' : 'Patient / Recipient'}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Full Name</span>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{personName}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Age</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{record.age ? `${record.age} Years` : 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Gender</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{record.gender || 'Not Specified'}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Contact Phone</span>
                    <span style={{ color: '#334155', fontSize: '0.95rem' }}>{record.phone || record.phoneNumber || 'Not Provided'}</span>
                  </div>

                  {record.email && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Email</span>
                      <span style={{ color: '#334155', fontSize: '0.9rem' }}>{record.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Verification Details */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaHeartbeat style={{ color: isDonor ? '#dc2626' : '#0d9488' }} /> {isDonor ? 'Donation Status' : 'Requisition Request'}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                      {isDonor ? 'Registration / Donation Date' : 'Request Date'}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <FaCalendarAlt size={12} color="#dc2626" /> {formattedDate}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Registry Status</span>
                    <span style={{ 
                      display: 'inline-block',
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      marginTop: '0.25rem'
                    }}>
                      <FaCheckCircle style={{ marginRight: '4px' }} />
                      {isDonor ? 'VERIFIED IN DONOR INVENTORY' : 'ACTIVE IN EMERGENCY QUEUE'}
                    </span>
                  </div>

                  {!isDonor && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Hospital / Destination</span>
                      <strong style={{ color: '#0f766e', fontSize: '1rem' }}>{record.hospital || 'HealingWave Hospital'}</strong>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Verification Location</span>
                    <span style={{ color: '#334155', fontSize: '0.9rem' }}>Central Blood Bank Room 104, Ground Floor</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Barcode & Instructions */}
            <div style={{ padding: '1.5rem 2.5rem', background: '#fcfdfd', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ maxWidth: '480px' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Important Instructions:
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                  {isDonor ? (
                    <>
                      <li>Please rest for 10-15 minutes after donation and drink plenty of fluids.</li>
                      <li>Carry this pass for free health screenings and priority family donor credits.</li>
                    </>
                  ) : (
                    <>
                      <li>Present this slip at Room 104 with a 5ml cross-matching blood sample tube.</li>
                      <li>For immediate emergency release, call Blood Hotline: +880-9612-444445.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Barcode Graphic */}
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
                  {[3, 2, 6, 1, 4, 2, 5, 2, 3, 1, 4, 6, 2, 5, 1, 4, 2, 3, 6, 1, 3, 2].map((w, i) => (
                    <div key={i} style={{ width: `${w}px`, height: '34px', background: isDonor ? '#991b1b' : '#0f766e' }}></div>
                  ))}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '2px', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>
                  *{record.id?.substring(0, 12).toUpperCase()}*
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#f8fafc', padding: '0.75rem 2.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
              HealingWave Blood Bank &bull; Automated Health Agent Service &bull; Valid without physical signature
            </div>

          </div>

          {/* Post-slip contact */}
          <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            Questions? Contact the <strong>HealingWave Blood Bank</strong> 24/7 at +880-9612-444445 or chat with our <strong>AI Assistant</strong>.
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
          .blood-slip-container {
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

export default BloodSlip;
