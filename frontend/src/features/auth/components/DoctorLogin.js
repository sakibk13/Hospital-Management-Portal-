import React, { useState } from 'react';
import api from '../../../core/api/config';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../../../utils/storage';
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

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      const msg = 'Please fill in all fields';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/doctors/dlogin', { email, password });

      if (res.data.token) {
        storage.setItem('doctorToken', res.data.token);
        storage.setItem('doctorEmail', email);
        toast.success('Welcome back, Doctor!', { title: 'Doctor Authenticated' });
        navigate('/doctor-account');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your doctor credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Doctor Portal Sign In | HealingWave Hospital</title>
      </Helmet>

      <div className="login-container">
        {/* Left Column: Brand & Trust Sidebar */}
        <aside className="login-sidebar">
          <div className="login-sidebar__top">
            <div className="login-sidebar__brand">
              <div className="login-sidebar__logo-icon">
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div className="login-sidebar__brand-name">
                HealingWave
                <span>Doctor Clinical Portal</span>
              </div>
            </div>

            <div className="login-sidebar__hero">
              <h3>Empowering Clinical Excellence</h3>
              <p>
                Access your consultation schedule, review patient medical histories, manage prescriptions, and track lab vitals.
              </p>
            </div>

            <div className="login-sidebar__features">
              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faStethoscope} />
                </div>
                <div className="login-feature-text">
                  <h4>Clinical Case Management</h4>
                  <p>Comprehensive patient charts, diagnostics, and treatment timelines.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="login-feature-text">
                  <h4>Smart Scheduling</h4>
                  <p>Manage in-person appointments, consultations, and slot availability.</p>
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
              <span>Trusted by 150+ Board-Certified Doctors</span>
            </div>
            <div className="login-hotline-badge">
              <FontAwesomeIcon icon={faPhone} />
              <span>Physician Support: +1 (800) 432-5464</span>
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
                <FontAwesomeIcon icon={faUserMd} /> Doctor Portal
              </span>
              <h1>Doctor Portal Sign In</h1>
              <p>Sign in with your hospital credentials to open your medical dashboard.</p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="doctorEmail">Clinical Email Address</label>
                <input
                  id="doctorEmail"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="doctorPassword">Password</label>
                <div className="password-field">
                  <input
                    id="doctorPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter password"
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

              {error && <div className="error-msg" role="alert">{error}</div>}

              <button type="submit" className="login-btn doctor-btn" disabled={loading}>
                <span>{loading ? 'Authenticating…' : 'Sign In to Doctor Dashboard'}</span>
                {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.85rem' }} />}
              </button>
            </form>
          </div>

          <div className="login-footer">
            <p>
              New practitioner at HealingWave?
              <Link to="/doctor-signup">Register Doctor Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
