import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faClock, 
  faStethoscope, 
  faBuilding,
  faHospital,
  faVideo,
  faRedo,
  faCheck,
  faCheckCircle,
  faShieldAlt,
  faMapMarkerAlt,
  faCreditCard,
  faNotesMedical,
  faChevronRight,
  faExclamationCircle,
  faPrint,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import '../../../../components/styles/AppointmentForm.css';
import { storage } from '../../../../utils/storage';
import { toast } from '../../../shared/components/ui/ToastContext';

const MORNING_SLOTS = [
  '09:00 AM - 09:20 AM',
  '09:30 AM - 09:50 AM',
  '10:00 AM - 10:20 AM',
  '10:30 AM - 10:50 AM',
  '11:00 AM - 11:20 AM',
  '11:30 AM - 11:50 AM'
];

const AFTERNOON_SLOTS = [
  '02:00 PM - 02:20 PM',
  '02:30 PM - 02:50 PM',
  '03:00 PM - 03:20 PM',
  '03:30 PM - 03:50 PM',
  '04:00 PM - 04:20 PM',
  '04:30 PM - 04:50 PM'
];

const AppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [activeDoctorData, setActiveDoctorData] = useState(null);

  const [visitType, setVisitType] = useState('in-person'); // 'in-person', 'video', 'follow-up'
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Helper for formatting date strings
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDatePlusDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Prefill patient info from storage & load departments
  useEffect(() => {
    const storedEmail = storage.getItem('patientEmail');
    if (storedEmail) setPatientEmail(storedEmail);

    const storedName = storage.getItem('patientName');
    if (storedName) setPatientName(storedName);

    axios.get('/api/appointments/departments')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDepartments(res.data);
        } else {
          setDepartments(['Cardiology', 'Neurology', 'Orthopaedics', 'Emergency', 'Paediatrics', 'General Medicine']);
        }
      })
      .catch(err => {
        console.error('Error fetching departments:', err);
        setDepartments(['Cardiology', 'Neurology', 'Orthopaedics', 'Emergency', 'Paediatrics', 'General Medicine']);
      });

    // Check preselected doctor query (?doctor=...)
    const queryParams = new URLSearchParams(location.search);
    const doctorId = queryParams.get('doctor');
    if (doctorId) {
      axios.get(`/api/appointments/doctor/${doctorId}`)
        .then(res => {
          if (res.data) {
            setSelectedDepartment(res.data.department || '');
            setSelectedDoctor(res.data._id || res.data.id || doctorId);
            setActiveDoctorData(res.data);
          }
        })
        .catch(err => console.error('Error fetching preselected doctor:', err));
    }
  }, [location.search]);

  // Load doctors whenever department changes
  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`/api/appointments/doctors/${selectedDepartment}`)
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          setDoctors(list);

          // If current selected doctor does not belong to new dept, reset
          if (selectedDoctor && !list.some(d => (d._id || d.id) === selectedDoctor)) {
            setSelectedDoctor('');
            setActiveDoctorData(null);
          }
        })
        .catch(err => {
          console.error('Error fetching doctors by dept:', err);
          setDoctors([]);
        });
    } else {
      setDoctors([]);
      setSelectedDoctor('');
      setActiveDoctorData(null);
    }
  }, [selectedDepartment]);

  // Load active doctor details
  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    if (!doctorId) {
      setActiveDoctorData(null);
      return;
    }
    const found = doctors.find(d => (d._id || d.id) === doctorId);
    if (found) {
      setActiveDoctorData(found);
    } else {
      axios.get(`/api/appointments/doctor/${doctorId}`)
        .then(res => setActiveDoctorData(res.data))
        .catch(() => setActiveDoctorData(null));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) {
      toast.error('Please select a department.');
      return;
    }
    if (!selectedDoctor) {
      toast.error('Please select a physician/clinician.');
      return;
    }
    if (!date) {
      toast.error('Please pick a preferred date.');
      return;
    }
    if (!timeSlot) {
      toast.error('Please select an available consultation time slot.');
      return;
    }

    setSubmitting(true);

    const docName = activeDoctorData 
      ? `Dr. ${activeDoctorData.firstName} ${activeDoctorData.lastName}`
      : 'Specialist Physician';

    const payload = {
      department: selectedDepartment,
      doctor: selectedDoctor,
      doctorName: docName,
      doctorEmail: activeDoctorData?.email || '',
      date,
      timeSlot,
      patientName,
      patientEmail,
      patientPhone,
      visitType,
      reasonForVisit,
      consultationFee: visitType === 'follow-up' ? 'Free (Included)' : '$50.00'
    };

    try {
      const res = await axios.post('/api/appointments', payload);
      const apptId = res.data?._id || res.data?.id || `HW-APT-${Math.floor(100000 + Math.random() * 900000)}`;

      setConfirmationData({
        referenceId: apptId,
        doctorName: docName,
        doctorSpecialty: activeDoctorData?.specialty || selectedDepartment,
        department: selectedDepartment,
        date,
        timeSlot,
        patientName,
        patientEmail,
        patientPhone,
        visitType: visitType === 'in-person' ? 'Hospital In-Person Visit' : visitType === 'video' ? 'Virtual Telehealth Video Consult' : 'Post-Treatment Follow-up',
        fee: visitType === 'follow-up' ? '$0.00 (Follow-up)' : '$50.00'
      });

      toast.success('Appointment booked successfully! Confirmation receipt generated.', { title: 'Appointment Confirmed' });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to schedule appointment. Please try again.';
      toast.error(errMsg, { title: 'Booking Failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setConfirmationData(null);
    setDate('');
    setTimeSlot('');
    setReasonForVisit('');
  };

  return (
    <div className="apt-booking-page">
      <Helmet>
        <title>Book a Clinical Appointment - HealingWave Hospital</title>
      </Helmet>

      <div className="apt-booking-wrapper">
        {/* Header & Breadcrumb */}
        <div className="apt-header-section">
          <div className="apt-breadcrumb">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span className="sep">/</span>
            <span>Appointments</span>
            <span className="sep">/</span>
            <span className="current">Schedule Visit</span>
          </div>

          <div className="apt-title-row">
            <div>
              <h1 className="apt-main-title">
                <FontAwesomeIcon icon={faCalendarCheck} className="title-icon" />
                Schedule Clinical Appointment
              </h1>
              <p className="apt-subtitle">
                Reserve an outpatient consultation, specialist review, or telehealth session with verified hospital physicians.
              </p>
            </div>

            <div className="apt-trust-badges">
              <div className="apt-trust-pill green">
                <FontAwesomeIcon icon={faCheckCircle} /> Instant Confirmation
              </div>
              <div className="apt-trust-pill">
                <FontAwesomeIcon icon={faShieldAlt} /> HIPAA 256-Bit Encrypted
              </div>
              <div className="apt-trust-pill">
                <FontAwesomeIcon icon={faHospital} /> Verified Hospital Staff
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Booking Layout */}
        <form onSubmit={handleSubmit} className="apt-layout-grid">
          
          {/* Left Column: Multi-Section Form */}
          <div className="apt-form-column">
            
            {/* Step 1: Department & Clinician Selection */}
            <div className="apt-section-card">
              <div className="apt-section-header">
                <div className="apt-section-title-wrap">
                  <span className="apt-step-badge">1</span>
                  <div>
                    <h2 className="apt-section-title">Department & Specialist Clinician</h2>
                    <p className="apt-section-desc">Select medical department and your preferred consultant</p>
                  </div>
                </div>
              </div>

              <div className="apt-grid-2">
                <div className="apt-form-group">
                  <label className="apt-label">
                    Medical Department <span className="req">*</span>
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faBuilding} className="apt-input-icon" />
                    <select 
                      className="apt-select"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      required
                    >
                      <option value="">Select Medical Department...</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label className="apt-label">
                    Specialist Physician <span className="req">*</span>
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faStethoscope} className="apt-input-icon" />
                    <select 
                      className="apt-select"
                      value={selectedDoctor}
                      onChange={(e) => handleDoctorChange(e.target.value)}
                      disabled={!selectedDepartment}
                      required
                    >
                      <option value="">
                        {!selectedDepartment ? '← Select Department First' : 'Choose Specialist Clinician...'}
                      </option>
                      {doctors.map((doc) => (
                        <option key={doc._id || doc.id} value={doc._id || doc.id}>
                          Dr. {doc.firstName} {doc.lastName} ({doc.specialty || doc.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Doctor Showcase Card */}
              {activeDoctorData && (
                <div className="apt-doctor-showcase">
                  {activeDoctorData.profilePicture ? (
                    <img 
                      src={activeDoctorData.profilePicture} 
                      alt={`Dr. ${activeDoctorData.firstName} ${activeDoctorData.lastName}`}
                      className="apt-doctor-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="apt-doctor-avatar-fallback">
                      <FontAwesomeIcon icon={faUserMd} />
                    </div>
                  )}
                  <div className="apt-doctor-info">
                    <h3 className="apt-doctor-name">
                      Dr. {activeDoctorData.firstName} {activeDoctorData.lastName}
                    </h3>
                    <div className="apt-doctor-specialty">
                      <FontAwesomeIcon icon={faStethoscope} style={{ color: '#0284c7' }} />
                      {activeDoctorData.specialty || selectedDepartment}
                    </div>
                    {activeDoctorData.degrees && (
                      <div className="apt-doctor-degrees">{activeDoctorData.degrees}</div>
                    )}
                    <div className="apt-doctor-schedule">
                      <span style={{ color: '#10b981' }}>●</span>
                      {activeDoctorData.availability || 'Available for hospital consultation'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Consultation Mode */}
            <div className="apt-section-card">
              <div className="apt-section-header">
                <div className="apt-section-title-wrap">
                  <span className="apt-step-badge">2</span>
                  <div>
                    <h2 className="apt-section-title">Consultation Mode</h2>
                    <p className="apt-section-desc">Choose how you wish to consult with the physician</p>
                  </div>
                </div>
              </div>

              <div className="apt-mode-grid">
                <div 
                  className={`apt-mode-card ${visitType === 'in-person' ? 'selected' : ''}`}
                  onClick={() => setVisitType('in-person')}
                >
                  <FontAwesomeIcon icon={faHospital} className="apt-mode-icon" />
                  <div className="apt-mode-title">In-Person Visit</div>
                  <div className="apt-mode-sub">Hospital OPD Clinic</div>
                  {visitType === 'in-person' && <FontAwesomeIcon icon={faCheck} className="apt-mode-check" />}
                </div>

                <div 
                  className={`apt-mode-card ${visitType === 'video' ? 'selected' : ''}`}
                  onClick={() => setVisitType('video')}
                >
                  <FontAwesomeIcon icon={faVideo} className="apt-mode-icon" />
                  <div className="apt-mode-title">Telehealth Video</div>
                  <div className="apt-mode-sub">Encrypted Virtual Call</div>
                  {visitType === 'video' && <FontAwesomeIcon icon={faCheck} className="apt-mode-check" />}
                </div>

                <div 
                  className={`apt-mode-card ${visitType === 'follow-up' ? 'selected' : ''}`}
                  onClick={() => setVisitType('follow-up')}
                >
                  <FontAwesomeIcon icon={faRedo} className="apt-mode-icon" />
                  <div className="apt-mode-title">Follow-up Review</div>
                  <div className="apt-mode-sub">Post-Treatment Check</div>
                  {visitType === 'follow-up' && <FontAwesomeIcon icon={faCheck} className="apt-mode-check" />}
                </div>
              </div>
            </div>

            {/* Step 3: Date & Preferred Time Slot */}
            <div className="apt-section-card">
              <div className="apt-section-header">
                <div className="apt-section-title-wrap">
                  <span className="apt-step-badge">3</span>
                  <div>
                    <h2 className="apt-section-title">Schedule & Time Slot</h2>
                    <p className="apt-section-desc">Select an available date and 20-minute clinical window</p>
                  </div>
                </div>
              </div>

              <div className="apt-form-group" style={{ marginBottom: '18px' }}>
                <label className="apt-label">
                  Consultation Date <span className="req">*</span>
                </label>
                <div className="apt-input-wrap">
                  <FontAwesomeIcon icon={faCalendarCheck} className="apt-input-icon" />
                  <input 
                    type="date"
                    className="apt-input"
                    min={getTodayStr()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="apt-date-shortcuts">
                  <button 
                    type="button" 
                    className={`apt-date-chip ${date === getTodayStr() ? 'active' : ''}`}
                    onClick={() => setDate(getTodayStr())}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    className={`apt-date-chip ${date === getDatePlusDays(1) ? 'active' : ''}`}
                    onClick={() => setDate(getDatePlusDays(1))}
                  >
                    Tomorrow
                  </button>
                  <button 
                    type="button" 
                    className={`apt-date-chip ${date === getDatePlusDays(2) ? 'active' : ''}`}
                    onClick={() => setDate(getDatePlusDays(2))}
                  >
                    In 2 Days
                  </button>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="apt-slots-container">
                <div className="apt-slot-period-title">
                  <FontAwesomeIcon icon={faClock} /> Morning Sessions (09:00 AM - 12:00 PM)
                </div>
                <div className="apt-slots-grid">
                  {MORNING_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`apt-slot-btn ${timeSlot === slot ? 'selected' : ''}`}
                      onClick={() => setTimeSlot(slot)}
                    >
                      <FontAwesomeIcon icon={faClock} style={{ fontSize: '0.75rem', opacity: 0.8 }} />
                      <span>{slot.replace(' AM', '')}</span>
                    </button>
                  ))}
                </div>

                <div className="apt-slot-period-title" style={{ marginTop: '16px' }}>
                  <FontAwesomeIcon icon={faClock} /> Afternoon & Evening Sessions (02:00 PM - 05:00 PM)
                </div>
                <div className="apt-slots-grid">
                  {AFTERNOON_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`apt-slot-btn ${timeSlot === slot ? 'selected' : ''}`}
                      onClick={() => setTimeSlot(slot)}
                    >
                      <FontAwesomeIcon icon={faClock} style={{ fontSize: '0.75rem', opacity: 0.8 }} />
                      <span>{slot.replace(' PM', '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Patient Credentials & Clinical Notes */}
            <div className="apt-section-card">
              <div className="apt-section-header">
                <div className="apt-section-title-wrap">
                  <span className="apt-step-badge">4</span>
                  <div>
                    <h2 className="apt-section-title">Patient Contact & Health Complaint</h2>
                    <p className="apt-section-desc">Details used for hospital chart lookup and confirmation notice</p>
                  </div>
                </div>
              </div>

              <div className="apt-grid-2" style={{ marginBottom: '16px' }}>
                <div className="apt-form-group">
                  <label className="apt-label">
                    Patient Full Name <span className="req">*</span>
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faUser} className="apt-input-icon" />
                    <input 
                      type="text"
                      className="apt-input"
                      placeholder="e.g. John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="apt-form-group">
                  <label className="apt-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faEnvelope} className="apt-input-icon" />
                    <input 
                      type="email"
                      className="apt-input"
                      placeholder="patient@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="apt-grid-2" style={{ marginBottom: '16px' }}>
                <div className="apt-form-group">
                  <label className="apt-label">
                    Contact Phone Number <span className="req">*</span>
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faPhone} className="apt-input-icon" />
                    <input 
                      type="tel"
                      className="apt-input"
                      placeholder="+880 1XXX XXXXXX"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="apt-form-group">
                  <label className="apt-label">
                    Consultation Type Note
                  </label>
                  <div className="apt-input-wrap">
                    <FontAwesomeIcon icon={faHospital} className="apt-input-icon" />
                    <input 
                      type="text"
                      className="apt-input"
                      readOnly
                      value={visitType === 'in-person' ? 'Standard Outpatient Consultation (OPD)' : visitType === 'video' ? 'Virtual Video Telehealth Consultation' : 'Post-Op / Follow-up Routine Review'}
                      style={{ background: '#f8fafc', color: '#475569' }}
                    />
                  </div>
                </div>
              </div>

              <div className="apt-form-group">
                <label className="apt-label">
                  Reason for Consultation / Symptoms (Optional)
                </label>
                <textarea 
                  className="apt-textarea"
                  placeholder="Briefly describe your symptoms, chief medical complaint, or ongoing medication..."
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Summary & Confirmation */}
          <div className="apt-summary-column">
            <div className="apt-summary-card">
              <h2 className="apt-summary-title">
                <FontAwesomeIcon icon={faNotesMedical} style={{ color: '#0284c7' }} />
                Booking Summary
              </h2>
              <p className="apt-summary-sub">Review clinical consultation details before confirming</p>

              <div className="apt-summary-body">
                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faBuilding} /> Department
                  </span>
                  <span className={`apt-sum-value ${!selectedDepartment ? 'empty' : ''}`}>
                    {selectedDepartment || 'Not selected'}
                  </span>
                </div>

                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faStethoscope} /> Clinician
                  </span>
                  <span className={`apt-sum-value highlight ${!activeDoctorData ? 'empty' : ''}`}>
                    {activeDoctorData ? `Dr. ${activeDoctorData.firstName} ${activeDoctorData.lastName}` : 'Not chosen'}
                  </span>
                </div>

                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faHospital} /> Mode
                  </span>
                  <span className="apt-sum-value">
                    {visitType === 'in-person' ? 'In-Person (OPD)' : visitType === 'video' ? 'Telehealth Video' : 'Follow-up Review'}
                  </span>
                </div>

                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faCalendarCheck} /> Date
                  </span>
                  <span className={`apt-sum-value ${!date ? 'empty' : ''}`}>
                    {date || 'Select date'}
                  </span>
                </div>

                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faClock} /> Time Slot
                  </span>
                  <span className={`apt-sum-value highlight ${!timeSlot ? 'empty' : ''}`}>
                    {timeSlot || 'Select time slot'}
                  </span>
                </div>

                <div className="apt-summary-row">
                  <span className="apt-sum-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Location
                  </span>
                  <span className="apt-sum-value" style={{ fontSize: '0.78rem' }}>
                    Tower B, Level 3 - Suite 302
                  </span>
                </div>
              </div>

              {/* Consultation Fee Box */}
              <div className="apt-fee-box">
                <div>
                  <div className="apt-fee-label">Consultation Fee</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {visitType === 'follow-up' ? 'Free follow-up check' : 'Pay at desk or online'}
                  </div>
                </div>
                <div className="apt-fee-amount">
                  {visitType === 'follow-up' ? 'Free' : '$50.00'}
                </div>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                className="apt-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faRedo} spin />
                    <span>Processing Reservation...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>

              <p className="apt-cancel-notice">
                🔒 Free cancellation & rescheduling up to 2 hours prior to appointment time. Instant email & SMS notification will be sent.
              </p>

              <div className="apt-urgent-hotline">
                🚨 Life-threatening emergency? Call <strong>+1 (800) 432-5464</strong> or <strong>10666</strong> immediately.
              </div>
            </div>
          </div>

        </form>

        {/* Confirmed Receipt Modal */}
        {confirmationData && (
          <div className="apt-success-modal-overlay">
            <div className="apt-success-card">
              <div className="apt-success-icon">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <h2 className="apt-success-title">Appointment Confirmed!</h2>
              <p className="apt-success-sub">
                Your appointment slip has been officially logged in the HealingWave Clinical System.
              </p>

              <div className="apt-receipt-box">
                <div className="apt-receipt-item">
                  <span className="k">Appointment ID</span>
                  <span className="v" style={{ color: '#0284c7' }}>{confirmationData.referenceId}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Specialist Doctor</span>
                  <span className="v">{confirmationData.doctorName}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Department</span>
                  <span className="v">{confirmationData.department}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Scheduled Date</span>
                  <span className="v">{confirmationData.date}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Time Window</span>
                  <span className="v">{confirmationData.timeSlot}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Consultation Mode</span>
                  <span className="v">{confirmationData.visitType}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Patient Name</span>
                  <span className="v">{confirmationData.patientName}</span>
                </div>
                <div className="apt-receipt-item">
                  <span className="k">Consultation Fee</span>
                  <span className="v" style={{ color: '#059669' }}>{confirmationData.fee}</span>
                </div>
              </div>

              <div className="apt-success-actions">
                <button 
                  type="button" 
                  className="apt-modal-btn secondary"
                  onClick={handleResetForm}
                >
                  Book Another
                </button>
                <Link 
                  to="/patient/view-appointment" 
                  className="apt-modal-btn primary"
                >
                  View My Appointments →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AppointmentForm;
