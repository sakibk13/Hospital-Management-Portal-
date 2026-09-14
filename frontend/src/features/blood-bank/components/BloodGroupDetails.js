import React, { useEffect, useState, useMemo } from 'react';
import '../../../components/styles/BloodGroupDetails.css';
import api from '../../../core/api/config';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import bloodCompImg from '../../../assets/blood_comp.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faChevronLeft, 
  faChevronRight, 
  faTint, 
  faSearch, 
  faCheckCircle, 
  faInfoCircle,
  faHandsHelping,
  faShieldVirus,
  faExchangeAlt,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

// Clinical Blood Compatibility Matrix Dataset
const COMPATIBILITY_DATA = [
  {
    group: 'O-',
    title: 'Universal Red Cell Donor',
    badgeType: 'universal-donor',
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    plasmaCompat: 'Can receive from all plasma types',
    population: '7% (Critically Rare)',
    clinicalNotes: 'Can be given to ANY emergency patient when blood group is unknown.'
  },
  {
    group: 'O+',
    title: 'Most Common Blood Type',
    badgeType: 'high-demand',
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    plasmaCompat: 'Receives from O+, O-, A, B, AB',
    population: '38% (High Demand)',
    clinicalNotes: 'Crucial for trauma cases and elective surgeries for all Rh-positive patients.'
  },
  {
    group: 'A-',
    title: 'Rh-Negative Subtype',
    badgeType: 'rh-negative',
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    plasmaCompat: 'Receives from A and AB',
    population: '6% (Rare)',
    clinicalNotes: 'Can donate whole blood to all Type A and Type AB individuals.'
  },
  {
    group: 'A+',
    title: 'Second Most Common',
    badgeType: 'common',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    plasmaCompat: 'Receives from A and AB',
    population: '34% (High Demand)',
    clinicalNotes: 'One of the most frequently transfused red blood cell types in hospitals.'
  },
  {
    group: 'B-',
    title: 'Rare Negative Group',
    badgeType: 'rh-negative',
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    plasmaCompat: 'Receives from B and AB',
    population: '2% (Very Rare)',
    clinicalNotes: 'Essential reserves maintained for pediatric and emergency transfusions.'
  },
  {
    group: 'B+',
    title: 'Third Most Common',
    badgeType: 'common',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    plasmaCompat: 'Receives from B and AB',
    population: '9% (Moderate)',
    clinicalNotes: 'Critical for patients undergoing chemotherapy and major surgical operations.'
  },
  {
    group: 'AB-',
    title: 'Rarest Blood Group',
    badgeType: 'rare',
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    plasmaCompat: 'Universal Plasma Donor',
    population: '1% (Extremely Rare)',
    clinicalNotes: 'AB plasma is universally compatible with any patient in the ICU.'
  },
  {
    group: 'AB+',
    title: 'Universal Red Cell Recipient',
    badgeType: 'universal-recipient',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    plasmaCompat: 'Universal Plasma Donor',
    population: '3% (Rare)',
    clinicalNotes: 'Can safely receive red blood cells from ANY of the 8 ABO blood types.'
  }
];

const DEFAULT_DONORS = [
  { _id: '1', firstName: 'Sarah', lastName: 'Jenkins', phoneNumber: '+1 (555) 234-5678', gender: 'Female', email: 'sarah.j@example.com', bloodGroup: 'O-' },
  { _id: '2', firstName: 'David', lastName: 'Miller', phoneNumber: '+1 (555) 876-5432', gender: 'Male', email: 'david.m@example.com', bloodGroup: 'O+' },
  { _id: '3', firstName: 'Emily', lastName: 'Chen', phoneNumber: '+1 (555) 345-6789', gender: 'Female', email: 'emily.chen@example.com', bloodGroup: 'A+' },
  { _id: '4', firstName: 'Marcus', lastName: 'Aurelius', phoneNumber: '+1 (555) 901-2345', gender: 'Male', email: 'marcus.a@example.com', bloodGroup: 'A-' },
  { _id: '5', firstName: 'Jessica', lastName: 'Taylor', phoneNumber: '+1 (555) 456-7890', gender: 'Female', email: 'jtaylor@example.com', bloodGroup: 'B+' },
  { _id: '6', firstName: 'Alexander', lastName: 'Wright', phoneNumber: '+1 (555) 678-9012', gender: 'Male', email: 'alex.wright@example.com', bloodGroup: 'B-' },
  { _id: '7', firstName: 'Rachel', lastName: 'Green', phoneNumber: '+1 (555) 789-0123', gender: 'Female', email: 'rachel.g@example.com', bloodGroup: 'AB+' },
  { _id: '8', firstName: 'Michael', lastName: 'Scott', phoneNumber: '+1 (555) 890-1234', gender: 'Male', email: 'mscott@example.com', bloodGroup: 'AB-' },
];

