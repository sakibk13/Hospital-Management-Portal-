import React, { useEffect, useState } from 'react';
import { 
  FaTimes, FaPhone, FaEnvelope, FaUserMd, FaStethoscope, FaHospital, 
  FaStar, FaCalendarCheck, FaClock, FaCheckCircle, FaUserInjured, FaAward
} from 'react-icons/fa';
import api from '../../../../core/api/config';

const DoctorDetailsSheet = ({ doctor, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments'

  useEffect(() => {
    if (doctor?.email) {
      fetchDoctorAppointments(doctor.email);
    }
  }, [doctor]);

  const fetchDoctorAppointments = async (email) => {
    try {
      setLoadingApps(true);
      const res = await api.get(`/appointments/doctor/email/${encodeURIComponent(email)}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not load doctor appointments:', err?.message);
      setAppointments([]);
    } finally {
      setLoadingApps(false);
    }
  };

  if (!doctor) return null;

  const doctorInitials = `${doctor.firstName?.[0] || 'D'}${doctor.lastName?.[0] || 'R'}`.toUpperCase();
  const doctorIdCode = doctor._id ? `#DOC-${doctor._id.slice(-6).toUpperCase()}` : '#DOC-1024';
  const ratingVal = Number(doctor.rating) || 4.8;

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
        <div className="relative p-6 bg-gradient-to-r from-teal-600 via-cyan-700 to-sky-700 text-white shadow-md">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Close Sheet"
          >
            <FaTimes className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black border-2 border-white/30 shadow-inner">
              {doctorInitials}
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  {doctorIdCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {doctor.status || 'Available'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 leading-tight">
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>
              <p className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
                <FaStethoscope className="text-[10px] opacity-80" />
                {doctor.specialty || 'General Practitioner'} • {doctor.department || 'Clinical OPD'}
              </p>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex gap-2 mt-5 border-t border-white/15 pt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Overview & Credentials
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'appointments'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FaCalendarCheck className="text-[11px]" />
              Assigned Patients
              {appointments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black">
                  {appointments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {activeTab === 'overview' && (
            <>
              {/* Performance Key Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Rating</p>
                  <p className="text-base font-black text-amber-500 mt-0.5 flex items-center gap-1">
                    <FaStar className="text-xs" />
                    {ratingVal.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Department</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={doctor.department}>
                    {doctor.department || 'General'}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Experience</p>
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    10+ Yrs
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FaPhone className="text-teal-500" />
                  Contact & Direct Communication
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      <FaPhone className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doctor.mobileNumber || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                      <FaEnvelope className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Hospital Work Email</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doctor.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department & Clinical Scope */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FaHospital className="text-sky-500" />
                  Hospital Assignment & Credentials
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-200/70 dark:border-sky-900/30">
                    <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 mb-1">
                      <FaStethoscope className="text-xs" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">Specialty</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {doctor.specialty || 'General Practice'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-200/70 dark:border-teal-900/30">
                    <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 mb-1">
                      <FaAward className="text-xs" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">License Status</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Verified Board Certified
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
                  <FaCalendarCheck className="text-teal-500" />
                  Doctor's Patient Consultations
                </h3>
                <span className="text-xs text-slate-500 font-medium">{appointments.length} scheduled</span>
              </div>

              {loadingApps ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="inline-block w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs font-semibold text-slate-500">Retrieving doctor schedule...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((app, idx) => (
                    <div 
                      key={app._id || app.id || `app-${idx}`} 
                      className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <FaUserInjured className="text-slate-400 text-xs" />
                            {app.patientName || app.patientEmail || 'Consultation Patient'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {app.patientEmail}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          app.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : app.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                        }`}>
                          {app.status || 'Confirmed'}
                        </span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <FaCalendarCheck className="text-slate-400 text-[11px]" />
                          {app.date ? new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <FaClock className="text-slate-400 text-[10px]" />
                          {app.timeSlot || '10:00 AM - 11:00 AM'}
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
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Consultations Scheduled</p>
                  <p className="text-xs text-slate-400 mt-0.5">This physician has no upcoming appointments registered.</p>
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
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <FaUserMd />
            {activeTab === 'overview' ? 'View Schedule' : 'Back to Profile'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorDetailsSheet;

