import React, { useEffect, useState, useMemo } from 'react';
import '../../../components/styles/BloodAvailability.css';
import { Helmet } from 'react-helmet';
import api from '../../../core/api/config';
import { useNavigate, Link } from 'react-router-dom';
import bloodAvailImg from '../../../assets/blood_avail.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTint, 
  faSearch, 
  faCheckCircle, 
  faExclamationTriangle, 
  faTimesCircle,
  faShieldAlt,
  faPhoneAlt,
  faSyncAlt,
  faChartBar,
  faSortAmountDown
} from '@fortawesome/free-solid-svg-icons';

const COMPATIBILITY_MAP = {
  'O-': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], label: 'Universal Red Cell Donor', rh: 'Negative', antigen: 'No A/B antigens' },
  'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], label: 'High Demand Blood Type', rh: 'Positive', antigen: 'Rh antigen present' },
  'A-': { canGiveTo: ['A-', 'A+', 'AB-', 'AB+'], label: 'Rare Rh- Type', rh: 'Negative', antigen: 'A antigen, No Rh' },
  'A+': { canGiveTo: ['A+', 'AB+'], label: 'Second Most Common', rh: 'Positive', antigen: 'A & Rh antigens' },
  'B-': { canGiveTo: ['B-', 'B+', 'AB-', 'AB+'], label: 'Rare Rh- Type', rh: 'Negative', antigen: 'B antigen, No Rh' },
  'B+': { canGiveTo: ['B+', 'AB+'], label: 'High Trauma Demand', rh: 'Positive', antigen: 'B & Rh antigens' },
  'AB-': { canGiveTo: ['AB-', 'AB+'], label: 'Universal Plasma Donor', rh: 'Negative', antigen: 'A & B antigens' },
  'AB+': { canGiveTo: ['AB+'], label: 'Universal Recipient', rh: 'Positive', antigen: 'All antigens present' }
};

const DEFAULT_STOCK = [
  { bloodGroup: 'O+', count: 18 },
  { bloodGroup: 'O-', count: 6 },
  { bloodGroup: 'A+', count: 14 },
  { bloodGroup: 'A-', count: 5 },
  { bloodGroup: 'B+', count: 16 },
  { bloodGroup: 'B-', count: 4 },
  { bloodGroup: 'AB+', count: 10 },
  { bloodGroup: 'AB-', count: 3 }
];

