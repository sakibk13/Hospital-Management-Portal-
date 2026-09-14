import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../../core/api/config';
import { Link } from 'react-router-dom';
import { storage } from '../../../utils/storage';
import AppointmentsChart from '../../shared/components/charts/AppointmentsChart';
import PatientsChart from '../../shared/components/charts/PatientsChart';
import { Helmet } from 'react-helmet';
import '../../../components/styles/PatientAccount.css';
import {
  FaCalendarCheck,
  FaUserInjured,
  FaCalendarDay,
  FaSearch,
  FaClipboardList,
  FaCalendarAlt,
  FaFileMedical,
  FaStethoscope,
  FaClock,
  FaPhoneAlt,
  FaUserMd,
  FaCheckCircle,
  FaVideo,
  FaTimes,
  FaCamera,
  FaHeartbeat,
  FaTint,
  FaWeight
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'trends', 'rx'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'emergency'

  // Image resolver
  const getImageUrl = (path, name = 'Doctor') => {
    if (!path) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&size=200`;
    }
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return clean;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const email = storage.getItem('doctorEmail');
        if (!email) return;
        setDoctorEmail(email);

        // 1. Fetch Doctor Profile
        try {
          const docRes = await api.get(`/doctors/ddetails/email/${encodeURIComponent(email)}`);
          if (docRes.data) {
            setDoctorProfile(docRes.data);
          }
        } catch (e) {
          try {
            const docRes = await axios.get(`/api/doctors/ddetails/email/${encodeURIComponent(email)}`);
            if (docRes.data) setDoctorProfile(docRes.data);
          } catch (err) {}
        }

        // 2. Fetch Total Appointments
        try {
          const appointmentRes = await api.get(`/appointments/count/${encodeURIComponent(email)}`);
          setTotalAppointments(appointmentRes.data.count || 0);
        } catch (e) {
          try {
            const appointmentRes = await axios.get(`/api/appointments/count/${encodeURIComponent(email)}`);
            setTotalAppointments(appointmentRes.data.count || 0);
          } catch (err) {}
        }

        // 3. Fetch Patient Count
        try {
          const patientRes = await api.get(`/prescriptions/count-patients?doctorEmail=${encodeURIComponent(email)}`);
          setTotalPatients(patientRes.data.count || 0);
        } catch (e) {
          try {
            const patientRes = await axios.get(`/api/prescriptions/count-patients?doctorEmail=${encodeURIComponent(email)}`);
            setTotalPatients(patientRes.data.count || 0);
          } catch (err) {}
        }

        // 4. Fetch Today's Appointments
        try {
          const todayAppointmentsRes = await api.get(`/appointments/today-appointments?doctorEmail=${encodeURIComponent(email)}`);
          setTodayAppointments(Array.isArray(todayAppointmentsRes.data) ? todayAppointmentsRes.data : []);
        } catch (e) {
          try {
            const todayAppointmentsRes = await axios.get(`/api/appointments/today-appointments?doctorEmail=${encodeURIComponent(email)}`);
            setTodayAppointments(Array.isArray(todayAppointmentsRes.data) ? todayAppointmentsRes.data : []);
          } catch (err) {}
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const doctorFullName = doctorProfile
    ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName || ''}`.trim()
    : `Dr. ${doctorEmail ? doctorEmail.split('@')[0] : 'Physician'}`;

  const doctorPhoto = doctorProfile?.profilePicture || null;

  const filteredAppointments = todayAppointments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (apt.patientName && apt.patientName.toLowerCase().includes(q)) ||
      (apt.patientEmail && apt.patientEmail.toLowerCase().includes(q)) ||
      (apt.timeSlot && apt.timeSlot.toLowerCase().includes(q))
    );
  });

  const nextPatient = todayAppointments.length > 0 ? todayAppointments[0] : null;

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <Helmet>
        <title>Doctor Portal | {doctorFullName}</title>
      </Helmet>

      {/* ====================================================================
          1. TOP QUICK BAR (Matching User Dashboard)
          ==================================================================== */}
      <div className="workspace-topbar">
        <div className="topbar-date">
          <FaCalendarAlt style={{ color: '#0d9488' }} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div className="topbar-actions">
          <div className="topbar-hotline">
            <FaPhoneAlt />
            <span>Emergency Trauma Line: +1 (800) 432-5464</span>
          </div>

          <Link to="/doctor/add-prescription" className="topbar-btn topbar-btn--primary">
            <FaClipboardList /> + Write Prescription
          </Link>
        </div>
      </div>

      {/* ====================================================================
          2. SMART DOCTOR HERO SHOWCASE (Matching User Dashboard)
          ==================================================================== */}
      <div className="patient-hero-showcase">
        <div className="patient-hero-left">
          {/* Prominent Doctor Avatar with camera/status badge */}
          <div
            className="patient-hero-avatar-wrap"
            onClick={() => { window.location.href = '/doctor-profile'; }}
            title="Doctor Profile & Settings"
          >
            <img
              src={getImageUrl(doctorPhoto, doctorFullName)}
              alt={doctorFullName}
              className="patient-hero-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorFullName)}&background=0284c7&color=fff&size=200`;
              }}
            />
            <div className="patient-hero-cam-badge">
              <FaCamera />
            </div>
          </div>

          <div className="patient-hero-details">
            <h1>Welcome back, {doctorFullName}! 🩺</h1>
            <p>Manage your active outpatient queue, scheduled surgeries, and digital prescriptions.</p>

            <div className="patient-hero-tags">
              <span className="hero-tag blood">
                <FaStethoscope /> {doctorProfile?.specialty || 'General Practice'}
              </span>
              <span className="hero-tag">
                ID: {doctorProfile?._id ? `#DOC-${doctorProfile._id.slice(-5).toUpperCase()}` : '#DOC-9421'}
              </span>
              <span className="hero-tag">
                {doctorProfile?.department || 'Clinical Medicine'}
              </span>
              <span className="hero-tag status-active">
                <FaCheckCircle /> BMDC Verified Specialist
              </span>
            </div>
          </div>
        </div>

        <div className="patient-hero-actions">
          <Link
            to="/doctor/add-prescription"
            className="hero-cta-btn light"
          >
            <FaClipboardList style={{ color: '#0d9488' }} /> Write New Rx
          </Link>
          <button
            type="button"
            className="hero-cta-btn glass"
            onClick={() => setActiveModal('emergency')}
          >
            <FaPhoneAlt /> Emergency Ward Desk
          </button>
        </div>
      </div>

      {/* ====================================================================
          3. LIVE CLINICAL METRICS / VITALS GRID (Matching User Dashboard)
          ==================================================================== */}
      <div className="vitals-tracker-grid">
        <div className="vital-card">
          <div className="vital-icon-box bp">
            <FaCalendarDay />
          </div>
          <div className="vital-meta">
            <span className="vital-label">Today's Queue</span>
            <span className="vital-value">{todayAppointments.length}</span>
            <span className="vital-badge">Active Waiting</span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-box glucose">
            <FaClipboardList />
          </div>
          <div className="vital-meta">
            <span className="vital-label">Total Consults</span>
            <span className="vital-value">{totalAppointments}</span>
            <span className="vital-badge">Completed & Logged</span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-box weight">
            <FaUserInjured />
          </div>
          <div className="vital-meta">
            <span className="vital-label">Unique Patients</span>
            <span className="vital-value">{totalPatients}</span>
            <span className="vital-badge">Under Primary Care</span>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-box checkup">
            <FaStethoscope />
          </div>
          <div className="vital-meta">
            <span className="vital-label">Clinical Station</span>
            <span className="vital-value">Room 402</span>
            <span className="vital-badge">Ward Telemetry Online</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. NEXT PATIENT IN QUEUE SHOWCASE (Matching User Dashboard)
          ==================================================================== */}
      {nextPatient ? (
        <div className="smart-appointment-showcase">
          <div className="apt-showcase-left">
            {/* Patient Portrait */}
            <div className="doctor-portrait-wrap">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nextPatient.patientName || 'Patient')}&background=0d9488&color=fff&size=160`}
                alt={nextPatient.patientName || 'Patient'}
                className="doctor-portrait-img"
              />
            </div>

            <div className="apt-showcase-details">
              <h4>Next Consultation with {nextPatient.patientName || 'Patient'}</h4>
              <p>{nextPatient.patientEmail || 'Scheduled Patient'} • Department: {nextPatient.department || 'Outpatient Review'}</p>

              <div className="apt-timing-row">
                <span className="apt-timing-chip">
                  <FaCalendarAlt style={{ color: '#0284c7' }} />
                  Today
                </span>
                <span className="apt-timing-chip">
                  <FaClock style={{ color: '#0d9488' }} />
                  {nextPatient.timeSlot}
                </span>
                <span className="apt-mode-badge">
                  {nextPatient.type === 'Video' ? <><FaVideo /> Video Consultation</> : 'In-Person Clinic'}
                </span>
              </div>
            </div>
          </div>

          <div className="apt-showcase-actions">
            <Link
              to={`/doctor/add-prescription?patientEmail=${encodeURIComponent(nextPatient.patientEmail || '')}&patientName=${encodeURIComponent(nextPatient.patientName || '')}`}
              className="topbar-btn topbar-btn--primary"
            >
              Start Consultation & Issue Rx
            </Link>
          </div>
        </div>
      ) : (
        <div className="smart-appointment-showcase">
          <div className="apt-showcase-left">
            <div className="doctor-portrait-wrap flex items-center justify-center bg-teal-50 text-teal-600">
              <FaCheckCircle size={32} />
            </div>
            <div className="apt-showcase-details">
              <h4>Consultation Queue Clear</h4>
              <p>All scheduled patient visits for today have been attended or none remaining.</p>
              <div className="apt-timing-row">
                <span className="apt-timing-chip text-emerald-700 font-bold">
                  ● Ready for New Patient Intakes
                </span>
              </div>
            </div>
          </div>
          <div className="apt-showcase-actions">
            <Link to="/doctor/add-prescription" className="topbar-btn topbar-btn--primary">
              <FaClipboardList /> Issue Walk-in Rx
            </Link>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. SMART SECTION TABS (Matching User Dashboard)
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-2">
        <div className="patient-tabs-bar border-none pb-0">
          <button
            className={`patient-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <FaCalendarDay /> Today's Queue ({filteredAppointments.length})
          </button>
          <button
            className={`patient-tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <FaHeartbeat /> Volume Trends & Growth
          </button>
          <button
            className={`patient-tab-btn ${activeTab === 'rx' ? 'active' : ''}`}
            onClick={() => setActiveTab('rx')}
          >
            <FaClipboardList /> Prescription Studio
          </button>
        </div>

        {/* Live Filter / Search Input */}
        <div className="relative max-w-xs w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, slot, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* ====================================================================
          6. TAB PANELS CONTENT
          ==================================================================== */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FaCalendarDay className="text-teal-600" />
                Active Consultation Intake Queue
              </h3>
              <p className="text-xs text-slate-500">Patients registered for clinical appointment today</p>
            </div>
            <Link
              to="/doctor/appointments"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors"
            >
              Full Schedule Directory &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-28">Slot Time</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consultation Type</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt, idx) => (
                    <tr key={apt._id || apt.id || `apt-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 w-fit">
                          <FaClock className="text-[10px]" />
                          <span>{apt.timeSlot}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patientName || 'Patient')}&background=0d9488&color=fff&size=100`}
                            alt={apt.patientName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-200 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {apt.patientName}
                            </p>
                            <p className="text-xs text-slate-500 leading-tight mt-0.5">
                              {apt.patientEmail || apt.patientPhone || 'Registered Outpatient'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {apt.type === 'Video' ? 'Video Tele-Health' : 'In-Person Examination'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Scheduled
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/doctor/add-prescription?patientEmail=${encodeURIComponent(apt.patientEmail || '')}&patientName=${encodeURIComponent(apt.patientName || '')}`}
                            className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            + Prescribe
                          </Link>
                          <Link
                            to="/doctor/appointments"
                            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                          >
                            Chart
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <FaCalendarCheck size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {searchQuery ? 'No matching patients found in queue' : 'All consultations attended for today'}
                        </p>
                        <p className="text-xs text-slate-500">Walk-in patients can be admitted via the prescription studio.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FaHeartbeat className="text-sky-600" />
              Monthly Consultation Velocity
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total patient consultations handled by department</p>
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
              <AppointmentsChart totalAppointments={totalAppointments} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FaUserInjured className="text-emerald-600" />
              Primary Care Patient Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Active and recurring patient retention tracking</p>
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
              <PatientsChart totalPatients={totalPatients} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rx' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-transparent rounded-2xl p-6 border border-teal-200 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-teal-600/20 shrink-0">
                ℞
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Digital Prescription Studio & Outpatient Pad
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                    BMDC Accredited
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Issue compliant digital medical prescriptions with automated drug dosages, timing schedules, clinical findings, and instant PDF patient printouts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/doctor/add-prescription"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-95"
              >
                <FaClipboardList /> Issue New Prescription
              </Link>
              <Link
                to="/doctor/prescriptions"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all"
              >
                <FaFileMedical /> Prescription Archive
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg mb-3">
                <FaClipboardList />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Standard Formulary</h4>
              <p className="text-xs text-slate-500">Access full dispensary stock with automated trade name dosage suggestions.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
                <FaFileMedical />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Printable Digital PDF</h4>
              <p className="text-xs text-slate-500">Patients receive instant digital health card notifications and printouts.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
                <FaStethoscope />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Clinical History Log</h4>
              <p className="text-xs text-slate-500">Prescription findings are permanently synced with patient EHR profiles.</p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          7. EMERGENCY WARD DESK MODAL
          ==================================================================== */}
      {activeModal === 'emergency' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5 text-rose-600 font-extrabold text-base">
                <FaPhoneAlt />
                <span>Hospital Trauma & Emergency Lines</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-900">Code Blue Critical Desk</p>
                  <p className="text-xs text-rose-700 font-mono font-bold">+1 (800) 432-9999</p>
                </div>
                <a href="tel:+18004329999" className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">
                  Call
                </a>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">ICU & Surgical Theatre Coordinator</p>
                  <p className="text-xs text-slate-600 font-mono font-bold">+1 (800) 432-8888</p>
                </div>
                <a href="tel:+18004328888" className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900">
                  Call
                </a>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Close Dispatch Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
