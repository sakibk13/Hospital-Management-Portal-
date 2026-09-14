import React, { useState, useEffect } from 'react';
import api from '../../../core/api/config';
import '../../../components/styles/BloodDonor.css';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from '../../shared/components/ui/ToastContext';
import donateBloodImg from '../../../assets/donateblod.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faHeartbeat, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faTint, 
  faVenusMars, 
  faCalendarAlt, 
  faHistory,
  faCheckCircle,
  faExclamationCircle,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const successSound = ({ play: () => Promise.resolve(), pause: () => {}, currentTime: 0, volume: 1 });

const BloodDonor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    bloodGroup: '',
    donatedBefore: 'no',
    lastDonationDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill bloodGroup if provided in query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const group = params.get('group');
    if (group) {
      setFormData((prev) => ({ ...prev, bloodGroup: group }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/blooddonor', formData);
      const succ = response.data.message || 'Thank you! You have been successfully registered as a voluntary blood donor.';
      setSuccessMessage(succ);
      toast.success(succ, { title: 'Donor Enrolled' });
      setErrorMessage('');
      playSound(successSound); 
    } catch (error) {
      const err = error.response?.data?.message || 'Failed to submit registration. Please verify your details and try again.';
      setErrorMessage(err);
      toast.error(err, { title: 'Registration Failed' });
      playSound(errorSound); 
    } finally {
      setSubmitting(false);
    }
  };

  const playSound = (audio) => {
    audio.volume = 1.0; 
    audio.currentTime = 0; 
    audio.play().catch((e) => {
      console.error('Error playing sound:', e);
    });
  };

  return (
    <section className="blood-form-page">
      <Helmet>
        <title>Donate Blood - HealingWave Blood Bank</title>
      </Helmet>

      <div className="blood-form-wrapper">
        {/* Top Breadcrumb / Back Link */}
        <div className="blood-form-topbar">
          <button type="button" className="blood-form-back-btn" onClick={() => navigate('/blood-bank')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Blood Bank
          </button>
          <div className="blood-form-pill-tag">
            <FontAwesomeIcon icon={faShieldAlt} /> Screened & Certified Portal
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="blood-form-hero-card">
          <div className="blood-form-hero-content">
            <span className="blood-hero-badge donor">
              <FontAwesomeIcon icon={faHeartbeat} /> Voluntary Donor Initiative
            </span>
            <h1 className="blood-hero-title">🩸 Donate Blood, Save a Life</h1>
            <p className="blood-hero-desc">
              Every two seconds, someone in emergency surgery or oncology needs blood. Register today to join our 24/7 on-call lifesaving donor network.
            </p>
            <div className="blood-hero-meta">
              <span className="meta-item">⏱️ Takes only 15 minutes</span>
              <span className="meta-item">🛡️ 100% Sterile & Safe</span>
              <span className="meta-item">❤️ 1 Donation = Up to 3 Lives</span>
            </div>
          </div>
          <div className="blood-form-hero-img-wrap">
            <img 
              src={donateBloodImg?.src || donateBloodImg || '/assets/donateblod.jpg'} 
              alt="Donate Blood" 
            />
          </div>
        </div>

        {/* Unified Form Card */}
        <div className="blood-form-card">
          <div className="blood-form-header">
            <h2 className="blood-form-heading">🩸 Donor Registration Form</h2>
            <p className="blood-form-subheading">Please fill in your accurate personal and blood details below</p>
          </div>

          {successMessage && (
            <div className="blood-form-alert success">
              <FontAwesomeIcon icon={faCheckCircle} className="alert-icon" />
              <div className="alert-body">
                <strong>Registration Completed</strong>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="blood-form-alert error">
              <FontAwesomeIcon icon={faExclamationCircle} className="alert-icon" />
              <div className="alert-body">
                <strong>Notice</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="blood-unified-form">
            <div className="form-grid-2col">
              {/* First Name */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faUser} className="label-icon" /> First Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-field-input"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faUser} className="label-icon" /> Last Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="form-field-input"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faVenusMars} className="label-icon" /> Gender <span className="req">*</span>
                </label>
                <select
                  name="gender"
                  className="form-field-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Blood Group with 🩸 Emojis */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faTint} className="label-icon red" /> Blood Group <span className="req">*</span>
                </label>
                <select
                  name="bloodGroup"
                  className="form-field-select blood-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select your blood group</option>
                  <option value="O+">🩸 O+ (O Positive)</option>
                  <option value="O-">🩸 O- (O Negative - Universal Donor)</option>
                  <option value="A+">🩸 A+ (A Positive)</option>
                  <option value="A-">🩸 A- (A Negative)</option>
                  <option value="B+">🩸 B+ (B Positive)</option>
                  <option value="B-">🩸 B- (B Negative)</option>
                  <option value="AB+">🩸 AB+ (AB Positive - Universal Recipient)</option>
                  <option value="AB-">🩸 AB- (AB Negative)</option>
                </select>
              </div>

              {/* Email */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faEnvelope} className="label-icon" /> Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-field-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faPhone} className="label-icon" /> Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-field-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Have Donated Before */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faHistory} className="label-icon" /> Have you donated before? <span className="req">*</span>
                </label>
                <select
                  name="donatedBefore"
                  className="form-field-select"
                  value={formData.donatedBefore}
                  onChange={handleChange}
                  required
                >
                  <option value="no">No, this is my first time</option>
                  <option value="yes">Yes, I have donated before</option>
                </select>
              </div>

              {/* Last Donation Date */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="label-icon" /> Last Donation Date {formData.donatedBefore === 'yes' ? <span className="req">*</span> : '(Optional)'}
                </label>
                <input
                  type="date"
                  name="lastDonationDate"
                  className="form-field-input"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                  disabled={formData.donatedBefore === 'no'}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-submit-container">
              <button 
                type="submit" 
                className="blood-submit-btn donor-btn"
                disabled={submitting}
              >
                {submitting ? '🩸 Processing Registration...' : '🩸 Register as Voluntary Donor'}
              </button>
              <p className="form-privacy-note">
                🔒 Your medical information is kept strictly confidential under HIPAA & hospital privacy policies.
              </p>
            </div>
          </form>
        </div>

        {/* Quick Links Footer */}
        <div className="blood-form-footer-links">
          <Link to="/blood-availability" className="footer-link">
            📊 View Live Blood Availability Chart →
          </Link>
          <Link to="/blood-group" className="footer-link">
            🩸 Understand Blood Group Compatibility →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BloodDonor;
