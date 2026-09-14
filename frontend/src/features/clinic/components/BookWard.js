import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import { storage } from '../../../utils/storage';
import { toast } from '../../shared/components/ui/ToastContext';
import '../../../components/styles/BookWard.css';
import { 
  FaBed, FaHospital, FaArrowLeft, FaCheckCircle, 
  FaCalendarAlt, FaPhoneAlt, FaUser, FaEnvelope, 
  FaShieldAlt, FaProcedures, FaHeartbeat, FaInfoCircle, FaFemale, FaMale 
} from 'react-icons/fa';

const WARD_TIERS = [
  {
    type: 'men',
    title: "Men's Clinical Ward",
    rate: 1500,
    floors: [3, 4],
    gender: 'Male Patients Only',
    description: 'High-dependency male inpatient ward with continuous 24/7 nursing surveillance, central oxygen points, and orthopedic beds.',
    features: ['Central O₂ Pipeline', 'Adjustable Hospital Bed', '24/7 Ward Nurse Call', 'Sterile Partition Curtains', 'Daily Consultant Rounds'],
    icon: FaMale
  },
  {
    type: 'women',
    title: "Women's Clinical Ward",
    rate: 1500,
    floors: [5, 6],
    gender: 'Female Patients Only',
    description: 'Dedicated female inpatient ward with private curtain enclosures, maternal/gynecological support, and sanitized attendant seating.',
    features: ['Female Nursing Team', 'Attached Sanitized Restrooms', 'Maternal Telemetry', 'Electric Vital Signs Tracker', 'Dietary Nutritional Care'],
    icon: FaFemale
  }
];

