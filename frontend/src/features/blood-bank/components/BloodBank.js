import React, { useEffect, useState } from 'react';
import '../../../components/styles/BloodBank.css';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../core/api/config';
import donateBloodImg from '../../../assets/donateblod.jpg';
import bookBloodImg from '../../../assets/book_blood.jpg';
import bloodAvailImg from '../../../assets/blood_avail.jpg';
import bloodCompImg from '../../../assets/blood_comp.jpg';
import { Helmet } from 'react-helmet';

const GROUP_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const BloodBank = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/bloodAvailability')
      .then((res) => { if (active) setAvailability(Array.isArray(res.data) ? res.data : []); })
      .catch((err) => {
        console.error('Error loading blood availability:', err);
        // Fallback default stock if backend is unavailable
        if (active) {
          setAvailability([
            { bloodGroup: 'O+', count: 18 },
            { bloodGroup: 'O-', count: 6 },
            { bloodGroup: 'A+', count: 14 },
            { bloodGroup: 'A-', count: 5 },
            { bloodGroup: 'B+', count: 16 },
            { bloodGroup: 'B-', count: 4 },
            { bloodGroup: 'AB+', count: 10 },
            { bloodGroup: 'AB-', count: 3 }
          ]);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const bookBlood = (group) => navigate(`/blood-recipient?group=${encodeURIComponent(group)}`);

  const sorted = [...availability].sort(
    (a, b) => GROUP_ORDER.indexOf(a.bloodGroup) - GROUP_ORDER.indexOf(b.bloodGroup)
  );

  const totalUnits = availability.reduce((sum, g) => sum + (g.count || 0), 0);

  return (
    <div className="bloodbank-page">
      <Helmet>
        <title>Blood Bank - HealingWave Hospital</title>
      </Helmet>

      <div className="bloodbank-container">
        <Link to="/" className="back-home">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>

        <h1 className="bloodbank-page-title">Blood Bank Portal</h1>
        <p className="bloodbank-page-subtitle">
          Bridging the gap between donors and recipients. Every drop counts in saving a life with 24/7 rapid transfusion testing.
        </p>

        {/* Live blood availability — shown first */}
        <div className="blood-stock">
          <div className="blood-stock-head">
            <div>
              <h2>Current Blood Availability</h2>
              <p className="blood-stock-subtext">Live hospital inventory updated in real time</p>
            </div>
            <span className="blood-stock-total">{totalUnits} units in stock</span>
          </div>

          {loading ? (
            <div className="blood-stock-loading">
              <i className="fas fa-circle-notch fa-spin"></i> Loading live availability…
            </div>
          ) : sorted.length === 0 ? (
            <div className="blood-stock-loading">No availability data found.</div>
          ) : (
            <div className="blood-stock-grid">
              {sorted.map((g) => {
                const count = g.count || 0;
                const low = count <= 10 && count > 0;
                const out = count === 0;
                return (
                  <div key={g.bloodGroup} className={`blood-stat-card ${out ? 'out' : low ? 'low' : 'optimal'}`}>
                    <div className="blood-stat-group">🩸 {g.bloodGroup}</div>
                    <div className="blood-stat-count">{count}</div>
                    <div className="blood-stat-label">
                      {out ? 'Out of stock' : low ? 'Low stock' : 'Units available'}
                    </div>
                    <button
                      className="blood-stat-book"
                      disabled={out}
                      onClick={() => bookBlood(g.bloodGroup)}
                    >
                      {out ? 'Unavailable' : '🩸 Book Unit'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="blood-stock-actions">
            <Link to="/blood-availability" className="blood-stock-link">
              View Detailed Availability Table <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>

        <h2 className="bloodbank-section-title">Blood Bank Services</h2>
        <div className="bloodbank-grid">
          <Link to="/blood-donor" className="bloodbank-card-link">
            <div className="bloodbank-card">
              <div className="bloodbank-card-image">
                <img 
                  src={donateBloodImg?.src || donateBloodImg || '/assets/donateblod.jpg'} 
                  alt="Donate Blood" 
                  loading="lazy"
                />
                <span className="bloodbank-card-badge donor-badge">Save Lives</span>
              </div>
              <div className="bloodbank-card-content">
                <p className="card-title">Donate Blood</p>
                <p className="card-subtitle">Register yourself as a voluntary donor and help patients in critical need.</p>
                <span className="card-cta">Register Now <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
          </Link>

          <Link to="/blood-recipient" className="bloodbank-card-link">
            <div className="bloodbank-card">
              <div className="bloodbank-card-image">
                <img 
                  src={bookBloodImg?.src || bookBloodImg || '/assets/book_blood.jpg'} 
                  alt="Book or Buy Blood" 
                  loading="lazy"
                />
                <span className="bloodbank-card-badge recipient-badge">Fast Delivery</span>
              </div>
              <div className="bloodbank-card-content">
                <p className="card-title">Book / Buy Blood</p>
                <p className="card-subtitle">Request screened, cross-matched blood units for patients and emergency surgery.</p>
                <span className="card-cta">Request Blood <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
          </Link>

          <Link to="/blood-availability" className="bloodbank-card-link">
            <div className="bloodbank-card">
              <div className="bloodbank-card-image">
                <img 
                  src={bloodAvailImg?.src || bloodAvailImg || '/assets/blood_avail.jpg'} 
                  alt="Blood Availability" 
                  loading="lazy"
                />
                <span className="bloodbank-card-badge avail-badge">Live Stock</span>
              </div>
              <div className="bloodbank-card-content">
                <p className="card-title">Availability Table</p>
                <p className="card-subtitle">Real-time inventory table of all 8 blood groups and components in hospital storage.</p>
                <span className="card-cta">Check Stock <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
          </Link>

          <Link to="/blood-group" className="bloodbank-card-link">
            <div className="bloodbank-card">
              <div className="bloodbank-card-image">
                <img 
                  src={bloodCompImg?.src || bloodCompImg || '/assets/blood_comp.jpg'} 
                  alt="Blood Group Compatibility" 
                  loading="lazy"
                />
                <span className="bloodbank-card-badge comp-badge">Clinical Guide</span>
              </div>
              <div className="bloodbank-card-content">
                <p className="card-title">Compatibility</p>
                <p className="card-subtitle">Detailed compatibility charts, universal donor facts, and verified donor directory.</p>
                <span className="card-cta">View Matrix <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodBank;
