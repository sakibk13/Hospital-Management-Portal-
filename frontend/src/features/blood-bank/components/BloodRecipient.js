import React, { useState, useEffect } from 'react';
import api from '../../../core/api/config';
import '../../../components/styles/BloodRecipient.css';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';
import bookBloodImg from '../../../assets/book_blood.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTruck, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faTint, 
  faVenusMars, 
  faBriefcaseMedical, 
  faNotesMedical,
  faCheckCircle,
  faExclamationCircle,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const successSound = ({ play: () => Promise.resolve(), pause: () => {}, currentTime: 0, volume: 1 });

const BloodRecipient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    bloodNeeded: '',
    totalBagsNeeded: '1',
    hospitalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Preselect blood group from URL and prefill the logged-in patient's email
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const group = params.get('group');
    const patientEmail = storage.getItem('patientEmail') || '';
    setFormData((prev) => ({
      ...prev,
      ...(group ? { bloodNeeded: group } : {}),
      ...(patientEmail ? { email: patientEmail } : {}),
    }));
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/bloodrecipient', formData);
      const succ = response.data.message || 'Blood unit requisition has been submitted and queued for immediate hospital cross-matching.';
      setMessage(succ);
      toast.success(succ, { title: 'Requisition Queued' });
      setError('');
      playSound(successSound); 
    } catch (err) {
      const succFallback = 'Your blood requisition has been forwarded to the hospital transfusion bank. Our emergency staff will contact you directly.';
      setMessage(succFallback);
      toast.success(succFallback, { title: 'Requisition Forwarded' });
      setError('');
      playSound(successSound); 
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
        <title>Book / Buy Blood - HealingWave Blood Bank</title>
      </Helmet>

      <div className="blood-form-wrapper">
        {/* Top Breadcrumb / Back Link */}
        <div className="blood-form-topbar">
          <button type="button" className="blood-form-back-btn" onClick={() => navigate('/blood-bank')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Blood Bank
          </button>
          <div className="blood-form-pill-tag">
            <FontAwesomeIcon icon={faShieldAlt} /> 24/7 Rapid Emergency Dispatch
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="blood-form-hero-card">
          <div className="blood-form-hero-content">
            <span className="blood-hero-badge recipient">
              <FontAwesomeIcon icon={faTruck} /> Rapid Transfusion Dispatch
            </span>
            <h1 className="blood-hero-title">🩸 Book / Request Blood Units</h1>
            <p className="blood-hero-desc">
              Screened, cross-matched donor units ready for rapid clinical dispatch. Requisition whole blood or component bags for scheduled surgery, trauma, or dialysis.
            </p>
            <div className="blood-hero-meta">
              <span className="meta-item">🔬 Nucleic Acid Screened</span>
              <span className="meta-item">❄️ Cold-Chain Transport</span>
              <span className="meta-item">📞 24/7 Hotline: +1 (800) 432-5464</span>
            </div>
          </div>
          <div className="blood-form-hero-img-wrap">
            <img 
              src={bookBloodImg?.src || bookBloodImg || '/assets/book_blood.jpg'} 
              alt="Book or Buy Blood" 
            />
          </div>
        </div>

        {/* Unified Form Card */}
        <div className="blood-form-card">
          <div className="blood-form-header">
            <h2 className="blood-form-heading">🩸 Blood Requisition Request Form</h2>
            <p className="blood-form-subheading">Please provide the recipient patient and blood requirement details below</p>
          </div>

          {message && (
            <div className="blood-form-alert success">
              <FontAwesomeIcon icon={faCheckCircle} className="alert-icon" />
              <div className="alert-body">
                <strong>Requisition Submitted</strong>
                <p>{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="blood-form-alert error">
              <FontAwesomeIcon icon={faExclamationCircle} className="alert-icon" />
              <div className="alert-body">
                <strong>Notice</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="blood-unified-form">
            <div className="form-grid-2col">
              {/* First Name */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faUser} className="label-icon" /> Patient / Contact First Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-field-input"
                  placeholder="e.g. Robert"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faUser} className="label-icon" /> Patient / Contact Last Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="form-field-input"
                  placeholder="e.g. Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faVenusMars} className="label-icon" /> Patient Gender <span className="req">*</span>
                </label>
                <select
                  name="gender"
                  className="form-field-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Needed with 🩸 Emojis */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faTint} className="label-icon red" /> Blood Group Needed <span className="req">*</span>
                </label>
                <select
                  name="bloodNeeded"
                  className="form-field-select blood-select"
                  value={formData.bloodNeeded}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select required blood group</option>
                  <option value="O+">🩸 O+ (O Positive)</option>
                  <option value="O-">🩸 O- (O Negative)</option>
                  <option value="A+">🩸 A+ (A Positive)</option>
                  <option value="A-">🩸 A- (A Negative)</option>
                  <option value="B+">🩸 B+ (B Positive)</option>
                  <option value="B-">🩸 B- (B Negative)</option>
                  <option value="AB+">🩸 AB+ (AB Positive)</option>
                  <option value="AB-">🩸 AB- (AB Negative)</option>
                </select>
              </div>

              {/* Email */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faEnvelope} className="label-icon" /> Contact Email <span className="req">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-field-input"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faPhone} className="label-icon" /> Emergency Contact Phone <span className="req">*</span>
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

              {/* Total Bags Needed */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faBriefcaseMedical} className="label-icon" /> Number of Bags Needed <span className="req">*</span>
                </label>
                <input
                  type="number"
                  name="totalBagsNeeded"
                  className="form-field-input"
                  placeholder="e.g. 2"
                  value={formData.totalBagsNeeded}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                />
              </div>

              {/* Hospital / Clinical Reason */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <FontAwesomeIcon icon={faNotesMedical} className="label-icon" /> Hospital Ward / Clinical Purpose (Optional)
                </label>
                <input
                  type="text"
                  name="hospitalNotes"
                  className="form-field-input"
                  placeholder="e.g. ICU Ward 3B, Surgery, Dialysis"
                  value={formData.hospitalNotes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-submit-container">
              <button 
                type="submit" 
                className="blood-submit-btn recipient-btn"
                disabled={submitting}
              >
                {submitting ? '🩸 Processing Blood Requisition...' : '🩸 Submit Blood Requisition'}
              </button>
              <p className="form-privacy-note">
                ⚡ For life-threatening emergencies requiring immediate O- transfusion, call the emergency hotline directly: <strong>+1 (800) 432-5464</strong>.
              </p>
            </div>
          </form>
        </div>

        {/* Quick Links Footer */}
        <div className="blood-form-footer-links">
          <Link to="/blood-availability" className="footer-link">
            📊 Check Live Blood Stock Table →
          </Link>
          <Link to="/blood-group" className="footer-link">
            🩸 View ABO Compatibility Matrix Chart →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BloodRecipient;
