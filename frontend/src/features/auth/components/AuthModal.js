import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUserInjured,
  faUserMd,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faCalendarCheck,
  faHeartPulse,
  faHospital,
  faStar,
  faPhone,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../core/api/config';
import { storage } from '../../../utils/storage';
import { useAuthModal } from '../AuthModalContext';
import { toast } from '../../shared/components/ui/ToastContext';
import '../../../components/styles/AuthModal.css';

const emptyForm = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  sex: '',
  dateOfBirth: '',
  mobileNumber: '',
  specialty: '',
};

const AuthModal = () => {
  const navigate = useNavigate();
  const { open, role: initialRole, mode: initialMode, redirect, closeAuth } = useAuthModal();

  const [role, setRole] = useState('patient');   // 'patient' | 'doctor'
  const [mode, setMode] = useState('login');      // 'login' | 'signup'
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync internal state when opened
  useEffect(() => {
    if (open) {
      setRole(initialRole || 'patient');
      setMode(initialMode || 'login');
      setForm(emptyForm);
      setError('');
      setInfo('');
      setShowPassword(false);
    }
  }, [open, initialRole, initialMode]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  const onChange = (e) => {
    setError('');
    setInfo('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchRole = (r) => {
    setRole(r);
    setError('');
    setInfo('');
    setForm(emptyForm);
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setInfo('');
    setForm(emptyForm);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      setLoading(true);
      if (mode === 'login') {
        if (!form.email || !form.password) {
          const msg = 'Please enter both your email and password';
          setError(msg);
          toast.error(msg);
          return;
        }
        if (role === 'patient') {
          const res = await api.post('/patients/plogin', { email: form.email, password: form.password });
          if (res.data.token) {
            storage.setItem('patientToken', res.data.token);
            storage.setItem('patientEmail', form.email);
            const pName = res.data.patient?.name || '';
            if (pName) storage.setItem('patientName', pName);
            toast.success(`Welcome back${pName ? ', ' + pName : ''}!`, { title: 'Signed In' });
            closeAuth();
            const targetRedirect = redirect || storage.getItem('postLoginRedirect') || '/patient';
            storage.removeItem('postLoginRedirect');
            navigate(targetRedirect);
          }
        } else {
          const res = await api.post('/doctors/dlogin', { email: form.email, password: form.password });
          if (res.data.token) {
            storage.setItem('doctorToken', res.data.token);
            storage.setItem('doctorEmail', form.email);
            toast.success('Doctor authenticated successfully!', { title: 'Welcome Doctor' });
            closeAuth();
            navigate('/doctor-account');
          }
        }
      } else {
        // signup
        if (form.password !== form.confirmPassword) {
          const msg = 'Passwords do not match';
          setError(msg);
          toast.error(msg);
          return;
        }
        if (form.password.length < 6) {
          const msg = 'Password must be at least 6 characters';
          setError(msg);
          toast.error(msg);
          return;
        }

        if (role === 'patient') {
          const { firstName, lastName, email, sex, dateOfBirth, mobileNumber, password } = form;
          if (!firstName || !lastName || !email || !sex || !dateOfBirth || !mobileNumber) {
            const msg = 'Please fill out all required registration fields';
            setError(msg);
            toast.error(msg);
            return;
          }
          await api.post('/patients/register', {
            name: `${firstName} ${lastName}`,
            email,
            password,
            sex,
            dateOfBirth,
            mobileNumber,
          });
        } else {
          const { firstName, lastName, email, mobileNumber, specialty, password } = form;
          if (!firstName || !lastName || !email || !mobileNumber || !specialty) {
            const msg = 'Please fill out all required registration fields';
            setError(msg);
            toast.error(msg);
            return;
          }
          await api.post('/doctors/dregister', { firstName, lastName, email, mobileNumber, specialty, password });
        }

        // Switch to login tab on success
        setMode('login');
        setForm({ ...emptyForm, email: form.email });
        const successMsg = 'Account successfully registered! Please sign in with your credentials.';
        setInfo(successMsg);
        toast.success(successMsg, { title: 'Registration Complete' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || (mode === 'login' ? 'Authentication failed' : 'Registration failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const dynamicTitle = mode === 'login'
    ? (role === 'patient' ? 'Patient Sign In' : 'Doctor Portal Sign In')
    : (role === 'patient' ? 'Patient Registration' : 'Doctor Enrollment');

  const dynamicSubtitle = mode === 'login'
    ? (role === 'patient'
        ? 'Enter your credentials to access your health portal & records'
        : 'Access your clinical appointments, schedules, and patient cases')
    : (role === 'patient'
        ? 'Create your patient account to book appointments and track treatments'
        : 'Register your medical license and join our clinical network');

  return (
    <div className="auth-modal__overlay" onMouseDown={closeAuth}>
      <div
        className="auth-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* LEFT COLUMN: BRAND & TRUST SIDEBAR */}
        <aside className="auth-modal__sidebar">
          <div className="auth-sidebar__top">
            <div className="auth-sidebar__brand">
              <div className="auth-sidebar__logo-icon">
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div className="auth-sidebar__brand-name">
                HealingWave
                <span>Clinical Hospital</span>
              </div>
            </div>

            <div className="auth-sidebar__hero">
              <h3>World-Class Healthcare, At Your Fingertips</h3>
              <p>
                Manage your appointments, securely access electronic health records, and connect with top specialists.
              </p>
            </div>

            <div className="auth-sidebar__features">
              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="auth-feature-text">
                  <h4>Instant Specialist Booking</h4>
                  <p>Direct scheduling with 15+ board-certified department heads.</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
                <div className="auth-feature-text">
                  <h4>24/7 Digital Health Records</h4>
                  <p>Real-time access to prescriptions, test results, and blood inventory.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-sidebar__footer">
            <div className="auth-rating-row">
              <div className="auth-rating-stars">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
              <span>4.9 / 5 • 12,000+ Happy Patients</span>
            </div>
            <div className="auth-hotline-badge">
              <FontAwesomeIcon icon={faPhone} />
              <span>Trauma Hotline: +1 (800) 432-5464</span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: WORKSPACE & INTERACTIVE FORM */}
        <section className="auth-modal__main">
          <button className="auth-modal__close" onClick={closeAuth} aria-label="Close modal">
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="auth-modal__controls">
            {/* Role Switcher */}
            <div className="auth-modal__roles">
              <button
                type="button"
                className={`auth-role-btn ${role === 'patient' ? 'active' : ''}`}
                onClick={() => switchRole('patient')}
              >
                <FontAwesomeIcon icon={faUserInjured} />
                <span>Patient Portal</span>
              </button>
              <button
                type="button"
                className={`auth-role-btn ${role === 'doctor' ? 'active' : ''}`}
                onClick={() => switchRole('doctor')}
              >
                <FontAwesomeIcon icon={faUserMd} />
                <span>Doctor Portal</span>
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="auth-modal__tabs">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Dynamic Heading */}
          <div className="auth-form-heading">
            <h2 id="auth-modal-title">{dynamicTitle}</h2>
            <p>{dynamicSubtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-modal__form">
            {mode === 'signup' && (
              <div className="input-grid-2">
                <div className="auth-input-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    placeholder="e.g. Eleanor"
                    required
                  />
                </div>
                <div className="auth-input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    placeholder="e.g. Vance"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signup' ? (
              <div className="input-grid-2">
                <div className="auth-input-group">
                  <label htmlFor="authEmail">Email Address</label>
                  <input
                    id="authEmail"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="name@domain.com"
                    required
                  />
                </div>
                <div className="auth-input-group">
                  <label htmlFor="mobileNumber">Phone / Mobile</label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={onChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="auth-input-group">
                <label htmlFor="authEmail">Email Address</label>
                <input
                  id="authEmail"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="name@domain.com"
                  required
                />
              </div>
            )}

            {mode === 'signup' && role === 'patient' && (
              <div className="input-grid-2">
                <div className="auth-input-group">
                  <label htmlFor="sex">Biological Sex</label>
                  <select id="sex" name="sex" value={form.sex} onChange={onChange} required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="auth-input-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'doctor' && (
              <div className="auth-input-group">
                <label htmlFor="specialty">Medical Department / Specialty</label>
                <input
                  id="specialty"
                  type="text"
                  name="specialty"
                  value={form.specialty}
                  onChange={onChange}
                  placeholder="e.g. Cardiology, Neurology, General Surgery"
                  required
                />
              </div>
            )}

            {mode === 'signup' ? (
              <div className="input-grid-2">
                <div className="auth-input-group">
                  <label htmlFor="authPassword">Password</label>
                  <div className="auth-password-field">
                    <input
                      id="authPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div className="auth-input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="auth-input-group">
                <label htmlFor="authPassword">Password</label>
                <div className="auth-password-field">
                  <input
                    id="authPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Enter your account password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="auth-alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="auth-alert-info" role="status">
                <span>{info}</span>
              </div>
            )}

            <button
              type="submit"
              className={`auth-submit-btn ${role === 'patient' ? 'auth-submit-btn--patient' : 'auth-submit-btn--doctor'}`}
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Processing…'
                  : mode === 'login'
                    ? (role === 'patient' ? 'Sign In to Patient Portal' : 'Sign In to Doctor Portal')
                    : (role === 'patient' ? 'Create Patient Account' : 'Register Doctor Account')}
              </span>
              {!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.85rem' }} />}
            </button>
          </form>

          {/* Footer switch */}
          <div className="auth-modal__footer">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?
                <button type="button" className="auth-switch-link" onClick={() => switchMode('signup')}>
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?
                <button type="button" className="auth-switch-link" onClick={() => switchMode('login')}>
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthModal;
