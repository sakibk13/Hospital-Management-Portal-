import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../components/styles/PatientDetails.css';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import { 
  FaSearch, FaUser, FaPhone, FaTint, FaDiagnoses, 
  FaVenusMars, FaNotesMedical, FaCalendarAlt, FaEnvelope, 
  FaPrescription, FaUserInjured, FaHospitalUser 
} from 'react-icons/fa';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  return `/${path}`;
};

const PatientDetails = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients('');
  }, []);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/patients/pdetails/search?searchQuery=${encodeURIComponent(query)}`);
      setPatients(response.data || []);
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Unable to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  return (
    <div className="doc-patient-dir-page">
      <Helmet>
        <title>Patient Directory & Clinical Dossiers | Doctor Portal</title>
      </Helmet>

      {/* Header Strip */}
      <div className="dir-header-strip">
        <div>
          <div className="dir-badge">
            <FaHospitalUser /> Clinical Patient Records
          </div>
          <h1>Patient Directory & Medical Dossiers</h1>
          <p>Search registered patients, review personal medical configurations, diagnosed conditions, and issue clinical prescriptions.</p>
        </div>

        <form onSubmit={handleSearch} className="dir-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading && (
        <div className="dir-loading">
          <div className="dir-spinner" />
          <p>Searching hospital patient directory...</p>
        </div>
      )}

      {error && <div className="dir-error">{error}</div>}

      {!loading && patients.length === 0 && (
        <div className="dir-empty">
          <FaUserInjured className="empty-icon" />
          <h3>No Patient Records Found</h3>
          <p>No patients matched "{searchQuery}". Try a different name, phone number, or search query.</p>
          <button onClick={() => { setSearchQuery(''); fetchPatients(''); }} className="reset-btn">
            View All Patients
          </button>
        </div>
      )}

      {/* Patient Cards Grid */}
      {!loading && patients.length > 0 && (
        <div className="patient-cards-grid">
          {patients.map((patient) => {
            const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
            const profilePic = getImageUrl(patient.profilePicture);

            return (
              <div key={patient._id || patient.id} className="patient-dossier-card">
                {/* Header with Photo / Avatar */}
                <div className="dossier-top">
                  <div className="patient-avatar-wrap">
                    {profilePic ? (
                      <img src={profilePic} alt={patientName} className="patient-avatar-img" />
                    ) : (
                      <div className="patient-avatar-placeholder">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="patient-name-block">
                    <h3 className="patient-title">{patientName}</h3>
                    <span className="patient-email-line"><FaEnvelope /> {patient.email || 'No email on file'}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="dossier-body">
                  <div className="dossier-row-grid">
                    <div className="dossier-field">
                      <span className="field-label"><FaCalendarAlt /> Age</span>
                      <span className="field-val">{patient.age ? `${patient.age} Yrs` : 'N/A'}</span>
                    </div>
                    <div className="dossier-field">
                      <span className="field-label"><FaVenusMars /> Sex</span>
                      <span className="field-val">{patient.sex || 'N/A'}</span>
                    </div>
                    <div className="dossier-field">
                      <span className="field-label"><FaTint /> Blood Group</span>
                      <span className="field-val blood-tag">{patient.bloodGroup || 'O+'}</span>
                    </div>
                  </div>

                  <div className="dossier-field full">
                    <span className="field-label"><FaPhone /> Contact</span>
                    <span className="field-val">{patient.mobileNumber || patient.phone || 'N/A'}</span>
                  </div>

                  {/* Medical Diagnosis & Condition Box */}
                  <div className="medical-config-box">
                    <span className="config-title"><FaNotesMedical /> Clinical Status:</span>
                    <div className="config-item">
                      <span className="config-key">Difficulty:</span>
                      <span className="config-val">{patient.difficulty || 'Normal / Routine'}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-key">Diagnosed:</span>
                      <span className="config-val highlight">{patient.beendignosed || patient.diagnosed || 'Under Clinical Evaluation'}</span>
                    </div>
                    {patient.condition && (
                      <div className="config-item">
                        <span className="config-key">Condition:</span>
                        <span className="config-val">{patient.condition}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="dossier-footer">
                  <Link
                    href={`/doctor/add-prescription?patientName=${encodeURIComponent(patientName)}&patientEmail=${encodeURIComponent(patient.email || '')}&phoneNumber=${encodeURIComponent(patient.mobileNumber || patient.phone || '')}&age=${encodeURIComponent(patient.age || '')}&sex=${encodeURIComponent(patient.sex || 'Male')}`}
                    className="btn-prescribe-patient"
                  >
                    <FaPrescription /> Issue Prescription
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
