import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';
import '../../../components/styles/BookCabin.css';
import { 
  FaBed, FaHospital, FaArrowLeft, FaCheckCircle, 
  FaCalendarAlt, FaPhoneAlt, FaUser, FaEnvelope, 
  FaShieldAlt, FaTv, FaWifi, FaHeartbeat, FaInfoCircle, FaDoorOpen 
} from 'react-icons/fa';

const CABIN_TIERS = [
  {
    type: 'single',
    title: 'Single Deluxe Cabin',
    rate: 2000,
    floors: [7, 8],
    description: 'Private single-patient room with attached en-suite washroom, motorized hospital bed, and continuous vitals telemetry.',
    features: ['Central O₂ Supply', 'Motorized Bed', 'Attendant Daybed', 'Smart LED TV', '24/7 Nurse Call', 'High-Speed Wi-Fi'],
    popular: true
  },
  {
    type: 'double',
    title: 'Executive VIP Suite',
    rate: 2500,
    floors: [9],
    description: 'Spacious dual-space executive suite with dedicated attendant lounge, dietary meal support, and doctor consultation lounge.',
    features: ['Priority Doctor Rounds', 'Attached Lounge', 'Attendant Sofa-Bed', 'Mini Refrigerator', 'Dietitian Care Plan', 'Dedicated Nurse'],
    popular: false
  }
];

