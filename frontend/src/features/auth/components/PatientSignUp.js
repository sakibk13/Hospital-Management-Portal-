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
  faHeartPulse,
  faStar,
  faPhone,
  faArrowLeft,
  faArrowRight,
  faUserInjured,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import '../../../components/styles/Login.css';

const PatientSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    sex: '',
    dateOfBirth: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { firstName, lastName, email, sex, dateOfBirth, mobileNumber, password, confirmPassword } = formData;

  const onChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !sex || !dateOfBirth || !mobileNumber || !password || !confirmPassword) {
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
      const registrationData = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        sex,
        dateOfBirth,
        mobileNumber
      };

      await api.post('/patients/register', registrationData);
      toast.success('Registration successful! Please sign in.', { title: 'Account Created' });
      navigate('/patient-login');
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
        <title>Patient Registration | HealingWave Hospital</title>
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
                <span>Patient Registration</span>
              </div>
            </div>

            <div className="login-sidebar__hero">
              <h3>Join Our Digital Healthcare Network</h3>
              <p>
                Create your patient account to easily book appointments, track prescriptions, and receive clinical test updates.
              </p>
            </div>

            <div className="login-sidebar__features">
              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="login-feature-text">
                  <h4>Streamlined Appointments</h4>
                  <p>Book with 15+ specialized departments with zero phone queues.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
                <div className="login-feature-text">
                  <h4>Blood & Diagnostics Access</h4>
                  <p>Check hospital blood inventory and your lab reports in real-time.</p>
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
              <span>4.9 / 5 • 12,000+ Happy Patients</span>
            </div>
            <div className="login-hotline-badge">
              <FontAwesomeIcon icon={faPhone} />
              <span>Trauma Hotline: +1 (800) 432-5464</span>
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
              <span className="login-role-badge login-role-badge--patient">
                <FontAwesomeIcon icon={faUserInjured} /> Patient Registration
              </span>
              <h1>Create Patient Account</h1>
              <p>Fill in your details below to register your medical profile.</p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="regFirstName">First Name</label>
                  <input
                    id="regFirstName"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={onChange}
                    placeholder="e.g. John"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="regLastName">Last Name</label>
                  <input
                    id="regLastName"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={onChange}
                    placeholder="e.g. Doe"
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="regEmail">Email Address</label>
                  <input
                    id="regEmail"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="patient@email.com"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="regMobile">Mobile Phone</label>
                  <input
                    id="regMobile"
                    type="tel"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={onChange}
                    placeholder="+880 1XXX-XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="regSex">Gender</label>
                  <select id="regSex" name="sex" value={sex} onChange={onChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="regDob">Date of Birth</label>
                  <input
                    id="regDob"
                    type="date"
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="regPassword">Password</label>
                  <div className="password-field">
                    <input
                      id="regPassword"
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
                  <label htmlFor="regConfirmPassword">Confirm Password</label>
                  <input
                    id="regConfirmPassword"
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

              <button type="submit" className="login-btn patient-btn" disabled={loading}>
                <span>{loading ? 'Creating Account…' : 'Complete Registration'}</span>
                {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.85rem' }} />}
              </button>
            </form>
          </div>

          <div className="login-footer">
            <p>
              Already have an account?
              <Link to="/patient-login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignUp;
