import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { prescriptionPDF } from '../../../../features/shared/components/utils/PDFGenerator';
import '../../../../components/styles/PatientPrescription.css';
import { Helmet } from 'react-helmet'; 
import { storage } from '../../../../utils/storage';
import { 
  FaFilePdf, FaSearch, FaUserMd, FaCalendarAlt, 
  FaPills, FaHospital, FaNotesMedical, FaCheckCircle, FaTrashAlt 
} from 'react-icons/fa';

const PatientPrescription = () => {
  const patientEmail = storage.getItem('patientEmail');
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, [patientEmail]);

  const fetchPrescriptions = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (patientEmail) {
        url = `/api/prescriptions/psearch?patientEmail=${encodeURIComponent(patientEmail)}&query=${encodeURIComponent(query)}`;
      } else {
        url = `/api/prescriptions/all`;
      }
      const response = await axios.get(url, {
        headers: { 'Patient-Email': patientEmail || '' }
      });
      setPrescriptions(response.data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Unable to load prescriptions. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrescriptions(searchTerm);
  };

  const handleDownload = (prescription) => {
    prescriptionPDF(prescription);
  };

  const handleRemove = (id) => {
    if (window.confirm('Remove this prescription from view?')) {
      setPrescriptions(prev => prev.filter(p => p._id !== id));
    }
  };

  return (
    <div className="patient-rx-page">
      <Helmet>
        <title>My Prescriptions | Medicare Patient Portal</title>
      </Helmet>

      <div className="rx-view-container">
        {/* Header Strip */}
        <div className="rx-view-header">
          <div>
            <div className="rx-badge-pill">
              <FaHospital /> Clinical Pharmacy & Outpatient Records
            </div>
            <h1>My Medical Prescriptions</h1>
            <p>Official digital prescriptions, medication schedules, and clinical guidance issued by your attending physicians.</p>
          </div>

          <form onSubmit={handleSearch} className="rx-search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by doctor name or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {loading && (
          <div className="rx-loading-state">
            <div className="spinner-circle" />
            <p>Retrieving your clinical prescriptions...</p>
          </div>
        )}

        {error && <div className="rx-error-state">{error}</div>}

        {!loading && prescriptions.length === 0 && (
          <div className="rx-empty-state">
            <FaNotesMedical className="empty-icon" />
            <h3>No Prescriptions Found</h3>
            <p>You currently do not have any issued clinical prescriptions under {patientEmail || 'your profile'}.</p>
          </div>
        )}

        <div className="rx-cards-grid">
          {prescriptions.map((rx) => {
            const rxDate = rx.date ? new Date(rx.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            }) : 'Recent';

            return (
              <div key={rx._id || rx.id} className="rx-record-card">
                <div className="card-top-bar">
                  <div className="doc-avatar-strip">
                    <div className="doc-avatar-circle">
                      <FaUserMd />
                    </div>
                    <div>
                      <h3 className="doc-name">{rx.doctorName || 'Attending Physician'}</h3>
                      <p className="doc-meta">{rx.doctorEmail}</p>
                    </div>
                  </div>
                  <div className="date-badge">
                    <FaCalendarAlt /> {rxDate}
                  </div>
                </div>

                <div className="rx-patient-summary">
                  <span><strong>Patient:</strong> {rx.patientName || 'Registered Patient'}</span>
                  {rx.age && <span><strong>Age:</strong> {rx.age} Yrs</span>}
                  {rx.sex && <span><strong>Sex:</strong> {rx.sex}</span>}
                </div>

                <div className="rx-content-body">
                  <div className="rx-badge-label">
                    <span className="rx-symbol-small">℞</span> Medical Instructions & Prescriptions
                  </div>
                  <pre className="rx-text-formatted">
                    {rx.prescriptionText || 'No medications listed.'}
                  </pre>
                </div>

                <div className="rx-card-footer">
                  <button 
                    onClick={() => handleDownload(rx)}
                    className="download-rx-btn"
                  >
                    <FaFilePdf /> Download Official PDF
                  </button>
                  <button 
                    onClick={() => handleRemove(rx._id)}
                    className="remove-rx-btn"
                    title="Dismiss card"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientPrescription;
