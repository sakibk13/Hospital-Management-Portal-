import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../../core/api/config';
import '../../../../components/styles/HealthCard.css';
import healingWave from '../../../../assets/healingwave.png';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { storage } from '../../../../utils/storage';
import { toast } from '../../../shared/components/ui/ToastContext';
import {
  FaArrowLeft,
  FaIdCard,
  FaCoins,
  FaShieldAlt,
  FaCheckCircle,
  FaWifi,
  FaPrint,
  FaCopy,
  FaPhoneAlt,
  FaEnvelope,
  FaTint,
  FaUser,
  FaMoneyBillWave,
  FaQrcode,
  FaPercent,
  FaBed
} from 'react-icons/fa';

const HealthCard = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phoneNumber: '',
    bloodGroup: 'O+'
  });

  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(1000);
  const [cardData, setCardData] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { patientName, email, phoneNumber, bloodGroup } = formData;

  // Resolve image helper
  const getImageUrl = (path, name = 'Patient') => {
    if (!path) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&size=150`;
    }
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return clean;
  };

  // 1. Fetch Patient Info & HealthCard data
  useEffect(() => {
    const savedEmail = storage.getItem('patientEmail');
    if (!savedEmail) return;

    const loadData = async () => {
      try {
        // Fetch patient profile to auto-populate
        let pRes;
        try {
          pRes = await api.get(`/patients/pdetails/email/${encodeURIComponent(savedEmail)}`);
        } catch (e) {
          pRes = await axios.get(`/api/patients/pdetails/email/${encodeURIComponent(savedEmail)}`);
        }

        if (pRes && pRes.data) {
          setPatientProfile(pRes.data);
          setFormData({
            patientName: pRes.data.name || `${pRes.data.firstName || ''} ${pRes.data.lastName || ''}`.trim(),
            email: savedEmail,
            phoneNumber: pRes.data.mobileNumber || '',
            bloodGroup: pRes.data.bloodGroup || 'O+'
          });
        }

        // Fetch health card if exists
        try {
          const cRes = await axios.get(`/api/healthcards/${encodeURIComponent(savedEmail)}`);
          if (cRes.data) {
            setCardData(cRes.data);
          }
        } catch (cardErr) {
          console.log('No health card found yet for this account.');
        }
      } catch (err) {
        console.error('Error loading card info:', err);
      }
    };

    loadData();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Register / Update Health Card
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/healthcards/register', formData);
      setCardData(res.data);
      toast.success('Digital Health Card issued & activated successfully!', {
        title: 'Membership Activated'
      });
      storage.setItem('patientEmail', formData.email);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to issue health card.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Top Up Balance
  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = topUpAmount || selectedPreset;
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid recharge amount');
      return;
    }

    const currentEmail = formData.email || storage.getItem('patientEmail');
    if (!currentEmail) {
      toast.error('Please log in or enter your registered email');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        '/api/healthcards/topup',
        { topUpAmount: Number(amount), email: currentEmail },
        { headers: { Authorization: currentEmail } }
      );

      setCardData(res.data.card);
      toast.success(`Successfully recharged ৳ ${amount} BDT to Health Card!`, {
        title: 'Credits Added'
      });
      setTopUpAmount('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Top-up transaction failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCard = () => {
    const num = cardData?.cardNumber || '4532 8492 7103 9204';
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopied(true);
    toast.success('Health card number copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const cardDisplayName = (cardData?.patientName || formData.patientName || 'VALUED PATIENT').toUpperCase();
  const cardBlood = cardData?.bloodGroup || formData.bloodGroup || 'O+';
  const cardNumberDisplay = cardData?.cardNumber || '4532  8492  7103  9204';
  const cardBalance = cardData?.topUpAmount != null ? cardData.topUpAmount : 0;
  const cardPoints = cardData?.points || Math.floor(cardBalance / 10);
  const cardTier = cardData?.tier || 'PREMIER GOLD';
  const patientPhoto = patientProfile?.profilePicture || null;

  return (
    <div className="health-card-page-root">
      <Helmet>
        <title>Digital Health Card & Member Pass | HealingWave</title>
      </Helmet>

      <div className="health-card-wrapper">
        {/* Top Header */}
        <div className="health-card-header">
          <Link to="/patient" className="health-card-back-btn">
            <FaArrowLeft /> Back to Patient Portal
          </Link>

          <div className="health-card-title-wrap">
            <h1>Digital Health Card & Credits</h1>
            <p>Your cashless hospital treatment passport with member discounts and reward points.</p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="health-card-grid">
          {/* ================================================================
              LEFT COLUMN: REGISTRATION FORM & WALLET TOP-UP
              ================================================================ */}
          <div className="health-card-left-col">
            {/* 1. Member Information / Card Registration */}
            <div className="health-card-panel">
              <div className="health-card-panel-header">
                <div className="panel-header-title">
                  <div className="panel-header-icon info">
                    <FaIdCard />
                  </div>
                  <div>
                    <h3>{cardData ? 'Member Credentials' : 'Issue Your Health Card'}</h3>
                    <p>{cardData ? 'Active electronic health membership on file' : 'Fill in patient details to generate your digital pass'}</p>
                  </div>
                </div>
                {cardData && (
                  <span className="card-tier-chip">
                    <FaCheckCircle style={{ marginRight: '4px' }} /> Active Member
                  </span>
                )}
              </div>

              <form onSubmit={onSubmit}>
                <div className="health-form-grid-2">
                  <div className="health-input-group">
                    <label htmlFor="patientName">Patient Full Name</label>
                    <input
                      id="patientName"
                      type="text"
                      name="patientName"
                      value={patientName}
                      onChange={onChange}
                      placeholder="e.g. Eleanor Vance"
                      required
                    />
                  </div>

                  <div className="health-input-group">
                    <label htmlFor="cardEmail">Email Address</label>
                    <input
                      id="cardEmail"
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="patient@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="health-form-grid-2">
                  <div className="health-input-group">
                    <label htmlFor="cardPhone">Contact Phone</label>
                    <input
                      id="cardPhone"
                      type="tel"
                      name="phoneNumber"
                      value={phoneNumber}
                      onChange={onChange}
                      placeholder="+880 1XXX-XXXXXX"
                      required
                    />
                  </div>

                  <div className="health-input-group">
                    <label htmlFor="bloodGroup">Blood Group</label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={bloodGroup}
                      onChange={onChange}
                      required
                    >
                      <option value="A+">A Positive (A+)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                      <option value="AB-">AB Negative (AB-)</option>
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="health-btn-submit" disabled={loading}>
                  <FaIdCard />
                  <span>{loading ? 'Saving…' : cardData ? 'Update Card Information' : 'Issue Official Digital Card'}</span>
                </button>
              </form>
            </div>

            {/* 2. Wallet & Cashless Treatment Top-Up */}
            <div className="health-card-panel">
              <div className="health-card-panel-header">
                <div className="panel-header-title">
                  <div className="panel-header-icon wallet">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <h3>Recharge Cashless Credits</h3>
                    <p>Load credits for instant pharmacy orders, lab invoices, and admission clearance.</p>
                  </div>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="topup-preset-chips">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`topup-chip ${selectedPreset === amt && !topUpAmount ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPreset(amt);
                      setTopUpAmount(String(amt));
                    }}
                  >
                    + ৳ {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Amount Form */}
              <form onSubmit={handleTopUp}>
                <div className="topup-input-row">
                  <div className="topup-input-wrap">
                    <span className="topup-currency-badge">৳ BDT</span>
                    <input
                      type="number"
                      min="100"
                      max="50000"
                      placeholder="Enter recharge amount"
                      value={topUpAmount}
                      onChange={(e) => {
                        setTopUpAmount(e.target.value);
                        setSelectedPreset(null);
                      }}
                      required
                    />
                  </div>

                  <button type="submit" className="topup-btn-action" disabled={loading}>
                    <FaCoins />
                    <span>{loading ? 'Processing…' : 'Top Up Now'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Exclusive Member Benefits */}
            <div className="health-card-panel">
              <div className="health-card-panel-header">
                <div className="panel-header-title">
                  <div className="panel-header-icon benefits">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h3>Health Card Privileges</h3>
                    <p>Included with your HealingWave Clinical ID</p>
                  </div>
                </div>
              </div>

              <div className="benefits-cards-grid">
                <div className="benefit-card">
                  <FaPercent className="benefit-icon" />
                  <div className="benefit-text">
                    <h5>10% Inpatient Discount</h5>
                    <p>Applied to cabin reservations and surgical ward stay.</p>
                  </div>
                </div>

                <div className="benefit-card">
                  <FaCoins className="benefit-icon" />
                  <div className="benefit-text">
                    <h5>Cashless Pharmacy Checkout</h5>
                    <p>Direct point deduction with zero payment terminal delays.</p>
                  </div>
                </div>

                <div className="benefit-card">
                  <FaBed className="benefit-icon" />
                  <div className="benefit-text">
                    <h5>Priority Emergency Clearance</h5>
                    <p>Instant digital scan at trauma admitting counter.</p>
                  </div>
                </div>

                <div className="benefit-card">
                  <FaCheckCircle className="benefit-icon" />
                  <div className="benefit-text">
                    <h5>Diagnostic Reports Archive</h5>
                    <p>All lab test histories permanently synced with your QR.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN: ULTRA-REALISTIC DIGITAL HEALTH CARD SHOWCASE
              ================================================================ */}
          <div className="health-card-right-col">
            {/* The Realistic Digital Card */}
            <div className="digital-card-container">
              {/* Card Top Row */}
              <div className="card-top-row">
                <div className="card-brand-group">
                  <img src={healingWave} alt="HealingWave" className="card-hospital-logo" />
                  <div className="card-brand-titles">
                    <h4>HealingWave Hospital</h4>
                    <span>Digital Health Pass</span>
                  </div>
                </div>

                <span className="card-tier-chip">{cardTier}</span>
              </div>

              {/* Card Middle Row (Chip & Contactless NFC) */}
              <div>
                <div className="card-mid-row">
                  <div className="card-emv-chip"></div>
                  <FaWifi className="card-contactless-icon" title="NFC Enabled" />
                </div>
                <div className="card-number-display">{cardNumberDisplay}</div>
              </div>

              {/* Card Bottom Row (Patient Photo, Name, Expiry) */}
              <div className="card-bottom-row">
                <div className="card-patient-info">
                  {/* Patient Photo on the Card! */}
                  <img
                    src={getImageUrl(patientPhoto, cardDisplayName)}
                    alt={cardDisplayName}
                    className="card-patient-portrait"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cardDisplayName)}&background=0284c7&color=fff&size=150`;
                    }}
                  />
                  <div className="card-patient-text">
                    <span className="card-holder-label">Cardholder</span>
                    <h5 className="card-patient-name">{cardDisplayName}</h5>
                    <span className="card-blood-chip">
                      <FaTint style={{ marginRight: '4px' }} />
                      Blood Type: {cardBlood}
                    </span>
                  </div>
                </div>

                <div className="card-meta-right">
                  <FaQrcode style={{ fontSize: '1.4rem', color: '#38bdf8', opacity: 0.9 }} title="Digital Scan Pass" />
                  <span className="card-valid-date">VAL 12/28</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance & Meta Widget Under Card */}
            <div className="health-card-wallet-widget">
              <div className="wallet-balance-row">
                <div className="wallet-balance-left">
                  <p>Cashless Treatment Balance</p>
                  <h2 className="wallet-balance-amount">৳ {cardBalance.toLocaleString()} BDT</h2>
                </div>

                <div className="wallet-points-badge">
                  <FaCoins /> {cardPoints.toLocaleString()} Pts
                </div>
              </div>

              <div className="wallet-meta-list">
                <div className="wallet-meta-item">
                  <span>Linked Phone:</span>
                  <span>{formData.phoneNumber || 'Not Linked'}</span>
                </div>
                <div className="wallet-meta-item">
                  <span>Registered Email:</span>
                  <span>{formData.email || 'patient@email.com'}</span>
                </div>
                <div className="wallet-meta-item">
                  <span>Card Status:</span>
                  <span style={{ color: '#10b981' }}>● Verified & Active</span>
                </div>
              </div>

              <div className="card-action-buttons-row">
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => window.print()}
                  title="Print official hospital pass"
                >
                  <FaPrint /> Print Pass
                </button>
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={handleCopyCard}
                  title="Copy 16-digit card number"
                >
                  <FaCopy /> {copied ? 'Copied!' : 'Copy Number'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCard;
