import React, { useState } from 'react';
import api from '../../../core/api/config';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '../../shared/components/ui/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHospital,
  faShieldHalved,
  faCalendarCheck,
  faStethoscope,
  faStar,
  faPhone,
  faArrowLeft,
  faArrowRight,
  faUserMd,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import '../../../components/styles/Login.css';

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    specialty: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { firstName, lastName, email, mobileNumber, specialty, password, confirmPassword } = formData;

  const onChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !mobileNumber || !specialty || !password || !confirmPassword) {
      const msg = 'All fields are required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/doctors/dregister', {
        firstName,
        lastName,
        email,
        mobileNumber,
        specialty,
        password
      });

      if (res.data) {
        toast.success('Doctor registration successful! Please sign in with your credentials.', {
          title: 'Practitioner Registered'
        });
        navigate('/doctor-login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Doctor Registration | HealingWave Hospital</title>
      </Helmet>

      <div className="login-container signup-container">
        {/* Left Column: Brand & Trust Sidebar */}
        <aside className="login-sidebar">
          <div className="login-sidebar__top">
            <div className="login-sidebar__brand">
              <div className="login-sidebar__logo-icon">
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div className="login-sidebar__brand-name">
                HealingWave
                <span>Physician Enrollment</span>
              </div>
            </div>

            <div className="login-sidebar__hero">
              <h3>Join Our Distinguished Medical Faculty</h3>
              <p>
                Register your credentials to gain access to our unified electronic medical records, patient queuing, and diagnostics portal.
              </p>
            </div>

            <div className="login-sidebar__features">
              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faStethoscope} />
                </div>
                <div className="login-feature-text">
                  <h4>Department Specialization</h4>
                  <p>List your subspecialty, clinical focus, and appointment hours.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="login-feature-text">
                  <h4>Intelligent Schedule Management</h4>
                  <p>Automated slot bookings with real-time patient status sync.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="login-sidebar__footer">
            <div className="login-rating-row">
              <div className="login-rating-stars">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
              <span>Accredited Clinical Teaching Hospital</span>
            </div>
            <div className="login-hotline-badge">
              <FontAwesomeIcon icon={faPhone} />
              <span>Medical Board Desk: +1 (800) 432-5464</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Form Panel */}
        <div className="login-main">
          <div>
            <Link to="/" className="back-home">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Home</span>
            </Link>

            <div className="login-header">
              <span className="login-role-badge login-role-badge--doctor">
                <FontAwesomeIcon icon={faUserMd} /> Doctor Registration
              </span>
              <h1>Register Doctor Account</h1>
              <p>Enter your professional information to set up your clinical portal.</p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="docFirstName">First Name</label>
                  <input
                    id="docFirstName"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={onChange}
                    placeholder="e.g. Walter"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="docLastName">Last Name</label>
                  <input
                    id="docLastName"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={onChange}
                    placeholder="e.g. White"
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="docEmail">Clinical Email Address</label>
                  <input
                    id="docEmail"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="doctor@hospital.com"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="docMobile">Contact Phone</label>
                  <input
                    id="docMobile"
                    type="tel"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={onChange}
                    placeholder="+880 1XXX-XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="docSpecialty">Medical Specialty / Department</label>
                <input
                  id="docSpecialty"
                  type="text"
                  name="specialty"
                  value={specialty}
                  onChange={onChange}
                  placeholder="e.g. Oncology, Cardiology, Neurology, General Surgery"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="docPassword">Password</label>
                  <div className="password-field">
                    <input
                      id="docPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-password"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="docConfirmPassword">Confirm Password</label>
                  <input
                    id="docConfirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {error && <div className="error-msg" role="alert">{error}</div>}

              <button type="submit" className="login-btn doctor-btn" disabled={loading}>
                <span>{loading ? 'Creating Doctor Account…' : 'Complete Doctor Registration'}</span>
                {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.85rem' }} />}
              </button>
            </form>
          </div>

          <div className="login-footer">
            <p>
              Already registered as a hospital practitioner?
              <Link to="/doctor-login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignUp;
