import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../core/api/config';
import { storage } from '../utils/storage';
import { useAuthModal } from '../features/auth/AuthModalContext';
import DoctorCard from '../features/shared/components/DoctorCard';
import Footer from '../features/shared/components/layout/Footer';
import '../components/styles/Doctors.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUserMd, faHospital, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const Doctors = () => {
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/doctors/all')
      .then((res) => { if (active) setDoctors(Array.isArray(res.data) ? res.data : []); })
      .catch((err) => console.error('Error loading doctors:', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const departments = useMemo(() => {
    const set = new Set(doctors.map((d) => d.department).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [doctors]);

  const visible = useMemo(() => {
    return doctors.filter((doc) => {
      const matchDept = activeDept === 'All' || doc.department?.toLowerCase() === activeDept.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.degrees?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [doctors, activeDept, searchTerm]);

  const handleBook = (doctor) => {
    const target = `/patient/appointment?doctor=${doctor._id || doctor.id}`;
    const patientToken = storage.getItem('patientToken');
    if (patientToken) {
      navigate(target);
    } else {
      openAuth({ role: 'patient', mode: 'login', redirect: target });
    }
  };

  return (
    <div className="doctors-page">
      <Helmet>
        <title>Medical Specialists &amp; Doctors — HealingWave Health System</title>
      </Helmet>

      <section className="doctors-hero">
        <div className="doctors-hero-badge">
          <FontAwesomeIcon icon={faHospital} /> HealingWave Medical Staff
        </div>
        <h1>Find a Board-Certified Specialist</h1>
        <p>
          Consult with internationally trained physicians, professors, and surgeons across 40+ clinical disciplines.
          Book your in-person or telemedicine appointment instantly.
        </p>

        {/* Search Bar */}
        <div className="doctors-search-wrapper">
          <div className="doctors-search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or condition (e.g. Heart, Neurology, Dr. John)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                &times;
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Department Filter Chips */}
      {!loading && departments.length > 1 && (
        <div className="doctors-toolbar">
          <div className="toolbar-header">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" /> Filter by Clinical Department:
          </div>
          <div className="dept-chips-container">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`dept-chip ${activeDept === dept ? 'active' : ''}`}
                onClick={() => setActiveDept(dept)}
              >
                {dept}
                {dept !== 'All' && (
                  <span className="dept-count">
                    {doctors.filter((d) => d.department === dept).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="doctors-loading">
          <div className="doc-spinner"></div>
          <p>Loading medical specialists and clinical schedules...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="doctors-empty">
          <FontAwesomeIcon icon={faUserMd} className="empty-icon" />
          <h3>No matching specialists found</h3>
          <p>Try clearing your search or selecting a different clinical department.</p>
          <button className="btn-reset-filter" onClick={() => { setActiveDept('All'); setSearchTerm(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="doctors-container">
          <div className="doctors-results-count">
            Showing <strong>{visible.length}</strong> available specialist{visible.length !== 1 ? 's' : ''}
          </div>
          <div className="doctors-grid">
            {visible.map((doctor) => (
              <DoctorCard key={doctor._id || doctor.id} doctor={doctor} onBook={handleBook} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Doctors;
