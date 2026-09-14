import React from 'react';
import { Link } from 'react-router-dom';
import '../../../../components/styles/Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faClock,
  faShieldHeart,
  faAmbulance,
  faUserMd,
  faHeartbeat,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-top-strip">
        <div className="footer-top-container">
          <div className="emergency-callout">
            <div className="emergency-icon-wrap">
              <FontAwesomeIcon icon={faAmbulance} />
            </div>
            <div>
              <span className="emergency-tag">Emergency Ambulance 24/7</span>
              <h4 className="emergency-phone">Call 10666 / +880 1800-HEALWAVE</h4>
            </div>
          </div>
          <div className="footer-accreditation">
            <FontAwesomeIcon icon={faShieldHeart} className="shield-icon" />
            <span>Joint Commission International (JCI) Accredited Quality Healthcare</span>
          </div>
        </div>
      </div>

      <div className="footer-content">
        <div className="footer-section brand-col">
          <div className="footer-brand-title">
            <FontAwesomeIcon icon={faHeartbeat} className="text-emerald" /> HealingWave
          </div>
          <p className="footer-description">
            HealingWave Hospital &amp; Research Institute is committed to delivering world-class,
            patient-centered clinical excellence with state-of-the-art diagnostic technology and
            internationally renowned medical specialists.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Clinical Services</h4>
          <ul className="footer-links">
            <li>
              <Link to="/doctors">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Cardiology &amp; Heart Care
              </Link>
            </li>
            <li>
              <Link to="/doctors">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Neurology &amp; Brain Spine
              </Link>
            </li>
            <li>
              <Link to="/doctors">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Orthopaedics &amp; Trauma
              </Link>
            </li>
            <li>
              <Link to="/blood-bank">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> 24/7 Blood Bank
              </Link>
            </li>
            <li>
              <Link to="/pharmacy">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Modern Pharmacy
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Patient Portals</h4>
          <ul className="footer-links">
            <li>
              <Link to="/doctors">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Find a Specialist
              </Link>
            </li>
            <li>
              <Link to="/patient-login">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Patient Login
              </Link>
            </li>
            <li>
              <Link to="/doctor-login">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Doctor Portal
              </Link>
            </li>
            <li>
              <Link to="/blood-availability">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Blood Stock Status
              </Link>
            </li>
            <li>
              <Link to="/support">
                <FontAwesomeIcon icon={faChevronRight} className="bullet-icon" /> Help &amp; Support
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section contact-col">
          <h4 className="footer-heading">Hospital Contact</h4>
          <ul className="footer-contact">
            <li>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
              <span>Central Medical City Campus, 123 Healthcare Boulevard, Dhaka</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhoneAlt} className="contact-icon" />
              <span>+880 1800-432-592 / (02) 9876543</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
              <span>care@healingwave.com</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faClock} className="contact-icon" />
              <span>Emergency 24/7 | OPD: 8:00 AM - 10:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; 2026 HealingWave Health System &amp; Hospital. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/about">Privacy Policy</Link>
            <span className="dot-sep">&bull;</span>
            <Link to="/about">Terms of Service</Link>
            <span className="dot-sep">&bull;</span>
            <Link to="/support">Patient Rights</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
