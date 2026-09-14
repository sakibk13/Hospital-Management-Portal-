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

const PatientLogin = () => {
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
      const res = await api.post('/patients/plogin', { email, password });

      if (res.data.token) {
        storage.setItem('patientToken', res.data.token);
        storage.setItem('patientEmail', email);
        const pName = res.data.patient?.name || '';
        if (pName) {
          storage.setItem('patientName', pName);
        }
        toast.success(`Welcome back${pName ? ', ' + pName : ''}!`, { title: 'Signed In' });
        const redirect = storage.getItem('postLoginRedirect');
        if (redirect) {
          storage.removeItem('postLoginRedirect');
          navigate(redirect);
        } else {
          navigate('/patient');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Patient Sign In | HealingWave Hospital</title>
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
                <span>Patient Portal</span>
              </div>
            </div>

            <div className="login-sidebar__hero">
              <h3>Compassionate Care, Seamless Records</h3>
              <p>
                Sign in to view your laboratory reports, track ongoing prescriptions, and consult board-certified physicians.
              </p>
            </div>

            <div className="login-sidebar__features">
              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="login-feature-text">
                  <h4>Direct Doctor Access</h4>
                  <p>Book same-day or upcoming clinic consultations instantly.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
                <div className="login-feature-text">
                  <h4>Live Health Timeline</h4>
                  <p>Monitor vital trends, diagnoses, and lab results in one spot.</p>
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
              <span>4.9 / 5 • 12,000+ Patient Reviews</span>
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
                <FontAwesomeIcon icon={faUserInjured} /> Patient Portal
              </span>
              <h1>Patient Sign In</h1>
              <p>Welcome back! Enter your credentials to access your health portal.</p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="patientEmail">Email Address</label>
                <input
                  id="patientEmail"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="patient@email.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="patientPassword">Password</label>
                <div className="password-field">
                  <input
                    id="patientPassword"
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

              <button type="submit" className="login-btn patient-btn" disabled={loading}>
                <span>{loading ? 'Signing in…' : 'Sign In to Patient Portal'}</span>
                {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.85rem' }} />}
              </button>
            </form>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account yet?
              <Link to="/patient-signup">Create a Patient Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
