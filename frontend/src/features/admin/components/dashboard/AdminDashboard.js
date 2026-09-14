import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaUserMd, FaCalendarAlt, FaExclamationTriangle, FaTint, FaCapsules, 
  FaTools, FaChartLine, FaChevronRight, FaArrowUp,
  FaHospital, FaUserPlus, FaFileMedicalAlt, FaHeartbeat, FaPhoneAlt, FaCheckCircle,
  FaCamera, FaSearch, FaTimes, FaCalendarDay
} from 'react-icons/fa';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Helmet } from 'react-helmet';
import '../../../../components/styles/PatientAccount.css';
import '../../../../components/styles/AdminStats.css';

const AdminDashboard = () => {
  const { theme } = useAdminTheme();
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    pharmacy: { total: 0, lowStock: 0 },
    bloodBank: { donors: 0, requests: 0, stocks: [] },
    equipment: { functional: 0, maintenance: 0 },
    appointmentTrends: []
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'intake', 'facilities'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'emergency'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(prev => ({ ...prev, ...statsRes.data }));

      const patientsRes = await api.get('/admin/patients');
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444'];
  const patientStatusData = [
    { name: 'Stable', value: 45 },
    { name: 'Mild', value: 30 },
    { name: 'Critical', value: 15 },
    { name: 'Others', value: 10 }
  ];

  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.firstName && p.firstName.toLowerCase().includes(q)) ||
      (p.lastName && p.lastName.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
    );
  });

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sky-600 font-bold animate-pulse">Syncing Hospital Telemetry...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Hospital Operations Center" subtitle="Real-time clinical, operational & department metrics">
      <Helmet>
        <title>Operations Center | HealingWave Admin</title>
      </Helmet>

      <div className="space-y-6 animate-fade-in-up pb-8">
        {/* ====================================================================
            1. TOP QUICK BAR (Matching User Dashboard)
            ==================================================================== */}
        <div className="workspace-topbar">
          <div className="topbar-date">
            <FaCalendarAlt style={{ color: '#0284c7' }} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="topbar-actions">
            <div className="topbar-hotline">
              <FaPhoneAlt />
              <span>Trauma Hotline: +1 (800) 432-5464</span>
            </div>

            <Link to="/admin/doctor-manage" className="topbar-btn topbar-btn--primary">
              <FaUserPlus /> + Register Doctor
            </Link>
          </div>
        </div>

        {/* ====================================================================
            2. SMART ADMIN HERO SHOWCASE (Matching User Dashboard)
            ==================================================================== */}
        <div className="patient-hero-showcase">
          <div className="patient-hero-left">
            {/* Prominent Director Crest / Avatar */}
            <div
              className="patient-hero-avatar-wrap"
              onClick={() => { window.location.href = '/settings'; }}
              title="Hospital Master Settings"
            >
              <div className="w-full h-full rounded-[19px] bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                HA
              </div>
              <div className="patient-hero-cam-badge">
                <FaCamera />
              </div>
            </div>

            <div className="patient-hero-details">
              <h1>Welcome back, Executive Administrator! 🏥</h1>
              <p>Real-time command center for medical staff, inpatient triage, pharmacy supply lines, and emergency response.</p>

              <div className="patient-hero-tags">
                <span className="hero-tag blood">
                  <FaHeartbeat /> Live Telemetry: 100% Active
                </span>
                <span className="hero-tag">
                  Clearance: Level-5 Executive
                </span>
                <span className="hero-tag">
                  Node: Main Campus Central
                </span>
                <span className="hero-tag status-active">
                  <FaCheckCircle /> All Nodes Synced (99.98%)
                </span>
              </div>
            </div>
          </div>

          <div className="patient-hero-actions">
            <button
              type="button"
              className="hero-cta-btn light"
              onClick={() => setActiveModal('emergency')}
            >
              <FaPhoneAlt style={{ color: '#0284c7' }} /> Emergency Command Desk
            </button>
            <Link
              to="/admin/patient-manage"
              className="hero-cta-btn glass"
            >
              <FaUsers /> Patient Directory
            </Link>
          </div>
        </div>

        {/* ====================================================================
            3. LIVE HOSPITAL VITALS / TELEMETRY GRID (Matching User Dashboard)
            ==================================================================== */}
        <div className="vitals-tracker-grid">
          <div className="vital-card">
            <div className="vital-icon-box bp">
              <FaUserMd />
            </div>
            <div className="vital-meta">
              <span className="vital-label">Registered Doctors</span>
              <span className="vital-value">{stats.doctors}</span>
              <span className="vital-badge">Accredited Staff</span>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-icon-box glucose">
              <FaUsers />
            </div>
            <div className="vital-meta">
              <span className="vital-label">Admitted Patients</span>
              <span className="vital-value">{stats.patients}</span>
              <span className="vital-badge">Inpatient Capacity</span>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-icon-box weight">
              <FaCalendarAlt />
            </div>
            <div className="vital-meta">
              <span className="vital-label">Scheduled Visits</span>
              <span className="vital-value">{stats.appointments}</span>
              <span className="vital-badge">Today's Intake</span>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-icon-box checkup">
              <FaExclamationTriangle />
            </div>
            <div className="vital-meta">
              <span className="vital-label">Emergency Desk</span>
              <span className="vital-value">Active (3)</span>
              <span className="vital-badge">Immediate Ready</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            4. EMERGENCY TRIAGE & CAPACITY SHOWCASE (Matching User Dashboard)
            ==================================================================== */}
        <div className="smart-appointment-showcase">
          <div className="apt-showcase-left">
            <div className="doctor-portrait-wrap flex items-center justify-center bg-sky-50 text-sky-600 border-2 border-sky-500">
              <FaHospital size={36} />
            </div>

            <div className="apt-showcase-details">
              <h4>Level-1 Trauma Center & Emergency Response Status</h4>
              <p>3 Ambulance Crews In-Transit • Intensive Care Unit Reserves: 84% • Code Blue Team On Standby</p>

              <div className="apt-timing-row">
                <span className="apt-timing-chip text-emerald-700 font-bold">
                  ● Live Telemetry Synced
                </span>
                <span className="apt-timing-chip">
                  Average Response: &lt; 4 Mins
                </span>
                <span className="apt-mode-badge">
                  Tier-1 Trauma Ready
                </span>
              </div>
            </div>
          </div>

          <div className="apt-showcase-actions">
            <button
              onClick={() => setActiveModal('emergency')}
              className="topbar-btn topbar-btn--primary"
            >
              Emergency Operations Console
            </button>
          </div>
        </div>

        {/* ====================================================================
            5. SMART SECTION TABS (Matching User Dashboard)
            ==================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-2">
          <div className="patient-tabs-bar border-none pb-0">
            <button
              className={`patient-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine /> Admissions & Velocity Analytics
            </button>
            <button
              className={`patient-tab-btn ${activeTab === 'intake' ? 'active' : ''}`}
              onClick={() => setActiveTab('intake')}
            >
              <FaFileMedicalAlt /> Recent Patient Intake ({filteredPatients.length})
            </button>
            <button
              className={`patient-tab-btn ${activeTab === 'facilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('facilities')}
            >
              <FaCapsules /> Department Reserves & Logistics
            </button>
          </div>

          {/* Live Search Filter */}
          <div className="relative max-w-xs w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-800 transition-all"
            />
          </div>
        </div>

        {/* ====================================================================
            6. TAB PANELS CONTENT
            ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Analytics Chart */}
            <div className="admin-card lg:col-span-2 bg-white border border-slate-200/80 shadow-sm p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FaChartLine className="text-sky-600" />
                    Hospital Appointment & Admissions Velocity
                  </h3>
                  <p className="text-xs text-slate-500">Monthly patient visit volume and clinical triage trends</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                  <FaArrowUp /> +14.8% vs last month
                </div>
              </div>
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.appointmentTrends}>
                    <defs>
                      <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '14px', 
                        border: '1px solid #e2e8f0', 
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 25px -5px rgba(2,132,199,0.15)', 
                        padding: '10px 14px' 
                      }}
                      itemStyle={{ color: '#0284c7', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="appointments" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorApp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="admin-card bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Patient Triage Status</h3>
              <p className="text-[11px] text-slate-500 mb-3 font-medium">Inpatient clinical stability distribution</p>
              <div className="h-[150px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={patientStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={4} dataKey="value">
                      {patientStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 leading-none">{stats.patients}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Patients</span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {patientStatusData.map((item, idx) => (
                  <div key={item.name || `status-${idx}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'intake' && (
          <div className="admin-table-wrapper">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FaFileMedicalAlt className="text-sky-600" />
                  Recent Patient Intake & Clinical Triage
                </h3>
                <p className="text-xs text-slate-500">Latest patient admissions and diagnosis status</p>
              </div>
              <Link to="/admin/patient-manage" className="text-sky-600 hover:text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors">
                Full Patient Directory <FaChevronRight size={10} />
              </Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient Profile</th>
                  <th>Primary Clinical Diagnosis</th>
                  <th className="text-center">Triage Status</th>
                  <th className="text-right">Admission Record</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.slice(0, 8).map((patient, idx) => (
                    <tr key={patient._id || patient.id || patient.Id || `patient-${idx}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                            {patient.firstName ? patient.firstName[0] : 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{patient.firstName} {patient.lastName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{patient.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-700">{patient.diagnosis || 'General Clinical Review'}</span>
                      </td>
                      <td className="text-center">
                        <span className={`admin-badge ${patient.status?.toLowerCase() === 'critical' ? 'admin-badge-critical' : patient.status?.toLowerCase() === 'mild' ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                          {patient.status || 'Stable'}
                        </span>
                      </td>
                      <td className="text-right font-medium text-slate-600 text-xs">
                        {patient.lastVisit || 'Today'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">
                      No patients found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pharmacy Card */}
            <div className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-100">
                  <FaCapsules size={18} />
                </div>
                <Link to="/admin/pharmacy-manage" className="text-xs font-bold text-emerald-700 hover:underline uppercase tracking-wider">
                  Dispensary &rarr;
                </Link>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stats.pharmacy?.total || 0}</div>
                  <p className="text-xs text-slate-500 font-semibold">Active Medications</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${stats.pharmacy?.lowStock > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {stats.pharmacy?.lowStock || 0} Low Stock
                </div>
              </div>
            </div>

            {/* Blood Bank Card */}
            <div className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-rose-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center border border-rose-100">
                  <FaTint size={18} />
                </div>
                <Link to="/admin/blood-manage" className="text-xs font-bold text-rose-700 hover:underline uppercase tracking-wider">
                  Blood Bank &rarr;
                </Link>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stats.bloodBank?.donors || 0}</div>
                  <p className="text-xs text-slate-500 font-semibold">Registered Donors</p>
                </div>
                <div className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
                  {stats.bloodBank?.requests || 0} Open Requests
                </div>
              </div>
            </div>

            {/* Equipment Card */}
            <div className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center border border-sky-100">
                  <FaTools size={18} />
                </div>
                <Link to="/admin/equipment-manage" className="text-xs font-bold text-sky-700 hover:underline uppercase tracking-wider">
                  Biomedical &rarr;
                </Link>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stats.equipment?.functional || 0}</div>
                  <p className="text-xs text-slate-500 font-semibold">Operational Assets</p>
                </div>
                <div className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-200">
                  {stats.equipment?.maintenance || 0} Servicing
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            7. EMERGENCY OPERATIONS COMMAND MODAL
            ==================================================================== */}
        {activeModal === 'emergency' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5 text-rose-600 font-extrabold text-base">
                  <FaPhoneAlt />
                  <span>Hospital Emergency Command Console</span>
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
                    Dispatch
                  </a>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">ICU & Surgical Theatre Coordinator</p>
                    <p className="text-xs text-slate-600 font-mono font-bold">+1 (800) 432-8888</p>
                  </div>
                  <a href="tel:+18004328888" className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900">
                    Connect
                  </a>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Dismiss Command Window
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