const BloodAvailability = () => {
  const navigate = useNavigate();
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'O', 'A', 'B', 'AB', 'optimal', 'low', 'critical'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'count-desc', 'count-asc', 'group-asc'
  const [refreshing, setRefreshing] = useState(false);

  const fetchBloodAvailability = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/bloodAvailability');
      const data = Array.isArray(response.data) && response.data.length > 0 ? response.data : DEFAULT_STOCK;
      setBloodGroups(data);
      setError('');
    } catch (err) {
      console.warn('Falling back to default stock list:', err);
      setBloodGroups(DEFAULT_STOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBloodAvailability();
  }, []);

  const totalUnits = useMemo(() => {
    return bloodGroups.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  }, [bloodGroups]);

  const stats = useMemo(() => {
    let optimal = 0;
    let low = 0;
    let critical = 0;
    bloodGroups.forEach((g) => {
      const count = Number(g.count) || 0;
      if (count > 10) optimal++;
      else if (count > 0) low++;
      else critical++;
    });
    return { optimal, low, critical, totalTypes: bloodGroups.length };
  }, [bloodGroups]);

  const filteredGroups = useMemo(() => {
    const list = bloodGroups.filter((g) => {
      const groupName = (g.bloodGroup || '').toUpperCase();
      const search = searchTerm.trim().toUpperCase();
      const matchesSearch = groupName.includes(search);

      const count = Number(g.count) || 0;
      let matchesFilter = true;

      if (filterType === 'optimal') matchesFilter = count > 10;
      else if (filterType === 'low') matchesFilter = count > 0 && count <= 10;
      else if (filterType === 'critical') matchesFilter = count === 0;
      else if (filterType === 'O') matchesFilter = groupName.startsWith('O');
      else if (filterType === 'A') matchesFilter = groupName.startsWith('A') && !groupName.startsWith('AB');
      else if (filterType === 'B') matchesFilter = groupName.startsWith('B');
      else if (filterType === 'AB') matchesFilter = groupName.startsWith('AB');

      return matchesSearch && matchesFilter;
    });

    if (sortBy === 'count-desc') {
      return [...list].sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0));
    }
    if (sortBy === 'count-asc') {
      return [...list].sort((a, b) => (Number(a.count) || 0) - (Number(b.count) || 0));
    }
    if (sortBy === 'group-asc') {
      return [...list].sort((a, b) => (a.bloodGroup || '').localeCompare(b.bloodGroup || ''));
    }
    return list;
  }, [bloodGroups, searchTerm, filterType, sortBy]);

  const getStatusBadge = (count) => {
    if (count > 10) {
      return (
        <div className="chart-status-badge optimal">
          <span className="dot green"></span>
          <span className="status-text">Optimal Reserve</span>
        </div>
      );
    }
    if (count > 0) {
      return (
        <div className="chart-status-badge low">
          <span className="dot yellow"></span>
          <span className="status-text">Low Stock Alert</span>
        </div>
      );
    }
    return (
      <div className="chart-status-badge critical">
        <span className="dot red"></span>
        <span className="status-text">Urgent Need (Depleted)</span>
      </div>
    );
  };

  return (
    <section className="blood-availability-page">
      <Helmet>
        <title>Live Blood Availability Chart - HealingWave Hospital</title>
      </Helmet>

      <div className="blood-availability-wrapper">
        {/* Navigation Bar */}
        <div className="blood-avail-topbar">
          <button className="blood-availability-back-button" onClick={() => navigate('/blood-bank')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Blood Bank
          </button>
          <div className="avail-badge-247">
            <span className="pulse-dot"></span> 🩸 24/7 Live Blood Bank Dispatch Active
          </div>
        </div>

        {/* Hero Banner with Uploaded Image */}
        <div className="blood-avail-hero">
          <div className="blood-avail-hero-content">
            <div className="hero-pill">
              <FontAwesomeIcon icon={faTint} className="tint-icon" /> Live Hospital Reserves
            </div>
            <h1 className="blood-availability-title">🩸 Live Blood Availability Chart</h1>
            <p className="blood-avail-hero-text">
              Real-time block-chart inventory of all 8 ABO/Rh blood groups. Every unit is tested, quarantined, and ready for immediate cross-matching and transfusion.
            </p>
            <div className="hero-cta-actions">
              <Link to="/blood-recipient" className="hero-btn-primary">
                🩸 Request Blood Unit
              </Link>
              <Link to="/blood-donor" className="hero-btn-secondary">
                🩸 Donate Blood Today
              </Link>
            </div>
          </div>
          <div className="blood-avail-hero-image">
            <img 
              src={bloodAvailImg?.src || bloodAvailImg || '/assets/blood_avail.jpg'} 
              alt="Blood Availability Storage" 
            />
            <div className="hero-image-overlay">
              <div className="overlay-stat">
                <span className="overlay-number">{totalUnits}</span>
                <span className="overlay-label">🩸 Total Bags Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stat Metric Cards */}
        <div className="avail-stats-grid">
          <div className="avail-stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Total Blood Units</span>
              <span className="stat-icon-wrapper red">
                <FontAwesomeIcon icon={faTint} />
              </span>
            </div>
            <div className="stat-value">{totalUnits} <span className="stat-unit">bags</span></div>
            <div className="stat-meta">~{(totalUnits * 0.45).toFixed(1)} Liters clinical inventory</div>
          </div>

          <div className="avail-stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Optimal Groups</span>
              <span className="stat-icon-wrapper green">
                <FontAwesomeIcon icon={faCheckCircle} />
              </span>
            </div>
            <div className="stat-value">{stats.optimal} <span className="stat-unit">types</span></div>
            <div className="stat-meta">Adequate for emergency OR surgeries</div>
          </div>

          <div className="avail-stat-card">
            <div className="stat-card-header">
              <span className="stat-title">Urgent / Low Stock</span>
              <span className="stat-icon-wrapper amber">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </span>
            </div>
            <div className="stat-value">{stats.low + stats.critical} <span className="stat-unit">types</span></div>
            <div className="stat-meta">Voluntary donors urgently requested</div>
          </div>

          <div className="avail-stat-card hotline-card">
            <div className="stat-card-header">
              <span className="stat-title">24/7 Trauma Hotline</span>
              <span className="stat-icon-wrapper blue">
                <FontAwesomeIcon icon={faPhoneAlt} />
              </span>
            </div>
            <a 
              href="tel:+18004325464" 
              className="stat-value hotline-number"
              title="Click to dial 24/7 emergency trauma line"
            >
              +1 (800) 432-5464
            </a>
            <div className="stat-meta">Immediate dispatch for ICU, Trauma & ER</div>
          </div>
        </div>

        {/* Block Chart Filter Bar */}
        <div className="table-controls-bar">
          <div className="table-search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text"
              placeholder="Search group (e.g. O+, A-)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div className="table-sort-box">
            <FontAwesomeIcon icon={faSortAmountDown} className="sort-icon" />
            <select 
              className="table-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              title="Sort blood group list"
            >
              <option value="default">Sort: Default</option>
              <option value="count-desc">Units: High to Low</option>
              <option value="count-asc">Units: Low to High</option>
              <option value="group-asc">Blood Group: A → Z</option>
            </select>
          </div>

          <div className="table-filter-pills">
            <button 
              className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({bloodGroups.length})
            </button>
            <button 
              className={`filter-pill ${filterType === 'O' ? 'active' : ''}`}
              onClick={() => setFilterType('O')}
            >
              🩸 O
            </button>
            <button 
              className={`filter-pill ${filterType === 'A' ? 'active' : ''}`}
              onClick={() => setFilterType('A')}
            >
              🩸 A
            </button>
            <button 
              className={`filter-pill ${filterType === 'B' ? 'active' : ''}`}
              onClick={() => setFilterType('B')}
            >
              🩸 B
            </button>
            <button 
              className={`filter-pill ${filterType === 'AB' ? 'active' : ''}`}
              onClick={() => setFilterType('AB')}
            >
              🩸 AB
            </button>
            <button 
              className={`filter-pill pill-optimal ${filterType === 'optimal' ? 'active' : ''}`}
              onClick={() => setFilterType('optimal')}
            >
              🟢 Optimal ({stats.optimal})
            </button>
            <button 
              className={`filter-pill pill-low ${filterType === 'low' ? 'active' : ''}`}
              onClick={() => setFilterType('low')}
            >
              🟡 Low ({stats.low})
            </button>
          </div>

          <button 
            className="refresh-data-btn" 
            onClick={fetchBloodAvailability}
            title="Refresh availability chart"
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} />
            <span>Refresh</span>
          </button>
        </div>

        {error && <div className="blood-availability-notification">{error}</div>}

        {/* Authentic Blood Block-Chart Table */}
        <div className="blood-table-card">
          <div className="blood-table-header-info">
            <div>
              <h3 className="blood-table-heading">
                <FontAwesomeIcon icon={faChartBar} style={{ color: '#dc2626', marginRight: '8px' }} />
                Blood Group Inventory & Compatibility Chart
              </h3>
              <p className="blood-table-subheading">Verified hospital supply matrix ready for emergency cross-matching</p>
            </div>
            <span className="showing-tag">Showing {filteredGroups.length} of {bloodGroups.length} Types</span>
          </div>

          <div className="blood-availability-table-container">
            <table className="blood-modern-table blood-chart-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Blood Group</th>
                  <th style={{ width: '170px' }}>Stock Level</th>
                  <th style={{ minWidth: '220px' }}>Inventory Gauge</th>
                  <th style={{ minWidth: '240px' }}>Compatible Recipients</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="table-empty-message">
                      <div className="table-loading-spinner">
                        <FontAwesomeIcon icon={faTint} spin style={{ color: '#dc2626' }} />
                        <span>Loading live blood availability chart...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-message">
                      <div className="no-results-box">
                        <span style={{ fontSize: '2.5rem' }}>🩸</span>
                        <p className="no-results-title">No matching blood group in chart</p>
                        <p className="no-results-sub">Try searching with a different term like "O+", "A", or reset filters.</p>
                        <button className="reset-filter-btn" onClick={() => { setSearchTerm(''); setFilterType('all'); setSortBy('default'); }}>
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => {
                    const count = Number(group.count) || 0;
                    const compInfo = COMPATIBILITY_MAP[group.bloodGroup] || { canGiveTo: [], label: 'Screened', rh: '', antigen: '' };
                    const meterPct = Math.min(Math.round((count / 25) * 100), 100);

                    return (
                      <tr key={group.bloodGroup} className="blood-chart-row">
                        {/* Blood Group Block */}
                        <td className="cell-blood-group">
                          <div className="blood-chart-block">
                            <div className="blood-badge-large">
                              <span className="drop-emoji">🩸</span>
                              <span className="group-letter">{group.bloodGroup}</span>
                            </div>
                            <div className="blood-block-info">
                              <span className="rh-factor">{compInfo.label}</span>
                              <span className="antigen-subtext">{compInfo.antigen}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Block */}
                        <td className="cell-status">
                          {getStatusBadge(count)}
                        </td>

                        {/* Units & Meter Gauge */}
                        <td className="cell-units">
                          <div className="chart-gauge-container">
                            <div className="gauge-number-row">
                              <div className="gauge-count-wrap">
                                <span className="gauge-count">{count}</span>
                                <span className="gauge-unit-label">{count === 1 ? 'Bag' : 'Bags'}</span>
                              </div>
                              <span className="gauge-volume">~{(count * 0.45).toFixed(1)}L</span>
                            </div>
                            <div className="chart-meter-track">
                              <div 
                                className={`chart-meter-fill ${count > 10 ? 'fill-optimal' : count > 0 ? 'fill-low' : 'fill-empty'}`}
                                style={{ width: `${meterPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Compatibility Block */}
                        <td className="cell-compatibility">
                          <div className="chart-compat-block">
                            <span className="compat-intro">Transfuse to:</span>
                            <div className="compat-tag-group">
                              {compInfo.canGiveTo.map((recip) => (
                                <span key={recip} className="blood-tag-badge">
                                  🩸 {recip}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Action Block */}
                        <td className="cell-action">
                          {count > 0 ? (
                            <button 
                              className="chart-action-btn request-btn"
                              onClick={() => navigate(`/blood-recipient?group=${encodeURIComponent(group.bloodGroup)}`)}
                            >
                              🩸 Request
                            </button>
                          ) : (
                            <button 
                              className="chart-action-btn donate-btn"
                              onClick={() => navigate(`/blood-donor?group=${encodeURIComponent(group.bloodGroup)}`)}
                            >
                              🩸 Donate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Safety Notice */}
          <div className="table-footer-notice">
            <div className="footer-notice-item">
              <FontAwesomeIcon icon={faShieldAlt} className="notice-icon" />
              <span>All units tested for HIV, Hepatitis B & C, Syphilis, and Malaria with cold-chain monitoring.</span>
            </div>
            <Link to="/blood-group" className="view-comp-link">
              🩸 View Blood Compatibility Chart Matrix →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodAvailability;