const BookWard = () => {
  const [formData, setFormData] = useState({
    wardType: 'men',
    floor: '3',
    wardNo: '3A',
    patientName: '',
    email: '',
    phone: '',
    totalDays: 3,
    bookedDate: new Date().toISOString().split('T')[0],
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [occupiedWards, setOccupiedWards] = useState([]);

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

    // Fetch occupied wards
    axios.get('/api/wardBooking/all-bills')
      .then(res => {
        if (Array.isArray(res.data)) {
          const booked = res.data.filter(b => b.isBooked).map(b => `${b.floor}${b.wardNo}`);
          setOccupiedWards(booked);
        }
      })
      .catch(() => {});
  }, []);

  const selectedTier = WARD_TIERS.find(t => t.type === formData.wardType) || WARD_TIERS[0];
  const dailyRate = selectedTier.rate;
  const numDays = Math.max(1, parseInt(formData.totalDays) || 1);
  const subtotal = dailyRate * numDays;
  const nursingFee = 350;
  const estimatedTotal = subtotal + nursingFee;

  const handleTierSelect = (type) => {
    const tier = WARD_TIERS.find(t => t.type === type);
    const newFloor = String(tier.floors[0]);
    setFormData(prev => ({
      ...prev,
      wardType: type,
      floor: newFloor,
      wardNo: `${newFloor}A`
    }));
  };

  const handleFloorSelect = (floorNum) => {
    const fStr = String(floorNum);
    setFormData(prev => ({
      ...prev,
      floor: fStr,
      wardNo: `${fStr}A`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wardNo) {
      toast.error('Please select a bed number');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        wardType: formData.wardType,
        floor: parseInt(formData.floor),
        wardNo: formData.wardNo,
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        totalDays: parseInt(formData.totalDays),
        bookedDate: formData.bookedDate
      };

      const response = await axios.post('/api/wardBooking/wbook', payload);
      const succ = response.data.message || 'Ward bed reserved successfully!';
      setMessage(succ);
      setMessageType('success');
      toast.success(succ, { title: 'Ward Bed Reserved' });
    } catch (error) {
      const err = error.response?.data?.error || error.response?.data?.message || 'An error occurred while booking ward';
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
        <title>General Ward Bed Reservation | Medicare Hospital</title>
      </Helmet>

      {/* Top Header Bar */}
      <div className="cabin-header-bar">
        <div className="cabin-header-content">
          <Link href="/patient" className="back-portal-link">
            <FaArrowLeft /> Back to Patient Portal
          </Link>
          <div className="inpatient-type-tabs">
            <Link href="/patient/bookcabin" className="type-tab inactive">
              <FaHospital /> Private Cabins
            </Link>
            <span className="type-tab active">
              <FaBed /> General Wards
            </span>
          </div>
        </div>
      </div>

      <div className="cabin-container">
        {/* Title Header */}
        <div className="booking-page-header">
          <div className="badge-pill">
            <FaShieldAlt /> 24/7 Monitored Inpatient Care
          </div>
          <h1>General Ward Admission & Bed Booking</h1>
          <p>Affordable, sterilized multi-patient clinical wards equipped with central oxygen pipelines, 24/7 dedicated nursing staff, and sanitized patient bays.</p>
        </div>

        {message && (
          <div className={`booking-alert-banner ${messageType}`}>
            <FaInfoCircle /> {message}
          </div>
        )}

        <div className="booking-grid-layout">
          {/* Main Booking Form Column */}
          <div className="booking-form-col">
            
            {/* Step 1: Select Ward Wing */}
            <div className="form-card-section">
              <div className="section-header-title">
                <span className="step-num">1</span>
                <div>
                  <h3>Select Ward Wing</h3>
                  <p>Choose gender-segregated inpatient clinical wards</p>
                </div>
              </div>

              <div className="tier-cards-grid">
                {WARD_TIERS.map(tier => {
                  const IconComp = tier.icon;
                  return (
                    <div 
                      key={tier.type}
                      onClick={() => handleTierSelect(tier.type)}
                      className={`tier-card ${formData.wardType === tier.type ? 'selected' : ''}`}
                    >
                      <div className="tier-card-top">
                        <div className="tier-icon">
                          <IconComp />
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
                  );
                })}
              </div>
            </div>

            {/* Step 2: Floor & Bed Selector */}
            <div className="form-card-section">
              <div className="section-header-title">
                <span className="step-num">2</span>
                <div>
                  <h3>Select Floor & Inpatient Bed</h3>
                  <p>Floors available for {selectedTier.title}</p>
                </div>
              </div>

              <div className="floor-tabs-row">
                <span className="selector-label">Available Ward Floors:</span>
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
                <span className="selector-label">Clinical Beds on Floor {formData.floor}:</span>
                <div className="cabin-units-grid">
                  {['A', 'B', 'C', 'D', 'E'].map(letter => {
                    const bedCode = `${formData.floor}${letter}`;
                    const isOccupied = occupiedWards.includes(bedCode);
                    const isSelected = formData.wardNo === bedCode;

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setFormData({ ...formData, wardNo: bedCode })}
                        className={`unit-badge-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : 'available'}`}
                      >
                        <FaProcedures className="door-icon" />
                        <span className="unit-name">Bed {bedCode}</span>
                        <span className="unit-state">{isOccupied ? 'Occupied' : (isSelected ? 'Selected' : 'Available')}</span>
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
                  <p>Inpatient registration and emergency attendant contacts</p>
                </div>
              </div>

              <form id="ward-form" onSubmit={handleSubmit} className="admission-inputs-form">
                <div className="form-row-2">
                  <div className="input-group">
                    <label><FaUser /> Patient Full Name</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="e.g. Robert Smith"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label><FaEnvelope /> Patient Registered Email</label>
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
                    <label><FaPhoneAlt /> Attendant Contact Number</label>
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
                      <span className="days-indicator">Day(s) in Inpatient Ward</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>

          {/* Sticky Admission Summary Column */}
          <div className="booking-summary-col">
            <div className="summary-sticky-card">
              <div className="summary-card-header">
                <h3>Ward Stay Summary</h3>
                <span className="live-badge">Live Calculator</span>
              </div>

              <div className="summary-room-preview">
                <div className="room-preview-icon">
                  <FaBed />
                </div>
                <div>
                  <h4>{selectedTier.title}</h4>
                  <p>Floor {formData.floor} • Bed {formData.wardNo || 'Unselected'}</p>
                </div>
              </div>

              <div className="summary-amenities-tags">
                <span><FaHeartbeat /> O₂ Point</span>
                <span><FaShieldAlt /> 24/7 Nurse</span>
                <span><FaProcedures /> Orthopedic Bed</span>
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Bed Charge ({numDays} days × {dailyRate.toLocaleString()} BDT)</span>
                  <span className="breakdown-val">{subtotal.toLocaleString()} BDT</span>
                </div>
                <div className="breakdown-row">
                  <span>Ward Nursing & Sanitation</span>
                  <span className="breakdown-val">{nursingFee.toLocaleString()} BDT</span>
                </div>
                <div className="breakdown-row">
                  <span>Daily Physician Check</span>
                  <span className="breakdown-val free">Included</span>
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
                form="ward-form"
                disabled={loading}
                className="confirm-booking-btn"
              >
                {loading ? 'Reserving Ward Bed...' : `Confirm Bed Reservation • ${estimatedTotal.toLocaleString()} BDT`}
              </button>

              <div className="summary-hospital-guarantee">
                <FaShieldAlt className="guar-icon" />
                <p>Official Medicare Inpatient Admission. Direct bed clearance upon presentation of booking reference.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookWard;