const BloodGroupDetails = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' or 'donors'
  const [donorDetails, setDonorDetails] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [matrixFilter, setMatrixFilter] = useState('all');
  const [donorSearch, setDonorSearch] = useState('');
  const [donorGroupFilter, setDonorGroupFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        const response = await api.get('/bloodDonor/details');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setDonorDetails(response.data);
        } else {
          setDonorDetails(DEFAULT_DONORS);
        }
      } catch (error) {
        console.warn('Falling back to default donor records:', error);
        setDonorDetails(DEFAULT_DONORS);
      } finally {
        setLoadingDonors(false);
      }
    };

    fetchDonorDetails();
  }, []);

  // Filter compatibility matrix
  const filteredMatrix = useMemo(() => {
    if (matrixFilter === 'all') return COMPATIBILITY_DATA;
    if (matrixFilter === 'rh-positive') return COMPATIBILITY_DATA.filter(d => d.group.includes('+'));
    if (matrixFilter === 'rh-negative') return COMPATIBILITY_DATA.filter(d => d.group.includes('-'));
    if (matrixFilter === 'universal') return COMPATIBILITY_DATA.filter(d => d.group === 'O-' || d.group === 'AB+');
    return COMPATIBILITY_DATA;
  }, [matrixFilter]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donorDetails.filter((donor) => {
      const fullName = `${donor.firstName || ''} ${donor.lastName || ''}`.toLowerCase();
      const email = (donor.email || '').toLowerCase();
      const group = (donor.bloodGroup || '').toLowerCase();
      const search = donorSearch.trim().toLowerCase();

      const matchesSearch = fullName.includes(search) || email.includes(search) || group.includes(search);
      const matchesGroup = donorGroupFilter === 'all' || donor.bloodGroup === donorGroupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [donorDetails, donorSearch, donorGroupFilter]);

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="blood-group-details-page">
      <Helmet>
        <title>Blood Group Compatibility & Donors - HealingWave Hospital</title>
      </Helmet>

      <div className="blood-group-wrapper">
        {/* Navigation Bar */}
        <div className="blood-group-topbar">
          <button className="blood-group-details-back-button" onClick={() => navigate('/blood-bank')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Blood Bank
          </button>
          <div className="transfusion-safety-badge">
            <FontAwesomeIcon icon={faShieldVirus} /> WHO & AABB Standards Compliant
          </div>
        </div>

        {/* Hero Banner with Uploaded Image */}
        <div className="blood-group-hero">
          <div className="blood-group-hero-content">
            <div className="hero-pill-comp">
              <FontAwesomeIcon icon={faExchangeAlt} /> Clinical Transfusion Guide
            </div>
            <h1 className="blood-group-details-title">Blood Group Compatibility & Donor Network</h1>
            <p className="blood-group-hero-text">
              Understanding ABO and Rh antigen compatibility is essential for safe blood transfusions. Check donor/recipient rules, universal donor protocols, and view our registered donor directory.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/blood-donor" className="hero-btn-primary">
                Register as a Donor
              </Link>
              <Link to="/blood-availability" className="hero-btn-secondary">
                Check Live Stock Table
              </Link>
            </div>
          </div>
          <div className="blood-group-hero-image">
            <img 
              src={bloodCompImg?.src || bloodCompImg || '/assets/blood_comp.jpg'} 
              alt="Blood Group Compatibility" 
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="group-tabs-container">
          <button 
            className={`group-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            <FontAwesomeIcon icon={faExchangeAlt} /> Compatibility Matrix
          </button>
          <button 
            className={`group-tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
            onClick={() => setActiveTab('donors')}
          >
            <FontAwesomeIcon icon={faUsers} /> Registered Donors Directory ({donorDetails.length})
          </button>
        </div>

        {/* TAB 1: Compatibility Matrix */}
        {activeTab === 'matrix' && (
          <div className="matrix-view-card">
            <div className="matrix-header-bar">
              <div>
                <h3 className="matrix-heading">ABO & Rh Transfusion Compatibility Matrix</h3>
                <p className="matrix-subheading">Guidelines for whole blood and packed red blood cell (RBC) transfusions</p>
              </div>

              <div className="matrix-filter-pills">
                <button 
                  className={`matrix-pill ${matrixFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMatrixFilter('all')}
                >
                  All (8 Types)
                </button>
                <button 
                  className={`matrix-pill ${matrixFilter === 'rh-positive' ? 'active' : ''}`}
                  onClick={() => setMatrixFilter('rh-positive')}
                >
                  Rh Positive (+)
                </button>
                <button 
                  className={`matrix-pill ${matrixFilter === 'rh-negative' ? 'active' : ''}`}
                  onClick={() => setMatrixFilter('rh-negative')}
                >
                  Rh Negative (-)
                </button>
                <button 
                  className={`matrix-pill ${matrixFilter === 'universal' ? 'active' : ''}`}
                  onClick={() => setMatrixFilter('universal')}
                >
                  Universal (O- / AB+)
                </button>
              </div>
            </div>

            <div className="matrix-table-container">
              <table className="modern-comp-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Blood Group</th>
                    <th style={{ minWidth: '220px' }}>Can Give Red Cells To</th>
                    <th style={{ minWidth: '220px' }}>Can Receive Red Cells From</th>
                    <th style={{ minWidth: '200px' }}>Population Prevalence</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((item) => (
                    <tr key={item.group} className="comp-table-row">
                      <td className="cell-comp-group">
                        <div className="comp-group-badge-box">
                          <span className="comp-group-icon">
                            <FontAwesomeIcon icon={faTint} />
                          </span>
                          <div className="comp-group-meta">
                            <span className="comp-group-code">🩸 {item.group}</span>
                            <span className={`comp-type-tag ${item.badgeType}`}>
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="cell-comp-give">
                        <div className="comp-pill-cluster">
                          {item.canGiveTo.map((g) => (
                            <span key={g} className="give-tag">
                              🩸 {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="cell-comp-receive">
                        <div className="comp-pill-cluster">
                          {item.canReceiveFrom.map((g) => (
                            <span key={g} className="receive-tag">
                              🩸 {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="cell-comp-notes">
                        <div className="pop-rate">{item.population}</div>
                        <div className="clinical-desc">{item.clinicalNotes}</div>
                      </td>

                      <td className="cell-comp-action">
                        <button 
                          className="comp-book-btn"
                          onClick={() => navigate(`/blood-recipient?group=${encodeURIComponent(item.group)}`)}
                        >
                          🩸 Book Unit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Education Callouts */}
            <div className="comp-callouts-grid">
              <div className="callout-box">
                <div className="callout-header">
                  <FontAwesomeIcon icon={faInfoCircle} className="callout-icon red" />
                  <h4>Universal Red Cell Donor (O-)</h4>
                </div>
                <p>O-negative red blood cells contain neither A nor B antigens and have no Rh factor, allowing them to be safely transfused to patients of any blood type in emergency trauma cases.</p>
              </div>

              <div className="callout-box">
                <div className="callout-header">
                  <FontAwesomeIcon icon={faCheckCircle} className="callout-icon green" />
                  <h4>Universal Red Cell Recipient (AB+)</h4>
                </div>
                <p>AB-positive individuals possess both A and B antigens as well as the Rh factor, meaning their immune system will not produce antibodies against any ABO/Rh blood groups.</p>
              </div>

              <div className="callout-box">
                <div className="callout-header">
                  <FontAwesomeIcon icon={faHandsHelping} className="callout-icon blue" />
                  <h4>Plasma vs Red Cells Rule</h4>
                </div>
                <p>While O- is the universal red cell donor, AB is the universal plasma donor! AB plasma has no ABO antibodies, making it the emergency treatment for burns and trauma.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Registered Donors Network */}
        {activeTab === 'donors' && (
          <div className="donors-view-card">
            {/* Donors Controls Toolbar */}
            <div className="donors-toolbar">
              <div className="donors-search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input 
                  type="text"
                  placeholder="Search donor name, email or blood group..."
                  value={donorSearch}
                  onChange={(e) => { setDonorSearch(e.target.value); setCurrentPage(1); }}
                  className="donors-search-input"
                />
              </div>

              <div className="donor-group-dropdown">
                <label className="dropdown-label">Filter Group:</label>
                <select 
                  value={donorGroupFilter} 
                  onChange={(e) => { setDonorGroupFilter(e.target.value); setCurrentPage(1); }}
                  className="group-select"
                >
                  <option value="all">All Groups</option>
                  <option value="O+">🩸 O+</option>
                  <option value="O-">🩸 O-</option>
                  <option value="A+">🩸 A+</option>
                  <option value="A-">🩸 A-</option>
                  <option value="B+">🩸 B+</option>
                  <option value="B-">🩸 B-</option>
                  <option value="AB+">🩸 AB+</option>
                  <option value="AB-">🩸 AB-</option>
                </select>
              </div>

              <Link to="/blood-donor" className="add-donor-cta">
                + Register New Donor
              </Link>
            </div>

            <div className="blood-group-details-table-container">
              <table className="modern-donor-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Gender</th>
                    <th>Contact Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDonors ? (
                    <tr>
                      <td colSpan="7" className="donor-empty-td">
                        <FontAwesomeIcon icon={faTint} spin /> Loading registered donors...
                      </td>
                    </tr>
                  ) : currentDonors.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="donor-empty-td">
                        No registered donors found matching your search.
                      </td>
                    </tr>
                  ) : (
                    currentDonors.map((donor, idx) => (
                      <tr key={donor._id || idx} className="donor-row">
                        <td className="cell-donor-name">
                          <div className="donor-avatar-wrap">
                            <div className="donor-initials">
                              {(donor.firstName?.[0] || 'D')}{(donor.lastName?.[0] || '')}
                            </div>
                            <div className="donor-name-text">
                              <span className="full-name">{donor.firstName} {donor.lastName}</span>
                              <span className="donor-id">ID: #{String(donor._id || idx).slice(-4).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>

                        <td className="cell-donor-group">
                          <span className="donor-blood-tag">
                            🩸 {donor.bloodGroup}
                          </span>
                        </td>

                        <td className="cell-donor-gender">
                          <span className="gender-label">{donor.gender || 'Not specified'}</span>
                        </td>

                        <td className="cell-donor-phone">
                          <span className="phone-text">{donor.phoneNumber}</span>
                        </td>

                        <td className="cell-donor-email">
                          <span className="email-text">{donor.email}</span>
                        </td>

                        <td className="cell-donor-status">
                          <span className="verified-donor-badge">
                            <FontAwesomeIcon icon={faCheckCircle} /> Screened Active
                          </span>
                        </td>

                        <td className="cell-donor-action">
                          <button 
                            className="contact-donor-btn"
                            onClick={() => alert(`Contacting ${donor.firstName} ${donor.lastName} at ${donor.phoneNumber}`)}
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {currentDonors.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredDonors.length)} of {filteredDonors.length} donors
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} /> Previous
                </button>
                <span className="page-current-num">Page {currentPage} of {totalPages}</span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BloodGroupDetails;
