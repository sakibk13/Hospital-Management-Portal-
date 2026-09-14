import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../../../../core/api/config';
import { storage } from '../../../../utils/storage';
import { prescriptionPDF } from '../../../shared/components/utils/PDFGenerator'; 
import '../../../../components/styles/PrescriptionForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, faDownload, faPlus, faTrash, faPrescription, 
  faUserMd, faHeartPulse, faCalendarCheck, faStethoscope,
  faSearch, faUser, faUserCheck, faTimes, faChevronDown,
  faPhone, faEnvelope, faExchangeAlt, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

// Standard fallback SVG default profile picture (medical avatar, offline-resilient)
const DEFAULT_PATIENT_DP = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23e0f2fe' stroke='%230284c7' stroke-width='2'/><circle cx='50' cy='36' r='18' fill='%230284c7'/><path d='M20 84 c0-16.568 13.432-30 30-30 s30 13.432 30 30' fill='%230284c7'/></svg>";

export const getPatientDp = (patient) => {
  if (patient?.profilePicture && typeof patient.profilePicture === 'string' && patient.profilePicture.trim() !== '') {
    if (patient.profilePicture.startsWith('http') || patient.profilePicture.startsWith('data:')) {
      return patient.profilePicture;
    }
    return patient.profilePicture.startsWith('/') ? patient.profilePicture : `/${patient.profilePicture}`;
  }
  const name = patient?.name || patient?.patientName || 'Patient';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true&size=128`;
};

const COMMON_DRUGS = [
  { name: 'Amoxicillin + Clavulanic Acid 625mg', form: 'Tablet', freq: '1+0+1', meal: 'After Meal', dur: '5 Days' },
  { name: 'Paracetamol 665mg XR', form: 'Tablet', freq: '1+1+1', meal: 'After Meal', dur: '3 Days' },
  { name: 'Pantoprazole 20mg', form: 'Capsule', freq: '1+0+1', meal: 'Before Meal', dur: '14 Days' },
  { name: 'Azithromycin 500mg', form: 'Tablet', freq: '1+0+0', meal: 'Before Meal', dur: '5 Days' },
  { name: 'Cetirizine 10mg', form: 'Tablet', freq: '0+0+1', meal: 'After Meal', dur: '7 Days' },
  { name: 'Montelukast 10mg', form: 'Tablet', freq: '0+0+1', meal: 'At Bedtime', dur: '30 Days' },
  { name: 'Oral Rehydration Salts (ORS)', form: 'Sachet', freq: 'As needed', meal: 'Anytime', dur: '3 Days' }
];

const PrescriptionForm = () => {
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    doctorName: '',
    doctorEmail: '',
    date: new Date().toISOString().split('T')[0],
    patientEmail: '',
    patientName: '',
    phoneNumber: '',
    age: '',
    sex: 'Male',
    prescriptionText: ''
  });

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [vitals, setVitals] = useState({
    bp: '120/80',
    pulse: '76 bpm',
    temp: '98.6°F',
    weight: '68 kg'
  });

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Amoxicillin + Clavulanic Acid 625mg', form: 'Tablet', freq: '1+0+1', meal: 'After Meal', duration: '5 Days' },
    { name: 'Pantoprazole 20mg', form: 'Capsule', freq: '1+0+1', meal: 'Before Meal (30 min)', duration: '14 Days' }
  ]);

  const [advice, setAdvice] = useState('Drink plenty of boiled water (2.5L daily). Complete full course of antibiotics. Avoid cold exposure.');
  const [followUp, setFollowUp] = useState('After 7 days or SOS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch Doctor details
  useEffect(() => {
    const email = storage.getItem('doctorEmail');
    if (email) {
      axios.get(`/api/doctors/ddetails/email/${email}`)
        .then(response => {
          const doctor = response.data;
          setDoctorProfile(doctor);
          setFormData(prev => ({
            ...prev,
            doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            doctorEmail: doctor.email
          }));
        })
        .catch(err => {
          console.error('Error fetching doctor details:', err);
        });
    }
  }, []);

  // 2. Fetch Hospital Patients & handle URL params auto-select
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        let patientData = [];
        try {
          const res = await api.get('/patients');
          if (Array.isArray(res.data)) patientData = res.data;
        } catch (e) {
          const res = await axios.get('/api/patients');
          if (Array.isArray(res.data)) patientData = res.data;
        }

        setPatients(patientData);

        // Check if redirected with query params
        const queryParams = new URLSearchParams(location.search);
        const queryEmail = queryParams.get('patientEmail');
        const queryName = queryParams.get('patientName');

        if (queryEmail || queryName) {
          const matched = patientData.find(p => 
            (queryEmail && p.email && p.email.toLowerCase() === queryEmail.toLowerCase()) ||
            (queryName && p.name && p.name.toLowerCase() === queryName.toLowerCase())
          );

          if (matched) {
            handleSelectPatient(matched, false);
          } else {
            setFormData(prev => ({
              ...prev,
              patientEmail: queryEmail || prev.patientEmail,
              patientName: queryName || prev.patientName
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync structured medicines & advice into formData.prescriptionText
  useEffect(() => {
    let formatted = '';
    if (diagnosis) {
      formatted += `[Diagnosis / Complaints]: ${diagnosis}\n\n`;
    }
    formatted += `[Clinical Vitals]: BP: ${vitals.bp} | Pulse: ${vitals.pulse} | Temp: ${vitals.temp} | Wt: ${vitals.weight}\n\n`;
    formatted += `Rx (Medications):\n`;
    medicines.forEach((m, idx) => {
      formatted += `${idx + 1}. ${m.name} (${m.form}) - Schedule: ${m.freq} [${m.meal}] - Duration: ${m.duration}\n`;
    });
    if (advice) {
      formatted += `\n[Clinical Advice & Guidelines]:\n${advice}\n`;
    }
    if (followUp) {
      formatted += `\n[Next Follow-up]: ${followUp}`;
    }

    setFormData(prev => ({ ...prev, prescriptionText: formatted }));
  }, [diagnosis, vitals, medicines, advice, followUp]);

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMedicineRow = (prefill = null) => {
    const item = prefill || { name: '', form: 'Tablet', freq: '1+0+1', meal: 'After Meal', duration: '5 Days' };
    setMedicines(prev => [...prev, item]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSelectPatient = (patient, showToast = true) => {
    setSelectedPatient(patient);
    setIsDropdownOpen(false);
    setPatientSearchTerm('');

    setFormData(prev => ({
      ...prev,
      patientName: patient.name || prev.patientName,
      patientEmail: patient.email || prev.patientEmail,
      phoneNumber: patient.mobileNumber || patient.phoneNumber || prev.phoneNumber,
      age: (patient.age !== null && patient.age !== undefined && patient.age !== '') ? String(patient.age) : prev.age,
      sex: patient.sex || prev.sex || 'Male'
    }));

    if (patient.bloodPressure && patient.bloodPressure !== '--') {
      setVitals(v => ({ ...v, bp: patient.bloodPressure }));
    }
    if (patient.weight && patient.weight !== '--') {
      setVitals(v => ({ ...v, weight: patient.weight.includes('kg') ? patient.weight : `${patient.weight} kg` }));
    }
    if (patient.diagnosis && patient.diagnosis !== 'General Checkup') {
      setDiagnosis(patient.diagnosis);
    }

    if (showToast) {
      toast.success(`Selected patient: ${patient.name}`);
    }
  };

  const handleClearSelectedPatient = () => {
    setSelectedPatient(null);
    setFormData(prev => ({
      ...prev,
      patientName: '',
      patientEmail: '',
      phoneNumber: '',
      age: '',
      sex: 'Male'
    }));
  };

  const filteredPatients = patients.filter(p => {
    if (!patientSearchTerm.trim()) return true;
    const q = patientSearchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.mobileNumber && p.mobileNumber.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientEmail) {
      toast.error('Patient Name and Email are required');
      return;
    }
    if (medicines.length === 0) {
      toast.error('Please prescribe at least one medication');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age) || 0
      };
      const response = await axios.post('/api/prescriptions/create', payload);
      const succ = response.data.message || 'Prescription sent to patient successfully!';
      setMessage(succ);
      toast.success(succ, { title: 'Prescription Issued' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error creating prescription';
      setError(errMsg);
      toast.error(errMsg, { title: 'Prescription Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (!formData.patientName) {
      toast.error('Please enter patient name first');
      return;
    }
    prescriptionPDF({
      ...formData,
      vitals,
      diagnosis,
      medicines,
      advice,
      followUp,
      doctorProfile,
      selectedPatient
    });
  };

  return (
    <div className="rx-portal-container">
      <Helmet>
        <title>Doctor Rx Pad | Clinical Prescription Studio</title>
      </Helmet>

      {/* Top Header Bar */}
      <div className="rx-pad-top-bar">
        <div>
          <h2>Clinical Prescription Pad</h2>
          <p>Official Digital Outpatient Rx Form • Medicare Health System</p>
        </div>
        <div className="rx-top-actions">
          <button 
            type="button" 
            onClick={handleDownload}
            className="rx-btn-secondary"
          >
            <FontAwesomeIcon icon={faDownload} /> Download PDF
          </button>
          <button 
            type="submit" 
            form="rx-official-form"
            disabled={loading}
            className="rx-btn-primary"
          >
            <FontAwesomeIcon icon={faPaperPlane} /> {loading ? 'Issuing...' : 'Issue Prescription'}
          </button>
        </div>
      </div>

      {message && <div className="rx-status-banner success">{message}</div>}
      {error && <div className="rx-status-banner error">{error}</div>}

      {/* Main Prescription Paper Pad */}
      <div className="rx-paper-sheet">
        {/* Hospital Brand Header */}
        <div className="rx-sheet-header">
          <div className="rx-hospital-brand">
            <div className="rx-emblem">
              <FontAwesomeIcon icon={faStethoscope} />
            </div>
            <div>
              <h1>MEDICARE GENERAL HOSPITAL & MEDICAL CENTER</h1>
              <p className="hospital-sub">Department of Internal Medicine & Clinical Specialties</p>
              <p className="hospital-addr">15 Rankin Street, Wari, Dhaka-1203 • Hotline: +880 1700 000 000</p>
            </div>
          </div>
          <div className="rx-doctor-badge">
            <h3 className="doc-name">{formData.doctorName || 'Dr. Physician'}</h3>
            <p className="doc-degrees">{doctorProfile?.degree || 'MBBS, FCPS (Medicine)'}</p>
            <p className="doc-reg">BMDC Reg No: A-48921</p>
            <p className="doc-email">{formData.doctorEmail}</p>
          </div>
        </div>

        <div className="rx-divider" />

        <form id="rx-official-form" onSubmit={handleSubmit} className="rx-body-form">
          {/* ============================================================
              1. PATIENT RECORD SELECTOR (Name, Email, DP with fallback)
              ============================================================ */}
          <div className="rx-patient-select-wrapper" ref={dropdownRef}>
            <div className="rx-select-header-bar">
              <h4>
                <FontAwesomeIcon icon={faUser} style={{ color: '#0d9488' }} />
                Select Patient Record
              </h4>
              <span className="rx-registry-count">
                {patients.length} Registered Patients in Hospital
              </span>
            </div>

            {!selectedPatient ? (
              <div className="rx-patient-search-control">
                <div className="rx-search-input-wrap">
                  <FontAwesomeIcon icon={faSearch} className="rx-search-icon" />
                  <input
                    type="text"
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search patient by Name, Email, or Mobile number..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="rx-search-toggle-btn"
                  >
                    <span>{isDropdownOpen ? 'Close' : 'Browse Patients'}</span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      style={{ 
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'none', 
                        transition: 'transform 0.2s' 
                      }} 
                    />
                  </button>
                </div>

                {/* Dropdown Menu of Patients */}
                {isDropdownOpen && (
                  <div className="rx-patient-dropdown">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => {
                        const dpSrc = getPatientDp(p);
                        return (
                          <div
                            key={p.id || p._id || p.email}
                            className="rx-patient-option"
                            onClick={() => handleSelectPatient(p)}
                          >
                            <div className="rx-option-left">
                              {/* Patient DP with default picture fallback */}
                              <div className="patient-dp-container">
                                <img
                                  src={dpSrc}
                                  alt={p.name || 'Patient'}
                                  className="patient-dp-img"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = DEFAULT_PATIENT_DP;
                                  }}
                                />
                              </div>
                              <div className="rx-option-info">
                                <p className="rx-option-name">
                                  {p.name || 'Unnamed Patient'}
                                </p>
                                <p className="rx-option-email">{p.email}</p>
                              </div>
                            </div>

                            <div className="rx-option-badges">
                              {p.age && <span className="rx-badge-chip">{p.age} yrs</span>}
                              {p.sex && <span className="rx-badge-chip">{p.sex}</span>}
                              {p.bloodGroup && <span className="rx-badge-chip blood">{p.bloodGroup}</span>}
                              <span className="rx-select-action-badge">Select Record</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rx-dropdown-empty">
                        {loadingPatients ? (
                          <span>Loading patient records...</span>
                        ) : (
                          <span>No matching patient found in registry. You can enter details manually below for walk-in patient.</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Active Selected Patient Card */
              <div className="rx-selected-patient-card">
                <div className="rx-selected-left">
                  <div className="rx-selected-dp-wrap">
                    <img
                      src={getPatientDp(selectedPatient)}
                      alt={selectedPatient.name || 'Patient'}
                      className="patient-dp-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PATIENT_DP;
                      }}
                    />
                    <span className="rx-selected-status-dot" title="Active Patient" />
                  </div>

                  <div className="rx-selected-info">
                    <div className="rx-selected-name-row">
                      <h3 className="rx-selected-name">{selectedPatient.name || formData.patientName}</h3>
                      <span className="rx-verified-patient-tag">
                        <FontAwesomeIcon icon={faCheckCircle} /> Verified Patient
                      </span>
                    </div>

                    <div className="rx-selected-meta">
                      <span className="rx-selected-meta-item">
                        <FontAwesomeIcon icon={faEnvelope} style={{ color: '#0d9488' }} />
                        {selectedPatient.email || formData.patientEmail}
                      </span>
                      {(selectedPatient.mobileNumber || selectedPatient.phoneNumber) && (
                        <span className="rx-selected-meta-item">
                          <FontAwesomeIcon icon={faPhone} style={{ color: '#0d9488' }} />
                          {selectedPatient.mobileNumber || selectedPatient.phoneNumber}
                        </span>
                      )}
                      {selectedPatient.age && (
                        <span className="rx-selected-meta-item">
                          <strong>Age:</strong> {selectedPatient.age} yrs
                        </span>
                      )}
                      {selectedPatient.sex && (
                        <span className="rx-selected-meta-item">
                          <strong>Sex:</strong> {selectedPatient.sex}
                        </span>
                      )}
                      {selectedPatient.bloodGroup && (
                        <span className="rx-badge-chip blood">
                          Blood: {selectedPatient.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rx-selected-actions">
                  <button
                    type="button"
                    onClick={handleClearSelectedPatient}
                    className="rx-switch-patient-btn"
                    title="Change or Switch Patient"
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} /> Switch / Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              2. PATIENT DETAILS STRIP (Pre-filled & fully editable)
              ============================================================ */}
          <div className="rx-patient-strip">
            <div className="patient-field">
              <label>Patient Name:</label>
              <div className="patient-field-with-avatar">
                <div className="patient-field-mini-dp">
                  <img
                    src={getPatientDp(selectedPatient || { name: formData.patientName || 'Patient' })}
                    alt={formData.patientName || 'Patient'}
                    className="patient-dp-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PATIENT_DP;
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Patient Full Name"
                  required
                />
              </div>
            </div>
            <div className="patient-field w-age">
              <label>Age:</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 32"
                required
              />
            </div>
            <div className="patient-field w-sex">
              <label>Sex:</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="patient-field">
              <label>Email:</label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                placeholder="patient@email.com"
                required
              />
            </div>
            <div className="patient-field">
              <label>Phone:</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div className="patient-field w-date">
              <label>Date:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Vitals Telemetry Row */}
          <div className="rx-vitals-strip">
            <span className="vitals-title"><FontAwesomeIcon icon={faHeartPulse} /> Vitals:</span>
            <div className="vital-item">
              <span>BP:</span>
              <input 
                type="text" 
                value={vitals.bp} 
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                placeholder="120/80" 
              />
            </div>
            <div className="vital-item">
              <span>Pulse:</span>
              <input 
                type="text" 
                value={vitals.pulse} 
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                placeholder="76 bpm" 
              />
            </div>
            <div className="vital-item">
              <span>Temp:</span>
              <input 
                type="text" 
                value={vitals.temp} 
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                placeholder="98.6 F" 
              />
            </div>
            <div className="vital-item">
              <span>Weight:</span>
              <input 
                type="text" 
                value={vitals.weight} 
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                placeholder="65 kg" 
              />
            </div>
          </div>

          {/* Diagnosis & Chief Complaints */}
          <div className="rx-complaints-box">
            <label>Chief Complaints & Provisional Diagnosis:</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute upper respiratory infection, intermittent pyrexia for 3 days, dry cough"
            />
          </div>

          {/* The Rx Symbol & Structured Medicine Section */}
          <div className="rx-medications-section">
            <div className="rx-section-title">
              <div className="rx-symbol">℞</div>
              <h3>Prescribed Medications</h3>
              <div className="quick-drugs-pills">
                <span className="quick-label">Quick Add:</span>
                {COMMON_DRUGS.slice(0, 3).map((d, i) => (
                  <button 
                    key={i} 
                    type="button" 
                    onClick={() => addMedicineRow(d)}
                    className="quick-drug-pill"
                  >
                    + {d.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rx-medicines-table">
              <div className="rx-table-head">
                <span className="col-num">#</span>
                <span className="col-drug">Medicine Name & Strength</span>
                <span className="col-form">Dosage Form</span>
                <span className="col-schedule">Schedule</span>
                <span className="col-timing">Timing / Meal</span>
                <span className="col-duration">Duration</span>
                <span className="col-action"></span>
              </div>

              {medicines.map((med, idx) => (
                <div key={idx} className="rx-table-row">
                  <span className="col-num">{idx + 1}</span>
                  <div className="col-drug">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Tab. Amoxicillin 500mg"
                      required
                    />
                  </div>
                  <div className="col-form">
                    <select
                      value={med.form}
                      onChange={(e) => handleMedicineChange(idx, 'form', e.target.value)}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Injection">Injection</option>
                      <option value="Drops">Eye/Ear Drops</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Sachet">Sachet</option>
                    </select>
                  </div>
                  <div className="col-schedule">
                    <select
                      value={med.freq}
                      onChange={(e) => handleMedicineChange(idx, 'freq', e.target.value)}
                    >
                      <option value="1+0+1">1+0+1 (Morning & Night)</option>
                      <option value="1+1+1">1+1+1 (TDS - 3 times)</option>
                      <option value="1+0+0">1+0+0 (Morning only)</option>
                      <option value="0+0+1">0+0+1 (At Bedtime)</option>
                      <option value="1+1+1+1">1+1+1+1 (4 times)</option>
                      <option value="SOS / As needed">SOS (When needed)</option>
                    </select>
                  </div>
                  <div className="col-timing">
                    <select
                      value={med.meal}
                      onChange={(e) => handleMedicineChange(idx, 'meal', e.target.value)}
                    >
                      <option value="After Meal">After Meal</option>
                      <option value="Before Meal">Before Meal (30 min)</option>
                      <option value="With Meal">With Meal</option>
                      <option value="Empty Stomach">Empty Stomach</option>
                      <option value="At Bedtime">At Bedtime</option>
                    </select>
                  </div>
                  <div className="col-duration">
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 Days"
                    />
                  </div>
                  <div className="col-action">
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(idx)}
                      className="remove-med-btn"
                      title="Remove medicine"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addMedicineRow()}
              className="add-med-row-btn"
            >
              <FontAwesomeIcon icon={faPlus} /> Add Another Medicine
            </button>
          </div>

          {/* Advice and Follow-Up */}
          <div className="rx-footer-grid">
            <div className="rx-advice-card">
              <label>Clinical Advice & Dietary Guidelines:</label>
              <textarea
                rows="3"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Prescribe dietary measures, rest, fluid intake, and warning signs..."
              />
            </div>
            <div className="rx-followup-card">
              <label><FontAwesomeIcon icon={faCalendarCheck} /> Next Consultation / Follow-Up:</label>
              <input
                type="text"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="e.g. After 7 days with CBC & Serum Creatinine report"
              />
              <div className="rx-doctor-sign-box">
                <div className="signature-line" />
                <p className="sign-doc-name">{formData.doctorName}</p>
                <span className="sign-stamp">Registered Medical Practitioner • Digital Signature</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
