import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import api from '../../../core/api/config';
import PatientProfile from './PatientProfile';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../../utils/storage';
import '../../../components/styles/PatientAccount.css';
import {
  FaHeartbeat,
  FaTint,
  FaWeight,
  FaCalendarAlt,
  FaCalendarCheck,
  FaPrescriptionBottle,
  FaHospital,
  FaBed,
  FaIdCard,
  FaFileInvoiceDollar,
  FaCapsules,
  FaPhoneAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaCog,
  FaCamera,
  FaUserMd,
  FaClock,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaVideo,
  FaBell
} from 'react-icons/fa';

const PatientAccount = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(() => {
    const savedEmail = storage.getItem('patientEmail');
    const savedName = storage.getItem('patientName');
    return savedEmail ? { email: savedEmail, name: savedName || '' } : null;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, prescriptions, services
  const [activeModal, setActiveModal] = useState(null); // profile, vitals, emergency, logoutConfirmation
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data states
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Vitals
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    bloodSugar: '95 mg/dL',
    weight: '72 kg',
    lastCheckup: 'Recent'
  });

  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    bloodSugar: '',
    weight: ''
  });

  // Notifications
  const [notifications] = useState([
    { id: 1, type: 'appointment', message: 'Annual clinical review scheduled with cardiology.', time: '2 hours ago' },
    { id: 2, type: 'prescription', message: 'Prescription refill available at the hospital pharmacy.', time: 'Yesterday' },
    { id: 3, type: 'tip', message: 'Maintain 8 glasses of water daily and light cardio exercise.', time: '3 days ago' }
  ]);

  // Resolve image helper
  const getImageUrl = (path, fallbackName = 'Patient') => {
    if (!path) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0d9488&color=fff&size=200`;
    }
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return clean;
  };

  // 1. Fetch Patient details and doctors catalog
  useEffect(() => {
    const email = storage.getItem('patientEmail');
    if (!email) {
      navigate('/patient-login');
      return;
    }

    const loadData = async () => {
      try {
        // Fetch patient
        let res;
        try {
          res = await api.get(`/patients/pdetails/email/${encodeURIComponent(email)}`);
        } catch (e) {
          res = await axios.get(`/api/patients/pdetails/email/${encodeURIComponent(email)}`);
        }
        if (res && res.data) {
          setPatient(res.data);
          if (res.data.name) storage.setItem('patientName', res.data.name);

          setVitals({
            bloodPressure: res.data.bloodPressure || '120/80',
            bloodSugar: res.data.bloodSugar ? `${res.data.bloodSugar} mg/dL` : '95 mg/dL',
            weight: res.data.weight ? `${res.data.weight} kg` : '72 kg',
            lastCheckup: res.data.lastCheckup ? new Date(res.data.lastCheckup).toLocaleDateString() : 'Recent'
          });

          setVitalsForm({
            bloodPressure: res.data.bloodPressure || '120/80',
            bloodSugar: res.data.bloodSugar || '95',
            weight: res.data.weight || '72'
          });
        }

        // Fetch doctors map for matching doctor portraits
        try {
          const docRes = await api.get('/doctors/all');
          if (Array.isArray(docRes.data)) {
            const map = {};
            docRes.data.forEach((d) => {
              if (d._id) map[d._id] = d;
              if (d.id) map[d.id] = d;
              if (d.email) map[d.email.toLowerCase()] = d;
              const fullName = `dr. ${d.firstName} ${d.lastName}`.trim().toLowerCase();
              map[fullName] = d;
              map[`${d.firstName} ${d.lastName}`.trim().toLowerCase()] = d;
              if (d.lastName) map[d.lastName.toLowerCase()] = d;
            });
            setDoctorsMap(map);
          }
        } catch (docErr) {
          console.log('Error loading doctors catalog:', docErr);
        }

        // Fetch appointment count & upcoming
        try {
          const countRes = await api.get(`/appointments/count/patient/${encodeURIComponent(email)}`);
          setTotalAppointments(countRes.data?.count || 0);
        } catch (e) {
          try {
            const countRes = await axios.get(`/api/appointments/count/patient/${encodeURIComponent(email)}`);
            setTotalAppointments(countRes.data?.count || 0);
          } catch (err) {}
        }

        try {
          const upcomingRes = await api.get(`/appointments/upcoming/patient/${encodeURIComponent(email)}`);
          setUpcomingAppointments(Array.isArray(upcomingRes.data) ? upcomingRes.data : []);
        } catch (e) {
          try {
            const upcomingRes = await axios.get(`/api/appointments/upcoming/patient/${encodeURIComponent(email)}`);
            setUpcomingAppointments(Array.isArray(upcomingRes.data) ? upcomingRes.data : []);
          } catch (err) {}
        }

        // Fetch Prescriptions
        try {
          const presRes = await axios.get(`/api/prescriptions/patient/${encodeURIComponent(email)}`);
          if (Array.isArray(presRes.data)) {
            setPrescriptionsList(presRes.data);
          }
        } catch (e) {}
      } catch (err) {
        console.error('Error loading patient dashboard:', err);
      }
    };

    loadData();
  }, [refreshTrigger, navigate]);

  const handleLogout = () => {
    storage.removeItem('patientToken');
    storage.removeItem('patientEmail');
    storage.removeItem('patientName');
    window.location.href = '/';
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!patient?.email) return;
    try {
      await api.put('/patients/pupdate', {
        email: patient.email,
        bloodPressure: vitalsForm.bloodPressure,
        bloodSugar: vitalsForm.bloodSugar,
        weight: vitalsForm.weight
      });
      setVitals({
        bloodPressure: vitalsForm.bloodPressure || vitals.bloodPressure,
        bloodSugar: vitalsForm.bloodSugar ? `${vitalsForm.bloodSugar} mg/dL` : vitals.bloodSugar,
        weight: vitalsForm.weight ? `${vitalsForm.weight} kg` : vitals.weight,
        lastCheckup: 'Today'
      });
      setActiveModal(null);
    } catch (err) {
      console.error('Failed to update vitals:', err);
    }
  };

  // Helper to match Doctor photo
  const getDoctorPhoto = (apt) => {
    if (!apt) return null;
    const keyId = apt.doctor;
    const keyEmail = apt.doctorEmail ? apt.doctorEmail.toLowerCase() : null;
    const keyName = apt.doctorName ? apt.doctorName.toLowerCase().trim() : null;

    const matched = (keyId && doctorsMap[keyId]) ||
                    (keyEmail && doctorsMap[keyEmail]) ||
                    (keyName && doctorsMap[keyName]) ||
                    (keyName && doctorsMap[keyName.replace(/^dr\.?\s*/i, '').trim()]);

    return matched?.profilePicture || null;
  };

  const displayName = patient?.name ||
    (patient?.firstName ? `${patient.firstName} ${patient.lastName || ''}`.trim() : '') ||
    storage.getItem('patientName') ||
    'Valued Patient';

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
  const nextDoctorPhoto = nextAppointment ? getDoctorPhoto(nextAppointment) : null;

  return (
    <div className="patient-portal-root">
      <Helmet>
        <title>Patient Portal | {displayName}</title>
      </Helmet>

      {/* ====================================================================
          LEFT SLIDING SIDEBAR (Like Doctor Dashboard)
          ==================================================================== */}
      <aside className={`patient-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
        {/* Floating Toggle Button */}
        <button
          className="patient-sidebar__toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* Brand Header */}
        <div className="patient-sidebar__header">
          <div className="patient-sidebar__logo">
            <FaHospital />
          </div>
          {!isSidebarCollapsed && (
            <div className="patient-sidebar__brand-text">
              <h2>HealingWave</h2>
              <span>Patient Portal</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="patient-sidebar__nav">
          <button
            className={`patient-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Dashboard Overview"
          >
            <span className="patient-nav-icon"><FaHeartbeat /></span>
            {!isSidebarCollapsed && <span className="patient-nav-label">Dashboard</span>}
          </button>

          <button
            className={`patient-nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
            title="My Appointments"
          >
            <span className="patient-nav-icon"><FaCalendarCheck /></span>
            {!isSidebarCollapsed && (
              <>
                <span className="patient-nav-label">Appointments</span>
                {upcomingAppointments.length > 0 && (
                  <span className="patient-nav-badge">{upcomingAppointments.length}</span>
                )}
              </>
            )}
          </button>

          <Link
            to="/patient/prescription"
            className={`patient-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            title="My Prescriptions"
          >
            <span className="patient-nav-icon"><FaPrescriptionBottle /></span>
            {!isSidebarCollapsed && (
              <>
                <span className="patient-nav-label">Prescriptions</span>
                {prescriptionsList.length > 0 && (
                  <span className="patient-nav-badge">{prescriptionsList.length}</span>
                )}
              </>
            )}
          </Link>

          <Link to="/patient/healthcard" className="patient-nav-item" title="Health Card">
            <span className="patient-nav-icon"><FaIdCard /></span>
            {!isSidebarCollapsed && <span className="patient-nav-label">Digital Health Card</span>}
          </Link>

          <Link to="/patient/bookcabin" className="patient-nav-item" title="Book Cabin / Ward">
            <span className="patient-nav-icon"><FaBed /></span>
            {!isSidebarCollapsed && <span className="patient-nav-label">Cabin & Ward</span>}
          </Link>

          <Link to="/patient/testbills" className="patient-nav-item" title="Lab Reports & Bills">
            <span className="patient-nav-icon"><FaFileInvoiceDollar /></span>
            {!isSidebarCollapsed && <span className="patient-nav-label">Bills & Invoices</span>}
          </Link>

          <Link to="/patient/pharmacy" className="patient-nav-item" title="Hospital Pharmacy Store">
            <span className="patient-nav-icon"><FaCapsules /></span>
            {!isSidebarCollapsed && <span className="patient-nav-label">Pharmacy Store</span>}
          </Link>
        </nav>

        {/* Bottom Profile Dock (Showing Patient Photo!) */}
        <div className="patient-sidebar__profile">
          <div
            className="patient-profile-dock"
            onClick={() => setActiveModal('profile')}
            title="Open Profile Settings"
          >
            <div className="dock-avatar-wrap">
              <img
                src={getImageUrl(patient?.profilePicture, displayName)}
                alt={displayName}
                className="dock-avatar-img"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff&size=100`;
                }}
              />
              <span className="dock-status-dot"></span>
            </div>

            {!isSidebarCollapsed && (
              <div className="dock-info">
                <p className="dock-name">{displayName}</p>
                <p className="dock-role">Patient ID: {patient?._id ? `#${patient._id.slice(-5).toUpperCase()}` : '#HWP-1049'}</p>
              </div>
            )}

            {!isSidebarCollapsed && (
              <div className="dock-actions">
                <button
                  type="button"
                  className="dock-btn"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('profile'); }}
                  title="Settings"
                >
                  <FaCog />
                </button>
                <button
                  type="button"
                  className="dock-btn logout"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('logoutConfirmation'); }}
                  title="Sign Out"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN WORKSPACE
          ==================================================================== */}
      <main className="patient-workspace">
        <div className="patient-workspace__inner">
          {/* Top Quick Bar */}
          <div className="workspace-topbar">
            <div className="topbar-date">
              <FaCalendarAlt style={{ color: '#0d9488' }} />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div className="topbar-actions">
              <div className="topbar-hotline">
                <FaPhoneAlt />
                <span>Trauma Hotline: +1 (800) 432-5464</span>
              </div>

              <Link to="/patient/appointment" className="topbar-btn topbar-btn--primary">
                <FaCalendarCheck /> Book Appointment
              </Link>
            </div>
          </div>

          {/* Smart Patient Hero Showcase (Showing Patient Photo!) */}
          <div className="patient-hero-showcase">
            <div className="patient-hero-left">
              {/* Prominent Patient Photo with click to edit */}
              <div
                className="patient-hero-avatar-wrap"
                onClick={() => setActiveModal('profile')}
                title="Click to change profile photo"
              >
                <img
                  src={getImageUrl(patient?.profilePicture, displayName)}
                  alt={displayName}
                  className="patient-hero-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff&size=200`;
                  }}
                />
                <div className="patient-hero-cam-badge">
                  <FaCamera />
                </div>
              </div>

              <div className="patient-hero-details">
                <h1>Welcome back, {displayName.split(' ')[0]}! 👋</h1>
                <p>Track your health vitals, active doctor appointments, and medical prescriptions.</p>

                <div className="patient-hero-tags">
                  <span className="hero-tag blood">
                    <FaTint /> Blood: {patient?.bloodGroup || 'O+'}
                  </span>
                  <span className="hero-tag">
                    ID: {patient?._id ? `#${patient._id.slice(-6).toUpperCase()}` : '#HWP-1049'}
                  </span>
                  <span className="hero-tag">
                    {patient?.sex || 'Patient'}
                  </span>
                  <span className="hero-tag status-active">
                    <FaCheckCircle /> Verified Patient
                  </span>
                </div>
              </div>
            </div>

            <div className="patient-hero-actions">
              <button
                type="button"
                className="hero-cta-btn light"
                onClick={() => setActiveModal('vitals')}
              >
                <FaHeartbeat style={{ color: '#0d9488' }} /> Update Vitals
              </button>
              <button
                type="button"
                className="hero-cta-btn glass"
                onClick={() => setActiveModal('emergency')}
              >
                <FaPhoneAlt /> Emergency Desk
              </button>
            </div>
          </div>

          {/* Live Health Metrics / Vitals Bar */}
          <div className="vitals-tracker-grid">
            <div className="vital-card">
              <div className="vital-icon-box bp"><FaHeartbeat /></div>
              <div className="vital-meta">
                <span className="vital-label">Blood Pressure</span>
                <span className="vital-value">{vitals.bloodPressure}</span>
                <span className="vital-badge">Normal Range</span>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon-box glucose"><FaTint /></div>
              <div className="vital-meta">
                <span className="vital-label">Blood Glucose</span>
                <span className="vital-value">{vitals.bloodSugar}</span>
                <span className="vital-badge">Optimal</span>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon-box weight"><FaWeight /></div>
              <div className="vital-meta">
                <span className="vital-label">Body Weight</span>
                <span className="vital-value">{vitals.weight}</span>
                <span className="vital-badge">Healthy BMI</span>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon-box checkup"><FaCalendarAlt /></div>
              <div className="vital-meta">
                <span className="vital-label">Last Checkup</span>
                <span className="vital-value">{vitals.lastCheckup}</span>
                <span className="vital-badge">Consultation Done</span>
              </div>
            </div>
          </div>

          {/* Next Appointment Showcase (Showing Doctor Photo!) */}
          {nextAppointment && (
            <div className="smart-appointment-showcase">
              <div className="apt-showcase-left">
                {/* Doctor Portrait */}
                <div className="doctor-portrait-wrap">
                  <img
                    src={getImageUrl(nextDoctorPhoto, nextAppointment.doctorName || 'Doctor')}
                    alt={nextAppointment.doctorName || 'Doctor'}
                    className="doctor-portrait-img"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nextAppointment.doctorName || 'Doctor')}&background=0284c7&color=fff&size=200`;
                    }}
                  />
                </div>

                <div className="apt-showcase-details">
                  <h4>Upcoming Consultation with {nextAppointment.doctorName || 'Specialist Doctor'}</h4>
                  <p>{nextAppointment.department || nextAppointment.specialization || 'Clinical Department'}</p>

                  <div className="apt-timing-row">
                    <span className="apt-timing-chip">
                      <FaCalendarAlt style={{ color: '#0284c7' }} />
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="apt-timing-chip">
                      <FaClock style={{ color: '#0d9488' }} />
                      {nextAppointment.timeSlot}
                    </span>
                    <span className="apt-mode-badge">
                      {nextAppointment.type === 'Video' ? <><FaVideo /> Video Consultation</> : 'In-Person Clinic'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="apt-showcase-actions">
                <Link to="/patient/appointment-details" className="topbar-btn topbar-btn--primary">
                  View Appointment
                </Link>
              </div>
            </div>
          )}

          {/* Smart Section Tabs */}
          <div className="patient-tabs-bar">
            <button
              className={`patient-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaHeartbeat /> Overview
            </button>
            <button
              className={`patient-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <FaCalendarCheck /> Appointments ({upcomingAppointments.length})
            </button>
            <button
              className={`patient-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <FaPrescriptionBottle /> Prescriptions ({prescriptionsList.length})
            </button>
            <button
              className={`patient-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <FaHospital /> Hospital Services
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="services-hub-grid">
              <Link to="/patient/appointment" className="service-hub-card">
                <div className="service-icon-wrap tests"><FaCalendarCheck /></div>
                <h4>Schedule Specialist</h4>
                <p>Book consults with board-certified physicians in 15+ departments.</p>
              </Link>
              <Link to="/patient/prescription" className="service-hub-card">
                <div className="service-icon-wrap prescription"><FaPrescriptionBottle /></div>
                <h4>My Medical Prescriptions</h4>
                <p>View active doctor prescriptions, medication schedules & download official PDFs.</p>
              </Link>
              <Link to="/patient/pharmacy" className="service-hub-card">
                <div className="service-icon-wrap pharmacy"><FaCapsules /></div>
                <h4>Hospital Pharmacy Store</h4>
                <p>Order prescribed medications, OTC drugs, health supplements & home delivery.</p>
              </Link>
              <Link to="/patient/healthcard" className="service-hub-card">
                <div className="service-icon-wrap card"><FaIdCard /></div>
                <h4>Digital Health ID</h4>
                <p>Access your electronic patient QR code, BDT balance & health pass.</p>
              </Link>
              <Link to="/patient/bookcabin" className="service-hub-card">
                <div className="service-icon-wrap cabin"><FaBed /></div>
                <h4>Cabin & Ward Reservation</h4>
                <p>Select specialized intensive care, luxury private, or general cabins.</p>
              </Link>
              <Link to="/patient/testbills" className="service-hub-card">
                <div className="service-icon-wrap tests"><FaFileInvoiceDollar /></div>
                <h4>Diagnostic Invoices</h4>
                <p>Download billing receipts and automated diagnostic test summaries.</p>
              </Link>
              <Link to="/blood-availability" className="service-hub-card">
                <div className="service-icon-wrap blood"><FaTint /></div>
                <h4>Blood Bank Stock</h4>
                <p>Live inventory lookup across all blood types and plasma reserves.</p>
              </Link>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS HUB (Showing Doctor Photos on every card!) */}
          {activeTab === 'appointments' && (
            <div className="appointments-hub-grid">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => {
                  const docPhoto = getDoctorPhoto(apt);
                  return (
                    <div key={apt._id || apt.id} className="apt-hub-card">
                      <div className="apt-hub-card-header">
                        {/* Doctor Photo */}
                        <img
                          src={getImageUrl(docPhoto, apt.doctorName || 'Doctor')}
                          alt={apt.doctorName || 'Doctor'}
                          className="apt-doc-portrait-small"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName || 'Doctor')}&background=0284c7&color=fff&size=120`;
                          }}
                        />
                        <div className="apt-doc-info">
                          <h4>{apt.doctorName || 'Consultant Specialist'}</h4>
                          <p>{apt.department || 'Clinical Medicine'}</p>
                        </div>
                      </div>

                      <div className="apt-hub-schedule-row">
                        <span>
                          <FaCalendarAlt style={{ marginRight: '6px', color: '#0284c7' }} />
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span>
                          <FaClock style={{ marginRight: '6px', color: '#0d9488' }} />
                          {apt.timeSlot}
                        </span>
                        <span className={`apt-status-pill ${apt.status?.toLowerCase() || 'confirmed'}`}>
                          {apt.status || 'Confirmed'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Status: <strong>{apt.paidStatus || 'Unpaid'}</strong>
                        </span>
                        <Link
                          to="/patient/appointment-details"
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#0d9488',
                            textDecoration: 'underline'
                          }}
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '16px' }}>
                  <FaCalendarAlt style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No Scheduled Appointments</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                    Need medical consultation? Browse our specialist faculty and reserve a slot.
                  </p>
                  <Link to="/patient/appointment" className="topbar-btn topbar-btn--primary">
                    Book Your First Appointment
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="appointments-hub-grid">
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Clinical Prescriptions Directory</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>Access complete drug dosages, administration schedules, and print official hospital PDF copies.</p>
                </div>
                <Link to="/patient/prescription" className="topbar-btn topbar-btn--primary">
                  Open Dedicated Rx Page →
                </Link>
              </div>

              {prescriptionsList.length > 0 ? (
                prescriptionsList.map((pres) => (
                  <div key={pres._id || pres.id} className="apt-hub-card">
                    <div className="apt-hub-card-header">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                        <FaPrescriptionBottle />
                      </div>
                      <div className="apt-doc-info">
                        <h4>{pres.doctorName || 'Prescribing Physician'}</h4>
                        <p>Date: {new Date(pres.createdAt || pres.date || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '0.84rem' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a' }}>Medications / Notes:</p>
                      <p style={{ margin: 0, color: '#64748b', whiteSpace: 'pre-line' }}>{pres.prescriptionText || pres.diagnosis || 'Routine consultation medication guidelines.'}</p>
                    </div>

                    <Link to="/patient/prescription" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textAlign: 'right', display: 'inline-block' }}>
                      Open Prescription Details →
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '16px' }}>
                  <FaPrescriptionBottle style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No Prescriptions on Record</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Prescriptions created by attending doctors will appear here automatically.</p>
                  <Link to="/patient/prescription" className="topbar-btn topbar-btn--primary">
                    Go to Prescriptions Page
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HOSPITAL SERVICES */}
          {activeTab === 'services' && (
            <div className="services-hub-grid">
              <Link to="/patient/prescription" className="service-hub-card">
                <div className="service-icon-wrap prescription"><FaPrescriptionBottle /></div>
                <h4>My Medical Prescriptions</h4>
                <p>View active clinical prescriptions, dosage guidelines & download official PDFs.</p>
              </Link>
              <Link to="/patient/pharmacy" className="service-hub-card">
                <div className="service-icon-wrap pharmacy"><FaCapsules /></div>
                <h4>Hospital Pharmacy Store</h4>
                <p>Order verified medications, OTC drugs, healthcare supplies & home delivery.</p>
              </Link>
              <Link to="/patient/bookward" className="service-hub-card">
                <div className="service-icon-wrap ward"><FaBed /></div>
                <h4>Book General Ward</h4>
                <p>Reserve air-conditioned inpatient beds in specialized surgical or pediatric wards.</p>
              </Link>
              <Link to="/patient/bookcabin" className="service-hub-card">
                <div className="service-icon-wrap cabin"><FaBed /></div>
                <h4>Book Private Cabin</h4>
                <p>Deluxe single or executive private recovery suites with round-the-clock nursing.</p>
              </Link>
              <Link to="/patient/healthcard" className="service-hub-card">
                <div className="service-icon-wrap card"><FaIdCard /></div>
                <h4>Digital Health ID Card</h4>
                <p>Instantly download or view your official QR-enabled hospital health pass.</p>
              </Link>
              <Link to="/patient/testbills" className="service-hub-card">
                <div className="service-icon-wrap tests"><FaFileInvoiceDollar /></div>
                <h4>Diagnostic Lab Bills</h4>
                <p>Check lab test payment statuses, invoices, and diagnostic receipts.</p>
              </Link>
              <Link to="/blood-availability" className="service-hub-card">
                <div className="service-icon-wrap blood"><FaTint /></div>
                <h4>Blood Inventory & Donors</h4>
                <p>Live hospital blood stock inquiry and direct donor matching portal.</p>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* ====================================================================
          MODALS
          ==================================================================== */}
      {/* 1. Profile Settings Modal */}
      {activeModal === 'profile' && (
        <PatientProfile
          email={patient?.email}
          onClose={() => setActiveModal(null)}
          onProfileUpdate={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* 2. Vitals Update Modal */}
      {activeModal === 'vitals' && (
        <div className="chart-modal" onClick={() => setActiveModal(null)}>
          <div className="chart-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Update Health Vitals
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
              Record your current metrics for physician review.
            </p>

            <form onSubmit={handleSaveVitals} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={vitalsForm.bloodPressure}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 95"
                  value={vitalsForm.bloodSugar}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bloodSugar: e.target.value })}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Body Weight (kg)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 72"
                  value={vitalsForm.weight}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ flex: 1, height: '42px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, height: '42px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Emergency Contacts Modal */}
      {activeModal === 'emergency' && (
        <div className="chart-modal" onClick={() => setActiveModal(null)}>
          <div className="chart-modal-content emergency-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="chart-modal-title">Emergency Helpline Desk</h3>
            <div className="emergency-contacts">
              <div className="emergency-item">
                <FaPhoneAlt className="emergency-icon" />
                <div>
                  <h4>Hospital Trauma Ambulance</h4>
                  <a href="tel:102" className="emergency-number">102 (Toll Free)</a>
                </div>
              </div>
              <div className="emergency-item">
                <FaPhoneAlt className="emergency-icon" />
                <div>
                  <h4>Emergency Room Hotline</h4>
                  <a href="tel:+18004325464" className="emergency-number">+1 (800) 432-5464</a>
                </div>
              </div>
              <div className="emergency-item">
                <FaPhoneAlt className="emergency-icon" />
                <div>
                  <h4>24/7 Clinical Care Desk</h4>
                  <a href="tel:+18004325465" className="emergency-number">+1 (800) 432-5465</a>
                </div>
              </div>
            </div>
            <button className="chart-modal-close" onClick={() => setActiveModal(null)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* 4. Logout Confirmation Modal */}
      {activeModal === 'logoutConfirmation' && (
        <div className="chart-modal" onClick={() => setActiveModal(null)}>
          <div className="chart-modal-content logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Sign Out</h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '20px' }}>
              Are you sure you want to end your current session?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{ flex: 1, height: '42px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAccount;