const BookCabin = () => {
  const [formData, setFormData] = useState({
    cabinType: 'single',
    floor: '7',
    cabinNo: '7A',
    patientName: '',
    email: '',
    phone: '',
    totalDays: 3,
    bookedDate: new Date().toISOString().split('T')[0],
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [occupiedCabins, setOccupiedCabins] = useState([]);

  useEffect(() => {
    const savedEmail = storage.getItem('patientEmail') || '';
    const savedName = storage.getItem('patientName') || '';

    setFormData(prev => ({
      ...prev,
      email: savedEmail,
      patientName: savedName
    }));

    if (savedEmail) {
      axios.get(`/api/patients/pdetails/email/${savedEmail}`)
        .then(res => {
          if (res.data) {
            setFormData(prev => ({
              ...prev,
              patientName: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || prev.patientName,
              phone: res.data.mobileNumber || prev.phone
            }));
          }
        })
        .catch(() => {});
    }

    // Fetch occupied / available
    axios.get('/api/cabinBooking/all-bills')
      .then(res => {
        if (Array.isArray(res.data)) {
          const booked = res.data.filter(b => b.isBooked).map(b => `${b.floor}${b.cabinNo}`);
          setOccupiedCabins(booked);
        }
      })
      .catch(() => {});
  }, []);

  const selectedTier = CABIN_TIERS.find(t => t.type === formData.cabinType) || CABIN_TIERS[0];
  const dailyRate = selectedTier.rate;
  const numDays = Math.max(1, parseInt(formData.totalDays) || 1);
  const subtotal = dailyRate * numDays;
  const nursingFee = 500;
  const estimatedTotal = subtotal + nursingFee;

  const handleTierSelect = (type) => {
    const tier = CABIN_TIERS.find(t => t.type === type);
    const newFloor = String(tier.floors[0]);
    setFormData(prev => ({
      ...prev,
      cabinType: type,
      floor: newFloor,
      cabinNo: `${newFloor}A`
    }));
  };

  const handleFloorSelect = (floorNum) => {
    const fStr = String(floorNum);
    setFormData(prev => ({
      ...prev,
      floor: fStr,
      cabinNo: `${fStr}A`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cabinNo) {
      toast.error('Please select a cabin number');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        cabinType: formData.cabinType,
        floor: parseInt(formData.floor),
        cabinNo: formData.cabinNo,
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        totalDays: parseInt(formData.totalDays),
        bookedDate: formData.bookedDate
      };

      const response = await axios.post('/api/cabinBooking/cbook', payload);
      const succ = response.data.message || 'Cabin booked successfully!';
      setMessage(succ);
      setMessageType('success');
      toast.success(succ, { title: 'Cabin Reserved' });
    } catch (error) {
      const err = error.response?.data?.error || error.response?.data?.message || 'An error occurred while booking cabin';
      setMessage(err);
      setMessageType('error');
      toast.error(err, { title: 'Booking Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cabin-ward-wrapper">
      <Helmet>
        <title>Inpatient Cabin Booking | Medicare Hospital</title>
      </Helmet>

      {/* Top Header Bar */}
      <div className="cabin-header-bar">
        <div className="cabin-header-content">
          <Link href="/patient" className="back-portal-link">
            <FaArrowLeft /> Back to Patient Portal
          </Link>
          <div className="inpatient-type-tabs">
            <span className="type-tab active">
              <FaHospital /> Private Cabins
            </span>
            <Link href="/patient/bookward" className="type-tab inactive">
              <FaBed /> General Wards
            </Link>
          </div>
        </div>
      </div>

      <div className="cabin-container">
        {/* Title Header */}
        <div className="booking-page-header">
          <div className="badge-pill">
            <FaShieldAlt /> 24/7 Clinical Inpatient Care
          </div>
          <h1>Hospital Cabin Reservation</h1>
          <p>Reserve state-of-the-art private inpatient suites with personalized clinical nursing, dietary care, and continuous monitoring.</p>
        </div>

        {message && (
          <div className={`booking-alert-banner ${messageType}`}>
            <FaInfoCircle /> {message}
          </div>
        )}

        <div className="booking-grid-layout">
          {/* Main Booking Form Column */}
          <div className="booking-form-col">
            
            {/* Step 1: Select Cabin Category */}
            <div className="form-card-section">
              <div className="section-header-title">
                <span className="step-num">1</span>
                <div>
                  <h3>Select Cabin Category</h3>
                  <p>Choose the inpatient tier that fits patient requirements and comfort</p>
                </div>
              </div>

              <div className="tier-cards-grid">
                {CABIN_TIERS.map(tier => (
                  <div 
                    key={tier.type}
                    onClick={() => handleTierSelect(tier.type)}
                    className={`tier-card ${formData.cabinType === tier.type ? 'selected' : ''}`}
                  >
                    {tier.popular && <span className="popular-tag">Most Recommended</span>}
                    <div className="tier-card-top">
                      <div className="tier-icon">
                        <FaBed />
                      </div>
                      <div className="tier-pricing">
                        <span className="rate-amount">{tier.rate.toLocaleString()} BDT</span>
                        <span className="rate-unit">/ night</span>
                      </div>
                    </div>
                    <h4>{tier.title}</h4>
                    <p className="tier-desc">{tier.description}</p>
                    <ul className="tier-features-list">
                      {tier.features.map((feat, idx) => (
                        <li key={idx}><FaCheckCircle className="chk-icon" /> {feat}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Floor & Room Selector */}
            <div className="form-card-section">
              <div className="section-header-title">
                <span className="step-num">2</span>
                <div>
                  <h3>Select Floor & Cabin Unit</h3>
                  <p>Floors available for {selectedTier.title}</p>
                </div>
              </div>

              <div className="floor-tabs-row">
                <span className="selector-label">Available Floors:</span>
                <div className="floor-buttons-group">
                  {selectedTier.floors.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleFloorSelect(f)}
                      className={`floor-btn ${String(formData.floor) === String(f) ? 'active' : ''}`}
                    >
                      Floor {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="units-selector-area">
                <span className="selector-label">Cabin Units on Floor {formData.floor}:</span>
                <div className="cabin-units-grid">
                  {['A', 'B', 'C', 'D', 'E'].map(letter => {
                    const unitCode = `${formData.floor}${letter}`;
                    const isOccupied = occupiedCabins.includes(unitCode);
                    const isSelected = formData.cabinNo === unitCode;

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setFormData({ ...formData, cabinNo: unitCode })}
                        className={`unit-badge-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : 'available'}`}
                      >
                        <FaDoorOpen className="door-icon" />
                        <span className="unit-name">Cabin {unitCode}</span>
                        <span className="unit-state">{isOccupied ? 'Occupied' : (isSelected ? 'Selected' : 'Vacant')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Patient Admission Information */}
            <div className="form-card-section">
              <div className="section-header-title">
                <span className="step-num">3</span>
                <div>
                  <h3>Patient Admission Details</h3>
                  <p>Contact and verification details for hospital admission clearance</p>
                </div>
              </div>

              <form id="cabin-form" onSubmit={handleSubmit} className="admission-inputs-form">
                <div className="form-row-2">
                  <div className="input-group">
                    <label><FaUser /> Patient Full Name</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label><FaEnvelope /> Registered Patient Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patient@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="input-group">
                    <label><FaPhoneAlt /> Attendant / Patient Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1XXXXXXXXX"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label><FaCalendarAlt /> Admission Date</label>
                    <input
                      type="date"
                      name="bookedDate"
                      value={formData.bookedDate}
                      onChange={(e) => setFormData({ ...formData, bookedDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-1">
                  <div className="input-group">
                    <label><FaBed /> Estimated Duration of Stay (Days)</label>
                    <div className="stepper-input-row">
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, totalDays: Math.max(1, (parseInt(formData.totalDays) || 1) - 1) })}
                        className="stepper-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        name="totalDays"
                        value={formData.totalDays}
                        onChange={(e) => setFormData({ ...formData, totalDays: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="stepper-field"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, totalDays: (parseInt(formData.totalDays) || 1) + 1 })}
                        className="stepper-btn"
                      >
                        +
                      </button>
                      <span className="days-indicator">Day(s) of Stay</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>

          {/* Sticky Reservation Summary Column */}
          <div className="booking-summary-col">
            <div className="summary-sticky-card">
              <div className="summary-card-header">
                <h3>Admission Summary</h3>
                <span className="live-badge">Live Calculator</span>
              </div>

              <div className="summary-room-preview">
                <div className="room-preview-icon">
                  <FaHospital />
                </div>
                <div>
                  <h4>{selectedTier.title}</h4>
                  <p>Floor {formData.floor} • Cabin {formData.cabinNo || 'Unselected'}</p>
                </div>
              </div>

              <div className="summary-amenities-tags">
                <span><FaTv /> Smart TV</span>
                <span><FaWifi /> Wi-Fi</span>
                <span><FaHeartbeat /> O₂ Telemetry</span>
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Room Rate ({numDays} days × {dailyRate.toLocaleString()} BDT)</span>
                  <span className="breakdown-val">{subtotal.toLocaleString()} BDT</span>
                </div>
                <div className="breakdown-row">
                  <span>Inpatient Nursing & Sanitization</span>
                  <span className="breakdown-val">{nursingFee.toLocaleString()} BDT</span>
                </div>
                <div className="breakdown-row">
                  <span>Doctor Visit Charge</span>
                  <span className="breakdown-val free">Covered</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-total-row">
                  <div>
                    <span className="total-label">Estimated Total Deposit</span>
                    <span className="tax-subtext">Payable via Health Card or Cash at Admission</span>
                  </div>
                  <span className="total-amount">{estimatedTotal.toLocaleString()} BDT</span>
                </div>
              </div>

              <button
                type="submit"
                form="cabin-form"
                disabled={loading}
                className="confirm-booking-btn"
              >
                {loading ? 'Reserving Inpatient Cabin...' : `Confirm Reservation • ${estimatedTotal.toLocaleString()} BDT`}
              </button>

              <div className="summary-hospital-guarantee">
                <FaShieldAlt className="guar-icon" />
                <p>Guaranteed sanitization, immediate admission clearance, and seamless Health Card cashless billing support.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookCabin;
