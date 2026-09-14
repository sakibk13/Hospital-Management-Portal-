import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import Link from 'next/link';
import '../../../components/styles/AppointmentDetails.css'; 
import { storage } from '../../../utils/storage';
import { 
  FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone, 
  FaCheckCircle, FaExclamationCircle, FaMoneyBillWave, 
  FaPrescription, FaSearch, FaFilter, FaStethoscope 
} from 'react-icons/fa';

const AppointmentDetails = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); 
  const [filterTab, setFilterTab] = useState('all'); // all, today, unpaid, paid
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const doctorEmail = storage.getItem('doctorEmail');
      if (!doctorEmail) {
        throw new Error('Doctor email not found in local storage');
      }
      const res = await axios.get(`/api/appointments/doctor/email/${doctorEmail}`);
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestPayment = async (id) => {
    try {
      setUpdating(id);
      await axios.put(`/api/appointments/request-payment/${id}`);
      setAppointments(prev => prev.map(appointment =>
        appointment._id === id ? { ...appointment, paymentRequest: 'requested' } : appointment
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(app => {
    const appDate = app.date ? new Date(app.date).toISOString().split('T')[0] : '';
    if (filterTab === 'today' && appDate !== todayStr) return false;
    if (filterTab === 'unpaid' && (app.paidStatus?.toLowerCase() === 'paid')) return false;
    if (filterTab === 'paid' && (app.paidStatus?.toLowerCase() !== 'paid')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.patientName?.toLowerCase().includes(q);
      const matchEmail = app.patientEmail?.toLowerCase().includes(q);
      const matchPhone = app.patientPhone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    }
    return true;
  });

  const totalCount = appointments.length;
  const todayCount = appointments.filter(a => a.date && new Date(a.date).toISOString().split('T')[0] === todayStr).length;
  const pendingPaymentCount = appointments.filter(a => a.paidStatus?.toLowerCase() !== 'paid').length;

  return (
    <div className="doc-appointments-page">
      <Helmet>
        <title>Doctor Appointments | Clinical Consultation Schedule</title>
      </Helmet>

      {/* Header Strip */}
      <div className="doc-page-header">
        <div>
          <div className="doc-badge-pill">
            <FaStethoscope /> Clinical Consultation Schedule
          </div>
          <h1>Patient Appointments Directory</h1>
          <p>Review patient consultations, monitor consultation time slots, request billing clearance, and issue clinical prescriptions.</p>
        </div>

        <Link href="/doctor/add-prescription" className="quick-add-rx-btn">
          <FaPrescription /> New Prescription
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="doc-stats-grid">
        <div className="doc-stat-card">
          <span className="stat-label">Total Appointments</span>
          <span className="stat-value">{totalCount}</span>
          <span className="stat-sub">Lifetime bookings</span>
        </div>
        <div className="doc-stat-card">
          <span className="stat-label">Today's Schedule</span>
          <span className="stat-value text-teal">{todayCount}</span>
          <span className="stat-sub">Scheduled consultations</span>
        </div>
        <div className="doc-stat-card">
          <span className="stat-label">Pending Payments</span>
          <span className="stat-value text-amber">{pendingPaymentCount}</span>
          <span className="stat-sub">Awaiting patient payment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="doc-filters-bar">
        <div className="doc-filter-tabs">
          <button 
            className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Appointments ({totalCount})
          </button>
          <button 
            className={`tab-btn ${filterTab === 'today' ? 'active' : ''}`}
            onClick={() => setFilterTab('today')}
          >
            Today ({todayCount})
          </button>
          <button 
            className={`tab-btn ${filterTab === 'unpaid' ? 'active' : ''}`}
            onClick={() => setFilterTab('unpaid')}
          >
            Unpaid / Due ({pendingPaymentCount})
          </button>
          <button 
            className={`tab-btn ${filterTab === 'paid' ? 'active' : ''}`}
            onClick={() => setFilterTab('paid')}
          >
            Paid in Full
          </button>
        </div>

        <div className="doc-search-input-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search patient name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="doc-loading-box">
          <div className="doc-spinner" />
          <p>Loading patient consultation schedules...</p>
        </div>
      )}

      {error && <div className="doc-error-box">Error: {error}</div>}

      {!loading && filteredAppointments.length === 0 && (
        <div className="doc-empty-box">
          <FaCalendarAlt className="empty-calendar-icon" />
          <h3>No Appointments Found</h3>
          <p>There are currently no patient appointments matching your selected filter or query.</p>
        </div>
      )}

      {/* Appointments Data Table */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="doc-table-card">
          <div className="table-responsive">
            <table className="doc-clinical-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient Details</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Billing Action</th>
                  <th>Clinical Care</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app, index) => {
                  const appDate = app.date ? new Date(app.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  }) : 'N/A';
                  const isPaid = app.paidStatus?.toLowerCase() === 'paid';
                  const isUpdating = updating === app._id;

                  return (
                    <tr key={app._id || index}>
                      {/* Date & Time */}
                      <td>
                        <div className="slot-cell">
                          <span className="slot-date"><FaCalendarAlt /> {appDate}</span>
                          <span className="slot-time"><FaClock /> {app.timeSlot || 'Slot Assigned'}</span>
                        </div>
                      </td>

                      {/* Patient Name */}
                      <td>
                        <div className="patient-cell">
                          <div className="patient-mini-avatar">
                            <FaUser />
                          </div>
                          <div>
                            <span className="patient-full-name">{app.patientName || 'Registered Patient'}</span>
                            <span className="patient-type-tag">Outpatient</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="contact-cell">
                          <span className="contact-line"><FaEnvelope /> {app.patientEmail || 'N/A'}</span>
                          <span className="contact-line"><FaPhone /> {app.patientPhone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Clinical Status */}
                      <td>
                        <span className={`status-pill ${app.status?.toLowerCase() === 'confirmed' ? 'confirmed' : 'pending'}`}>
                          {app.status || 'Scheduled'}
                        </span>
                      </td>

                      {/* Paid Status */}
                      <td>
                        <span className={`paid-pill ${isPaid ? 'paid' : 'unpaid'}`}>
                          {isPaid ? <><FaCheckCircle /> Paid</> : <><FaExclamationCircle /> Unpaid</>}
                        </span>
                      </td>

                      {/* Payment Request Action */}
                      <td>
                        {app.paymentRequest === 'request payment' || !app.paymentRequest ? (
                          <button
                            onClick={() => requestPayment(app._id)}
                            disabled={isUpdating}
                            className="btn-request-payment"
                          >
                            <FaMoneyBillWave /> {isUpdating ? 'Sending...' : 'Request Payment'}
                          </button>
                        ) : (
                          <span className="requested-tag">Requested</span>
                        )}
                      </td>

                      {/* Write Prescription Action */}
                      <td>
                        <Link
                          href={`/doctor/add-prescription?patientName=${encodeURIComponent(app.patientName || '')}&patientEmail=${encodeURIComponent(app.patientEmail || '')}&patientPhone=${encodeURIComponent(app.patientPhone || '')}`}
                          className="btn-prescribe-action"
                        >
                          <FaPrescription /> Prescribe
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
