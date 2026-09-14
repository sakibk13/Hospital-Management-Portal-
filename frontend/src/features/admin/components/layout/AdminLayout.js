import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../../../core/api/config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { storage } from '../../../../utils/storage';
import healingWaveLogo from '../../../../assets/healingwave.png';
import '../../../../components/styles/HospitalAdmin.css';
import {
  FaThLarge, FaCalendarAlt, FaUserInjured, FaChartBar, FaClinicMedical, 
  FaTint, FaCapsules, FaUserMd, FaNotesMedical, FaTools, FaRegCommentDots, FaCog, 
  FaSearch, FaBell, FaChevronDown, FaChevronLeft, FaChevronRight, FaSignOutAlt, FaUserCog, FaExclamationTriangle, FaBars,
  FaHospital, FaExternalLinkAlt
} from 'react-icons/fa';

const AdminLayout = ({ children, title = "Dashboard", subtitle = "Hospital Operations & Registry Center" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarCollapsed, toggleSidebar, sidebarWidth, setSidebarWidth } = useAdminTheme();
  const [isResizing, setIsResizing] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ name: 'HealingWave Admin', email: 'admin@healingwave.com' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoSrc = healingWaveLogo?.src || healingWaveLogo;

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 180 && newWidth < 420) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing, setSidebarWidth]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get('/admin/profile');
        if (res.data) setAdminProfile(res.data);
      } catch (e) {
        // Fallback default
      }
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    storage.removeItem('token');
    storage.removeItem('adminToken');
    navigate('/');
  };

  const navSections = [
    {
      label: 'Clinical Operations',
      items: [
        { name: 'Dashboard', icon: <FaThLarge className="text-sky-600" />, path: '/admin-dashboard' },
        { name: 'Appointments', icon: <FaCalendarAlt className="text-indigo-600" />, path: '/admin/appointment-manage' },
        { name: 'Patient Directory', icon: <FaUserInjured className="text-teal-600" />, path: '/admin/patient-manage' },
        { name: 'Medical Staff', icon: <FaUserMd className="text-blue-600" />, path: '/admin/doctor-manage' },
        { name: 'Consultations', icon: <FaNotesMedical className="text-cyan-600" />, path: '/admin/consultation-manage' },
      ]
    },
    {
      label: 'Logistics & Facilities',
      items: [
        { name: 'Dispensary & Rx', icon: <FaCapsules className="text-emerald-600" />, path: '/admin/pharmacy-manage' },
        { name: 'Blood Bank', icon: <FaTint className="text-rose-600" />, path: '/admin/blood-manage' },
        { name: 'Biomedical Assets', icon: <FaTools className="text-amber-600" />, path: '/admin/equipment-manage' },
        { name: 'Wards & Cabins', icon: <FaClinicMedical className="text-teal-700" />, path: '/admin/clinic-manage' },
      ]
    },
    {
      label: 'Governance & Analytics',
      items: [
        { name: 'Revenue Reports', icon: <FaChartBar className="text-purple-600" />, path: '/admin/reports' },
        { name: 'Patient Feedback', icon: <FaRegCommentDots className="text-amber-600" />, path: '/feedback' },
        { name: 'Portal Settings', icon: <FaCog className="text-slate-600" />, path: '/settings' },
      ]
    }
  ];

  const currentSidebarWidth = isMobile ? 280 : (isSidebarCollapsed ? 80 : sidebarWidth);

  return (
    <div className={`admin-layout-root ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Sidebar (In-flow on desktop, overlay drawer on mobile) */}
      <aside 
        ref={sidebarRef}
        style={{
          width: `${currentSidebarWidth}px`,
          ...(isMobile ? {
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 50
          } : {})
        }}
        className="admin-sidebar"
      >
        {/* Resize Handle (desktop only) */}
        {!isSidebarCollapsed && !isMobile && (
          <div 
            onMouseDown={startResizing}
            className={`absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-sky-500/40 transition-colors z-40 ${isResizing ? 'bg-sky-500/60' : ''}`}
          />
        )}

        {/* Floating Circular Toggle Button (matching Patient & Doctor Layouts) */}
        {!isMobile && (
          <button 
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '22px',
              right: '-14px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(15, 23, 42, 0.12)',
              zIndex: 60,
              fontSize: '0.75rem',
              transition: 'all 0.2s ease'
            }}
            className="hover:text-teal-600 hover:border-teal-500 hover:scale-110"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        )}

        {/* Sidebar Brand Header with Strictly Constrained Hospital Logo */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
          <Link to="/admin-dashboard" className="flex items-center gap-3 overflow-hidden group min-w-0">
            <div className="w-[38px] h-[38px] min-w-[38px] max-w-[38px] min-h-[38px] max-h-[38px] rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center p-1.5 shrink-0 shadow-2xs transition-transform group-hover:scale-105 overflow-hidden">
              <img 
                src={logoSrc} 
                alt="HealingWave Logo" 
                className="admin-logo-img" 
                style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors block truncate leading-tight">
                  HealingWave
                </span>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded mt-0.5">
                  Executive Suite
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Clinical Navigation Menu (White Background, Black/Slate Text) */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto admin-sidebar-scroll bg-white">
          {navSections.map((section, sIdx) => (
            <div key={section.label || sIdx}>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || (location.pathname === '/' && item.name === 'Dashboard');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/15 to-sky-500/10 text-teal-950 font-bold border-l-4 border-teal-600 shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={isSidebarCollapsed ? item.name : ''}
                    >
                      <span className={`text-sm shrink-0 p-1.5 rounded-lg transition-colors ${
                        isActive ? 'bg-teal-100 text-teal-700 shadow-2xs' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                      }`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Telemetry Indicator */}
        {!isSidebarCollapsed ? (
          <div className="mx-3 my-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-900 truncate">Hospital OS Active</div>
                <div className="text-[9px] text-teal-600 font-mono font-bold">100% TELEMETRY</div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              ONLINE
            </span>
          </div>
        ) : (
          <div className="flex justify-center my-2 shrink-0" title="Hospital Systems Online (100%)">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* User Profile Card with Quick Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                HA
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{adminProfile.name || 'Hospital Admin'}</p>
                  <p className="text-[10px] font-semibold text-slate-500 truncate">Chief Administrator</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all shrink-0"
                title="Sign Out"
              >
                <FaSignOutAlt className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Viewport Container (Takes exact 100% of remaining width cleanly) */}
      <main className="admin-main-viewport">
        {/* Top Header */}
        <header className="admin-topbar">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                    aria-label="Open menu"
                >
                    <FaBars />
                </button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FaHospital className="text-sky-600 text-sm hidden sm:inline shrink-0" />
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{title}</h2>
                    </div>
                    <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                {/* Search Bar - Responsive, Never Overflows */}
                <div className="relative w-36 sm:w-56 md:w-64 lg:w-72 min-w-0">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <FaSearch className="text-xs" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search records, staff..." 
                        className="admin-search-input w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 placeholder-slate-400 transition-all"
                    />
                </div>

                {/* Exit to Public Hospital Link */}
                <Link
                  to="/"
                  target="_blank"
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-100 transition-colors shrink-0"
                  title="View Public Hospital Site in new tab"
                >
                  <FaExternalLinkAlt className="text-[10px]" />
                  <span>Public Portal</span>
                </Link>
                
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 shrink-0">
                    <FaBell />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Section with Dropdown */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <div 
                    className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer group"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                        HA
                      </div>
                      <div className="hidden lg:block text-left">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">{adminProfile.name || 'Hospital Admin'}</p>
                          <span className="text-[10px] text-sky-600 font-semibold block uppercase tracking-wider">Executive Admin</span>
                      </div>
                      <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Account</p>
                      </div>
                      <Link 
                        to="/settings" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUserCog className="text-slate-400" />
                        Settings
                      </Link>
                      <button 
                        onClick={() => { setShowLogoutConfirm(true); setIsDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <FaSignOutAlt className="text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
            {children}
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
            <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Sign Out?</h3>
              <p className="text-sm text-slate-500 mb-8">Are you sure you want to end your session? You will need to login again to access the dashboard.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
