import React, { useState } from 'react';
import api from '../../../core/api/config';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaShieldAlt, 
  FaLock, 
  FaUserShield, 
  FaEye, 
  FaEyeSlash, 
  FaHospital, 
  FaCheckCircle, 
  FaKey
} from 'react-icons/fa';
import { Helmet } from 'react-helmet';

import '../../../components/styles/AdminLogin.css';
import healingWaveImage from '../../../assets/healingwave.png'; 
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const logoSrc = healingWaveImage?.src || healingWaveImage;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      const msg = 'Please enter both administrator username and password.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', { username, password });
      storage.setItem('adminToken', res.data.token);
      storage.setItem('token', res.data.token);
      toast.success('Welcome to HealingWave Administration Portal', { title: 'Access Granted' });
      navigate('/admin-dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password. Please verify credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="admin-login-body">
      <Helmet>
        <title>Hospital Administration Portal | HealingWave</title>
      </Helmet>

      <div className="admin-login-main-container">
        <Link to="/" className="back-home-link" title="Return to public portal">
          <FaArrowLeft className="nav-icon" /> Return to Hospital Portal
        </Link>

        {/* Left Side: Healthcare Identity & Operations Banner */}
        <div className="admin-login-image">
          <div className="admin-hero-content">
            <div className="admin-hero-logo-box">
              <img src={logoSrc} alt="HealingWave Logo" className="admin-hero-logo" />
            </div>

            <div className="admin-hero-badge">
              <FaHospital className="text-sky-300" />
              <span>Medical Operations Command</span>
            </div>

            <h2 className="admin-hero-title">HealingWave Health System</h2>
            <p className="admin-hero-desc">
              Centralized administrative intelligence, department oversight, and real-time clinical management.
            </p>

            <div className="admin-hero-features">
              <div className="admin-feature-item">
                <FaCheckCircle className="admin-feature-icon" />
                <span>Multi-Department Bed & Ward Control</span>
              </div>
              <div className="admin-feature-item">
                <FaCheckCircle className="admin-feature-icon" />
                <span>Physician & Specialist Roster Scheduling</span>
              </div>
              <div className="admin-feature-item">
                <FaCheckCircle className="admin-feature-icon" />
                <span>Pharmacy Inventory & Blood Bank Telemetry</span>
              </div>
              <div className="admin-feature-item">
                <FaCheckCircle className="admin-feature-icon" />
                <span>JCI & HIPAA Compliant Role-Based Access</span>
              </div>
            </div>

            <div className="admin-hero-footer">
              <div className="admin-pulse-indicator">
                <span className="pulse-dot"></span>
                <span>Hospital Network Status: <strong>Online & Secure</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Admin Authentication Form */}
        <div className="admin-login-form-container">
          <div className="admin-form-header">
            <div className="admin-brand-inline">
              <img src={logoSrc} alt="HealingWave" className="admin-form-brand-logo" />
              <div>
                <span className="admin-brand-title">HealingWave</span>
                <span className="admin-brand-pill">Executive Portal</span>
              </div>
            </div>

            <h1 className="admin-login-title">Administrator Sign-In</h1>
            <p className="admin-login-subtitle">
              Authorized personnel only. Please verify your clinical administrative credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="admin-form-body">
            {/* Username/Email Input */}
            <div className="admin-input-group">
              <label className="admin-input-label">Administrator ID or Email</label>
              <div className="admin-input-wrapper">
                <FaUserShield className="admin-input-icon" />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="admin-login-input"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="admin-input-group">
              <div className="flex justify-between items-center mb-1">
                <label className="admin-input-label">Security Password</label>
              </div>
              <div className="admin-input-wrapper">
                <FaLock className="admin-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Quick Demo Preset Credentials */}
            <div className="admin-demo-presets">
              <span className="admin-demo-label">
                <FaKey className="text-sky-500 mr-1 inline" /> Quick Fill Credentials:
              </span>
              <div className="admin-preset-chips">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin', 'admin')}
                  className="admin-chip-btn bg-sky-600 text-white border-sky-600 font-bold hover:bg-sky-700"
                  title="Fill admin / admin"
                >
                  admin / admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@healingwave.com', 'admin123')}
                  className="admin-chip-btn"
                  title="Fill admin@healingwave.com / admin123"
                >
                  admin@healingwave.com
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@gmail.com', 'adminadmin')}
                  className="admin-chip-btn"
                  title="Fill admin@gmail.com / adminadmin"
                >
                  admin@gmail.com
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="admin-login-error">
                <FaShieldAlt className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="admin-login-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="admin-btn-spinner"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaShieldAlt />
                  Access Admin Dashboard
                </span>
              )}
            </button>
          </form>

          <div className="admin-security-notice">
            <p>
              🔒 <strong>Hospital Security Warning:</strong> All administrative actions are audited under HIPAA Title II protocols. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
