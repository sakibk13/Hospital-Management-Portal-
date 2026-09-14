import React, { useEffect, useState } from 'react';
import { 
  FaTimes, FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaVenusMars, 
  FaNotesMedical, FaFilePrescription, FaCalendarCheck, FaHeartbeat, 
  FaTint, FaShieldAlt, FaClock, FaIdCard, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import api from '../../../../core/api/config';

const PatientDetailsSheet = ({ patient, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments'

  useEffect(() => {
    if (patient?.email) {
      fetchAppointments(patient.email);
    }
  }, [patient]);

  const fetchAppointments = async (email) => {
    try {
      setLoadingApps(true);
      const res = await api.get(`/appointments/patient/email/${encodeURIComponent(email)}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not load patient appointments:', err?.message);
      setAppointments([]);
    } finally {
      setLoadingApps(false);
    }
  };

  if (!patient) return null;

  // Calculate age if DOB exists
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 'N/A';
    const ageDiff = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' yrs';
  };

  const isCritical = patient.status?.toLowerCase() === 'critical';
  const patientInitials = (patient.name || patient.firstName || 'P')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const patientIdCode = patient._id ? `#PAT-${patient._id.slice(-6).toUpperCase()}` : '#PAT-0042';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800 z-10">
        
        {/* Clinical Header Banner */}
        <div className="relative p-6 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white shadow-md">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Close Sheet"
          >
            <FaTimes className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black border-2 border-white/30 shadow-inner">
              {patientInitials}
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  {patientIdCode}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  isCritical 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {patient.status || 'Stable'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 leading-tight">
                {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}
              </h2>
              <p className="text-xs text-sky-100 flex items-center gap-1.5 mt-0.5">
                <FaEnvelope className="text-[10px] opacity-80" />
                {patient.email || 'No email specified'}
              </p>
            </div>
          </div>

          {/* Quick Tabs in Header */}
          <div className="flex gap-2 mt-5 border-t border-white/15 pt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Overview & Vitals
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'appointments'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FaCalendarCheck className="text-[11px]" />
              Appointments
              {appointments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black">
                  {appointments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {activeTab === 'overview' && (
            <>
              {/* Medical Vitals Strip */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FaHeartbeat className="text-rose-500" />
                  Clinical Metrics & Vitals
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Blood Group</p>
                    <p className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                      <FaTint className="text-xs text-rose-500" />
                      {patient.bloodGroup || 'O+'}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Age / Gender</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {calculateAge(patient.dateOfBirth)} • {patient.sex || 'Male'}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Diagnosis</p>
                    <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5 truncate" title={patient.diagnosis}>
                      {patient.diagnosis || 'Routine'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Contact Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FaUser className="text-sky-500" />
                  Patient Information
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                      <FaPhone className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Contact</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{patient.mobileNumber || patient.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <FaEnvelope className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{patient.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <FaBirthdayCake className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Care Records */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FaNotesMedical className="text-amber-500" />
                  Primary Care Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/30">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-1">
                      <FaNotesMedical className="text-xs" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">Diagnosis</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {patient.diagnosis || 'Routine Health Examination'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/70 dark:border-indigo-900/30">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 mb-1">
                      <FaShieldAlt className="text-xs" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">Record Status</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Active Inpatient / OPD
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FaCalendarCheck className="text-sky-500" />
                  Consultation Schedule
                </h3>
                <span className="text-xs text-slate-500 font-medium">{appointments.length} recorded</span>
              </div>

              {loadingApps ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="inline-block w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs font-semibold text-slate-500">Retrieving patient appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((app, idx) => (
                    <div 
                      key={app._id || app.id || `app-${idx}`} 
                      className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                            {app.doctorName || 'Assigned Physician'}
                          </p>
                          <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                            {app.department || 'General OPD'}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          app.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : app.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {app.status || 'Scheduled'}
                        </span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <FaCalendarCheck className="text-slate-400 text-[11px]" />
                          {app.date ? new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <FaClock className="text-slate-400 text-[10px]" />
                          {app.timeSlot || '09:00 AM - 10:00 AM'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-2">
                    <FaCalendarCheck className="text-lg" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Appointments Recorded</p>
                  <p className="text-xs text-slate-400 mt-0.5">This patient has not booked any consultations yet.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === 'overview' ? 'appointments' : 'overview')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <FaNotesMedical />
            {activeTab === 'overview' ? 'View Appointments' : 'Back to Vitals'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientDetailsSheet;
