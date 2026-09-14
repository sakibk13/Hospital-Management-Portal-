import React, { useState, useEffect } from 'react';
import '../../../../components/styles/Navbar.css';
import logo from '../../../../assets/healingwave.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCapsules,
  faContactBook,
  faHome,
  faInfoCircle,
  faTint,
  faBars,
  faTimes,
  faUserMd,
  faRightToBracket,
  faPhoneAlt,
  faClock,
  faMapMarkerAlt,
  faCalendarCheck,
  faShieldHeart,
  faHeartPulse
} from '@fortawesome/free-solid-svg-icons';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../../auth/AuthModalContext';

const NavbarComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="site-header">
      {/* Top Hospital Utility Bar */}
      <div className="hospital-topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <span className="topbar-item emergency-hotline">
              <span className="emergency-pulse"></span>
              <FontAwesomeIcon icon={faPhoneAlt} className="topbar-icon" />
              <strong>24/7 Emergency:</strong> <a href="tel:10666">10666</a> / <a href="tel:+8801800432592">+880 1800-HEALWAVE</a>
            </span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item hide-mobile">
              <FontAwesomeIcon icon={faClock} className="topbar-icon" />
              <span>OPD: 8:00 AM - 10:00 PM</span>
            </span>
            <span className="topbar-divider hide-mobile">|</span>
            <span className="topbar-item hide-tablet">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="topbar-icon" />
              <span>Medical City Campus</span>
            </span>
          </div>

          <div className="topbar-right">
            <Link to="/blood-availability" className="topbar-link">
              <FontAwesomeIcon icon={faTint} className="text-danger" /> Live Blood Inventory
            </Link>
            <span className="topbar-divider">|</span>
            <span className="topbar-badge">
              <FontAwesomeIcon icon={faShieldHeart} /> JCI Accredited
            </span>
          </div>
        </div>
      </div>

      {/* Main Single-Line Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo & Title: Logo links to /admin-login, Title links to / */}
          <div className="navbar-brand">
            <Link to="/admin-login" className="brand-logo-wrap" title="Admin Login">
              <img src={logo?.src || logo} alt="Admin Portal" className="brand-logo" />
            </Link>
            <Link to="/" className="brand-text-singleline" title="HealingWave Hospital Home">
              <span className="brand-name">HealingWave</span>
              <span className="brand-badge-pill">Hospital</span>
            </Link>
          </div>

          {/* Navigation Menu (All items on one clean line) */}
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <div className="nav-links">
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faHome} className="nav-icon" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/doctors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faUserMd} className="nav-icon" />
                <span>Specialists</span>
              </NavLink>
              <NavLink to="/blood-bank" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faTint} className="nav-icon" />
                <span>Blood Bank</span>
              </NavLink>
              <NavLink to="/pharmacy" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faCapsules} className="nav-icon" />
                <span>Pharmacy</span>
              </NavLink>
              <NavLink to="/support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faContactBook} className="nav-icon" />
                <span>Support</span>
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FontAwesomeIcon icon={faInfoCircle} className="nav-icon" />
                <span>About</span>
              </NavLink>
            </div>

            {/* Quick Action Buttons */}
            <div className="nav-actions">
              <button
                className="nav-link-btn"
                onClick={() => openAuth({ mode: 'login' })}
                title="Sign in to your patient or doctor portal"
              >
                <FontAwesomeIcon icon={faRightToBracket} />
                <span>Sign In</span>
              </button>
              <button className="nav-cta" onClick={() => navigate('/doctors')}>
                <FontAwesomeIcon icon={faCalendarCheck} className="cta-icon" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          <button
            className="mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavbarComponent;
