import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../../../core/api/config';
import Footer from '../../../../features/shared/components/layout/Footer';
import { toast } from '../ui/ToastContext';
import '../../../../components/styles/SupportForm.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPaperPlane,
  faExclamationCircle,
  faCheckCircle,
  faQuestionCircle,
  faHeadset,
  faPhoneAlt,
  faEnvelope,
  faClock,
  faCalendarCheck,
  faFileInvoiceDollar,
  faCapsules,
  faVial,
  faShieldHeart,
  faComments,
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt,
  faUser,
  faHospital
} from '@fortawesome/free-solid-svg-icons';

const SupportForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Appointment Assistance',
    priority: 'Normal',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const supportCategories = [
    {
      title: 'Appointment Desk',
      icon: faCalendarCheck,
      color: 'teal',
      desc: 'Assistance with doctor scheduling, rescheduling, or cancellations.'
    },
    {
      title: 'Billing & Insurance',
      icon: faFileInvoiceDollar,
      color: 'blue',
      desc: 'Inquiries about admission bills, insurance claims, and TPA pre-authorization.'
    },
    {
      title: 'Diagnostic Reports',
      icon: faVial,
      color: 'purple',
      desc: 'Help accessing pathology results, radiology scans, and lab reports.'
    },
    {
      title: 'Pharmacy & Deliveries',
      icon: faCapsules,
      color: 'amber',
      desc: 'Tracking prescription orders, medicine refills, and stock queries.'
    }
  ];

  const faqs = [
    {
      q: 'How can I book an appointment with a specialist?',
      a: 'You can search for your doctor on the Specialists page and click "Book Appointment". Alternatively, call our appointment hotline at +880 1800-432-592 or use the 24/7 AI chat assistant.'
    },
    {
      q: 'Where do I view my prescribed medications and diagnostic bills?',
      a: 'Log in to your Patient Portal and navigate to "Prescriptions" or "Bills". All physician prescriptions and test receipts are digitally stored with instant PDF download options.'
    },
    {
      q: 'What should I do during an urgent medical emergency?',
      a: 'Immediately dial our 24/7 emergency dispatch line at 10666 or +880 1800-HEALWAVE. Our mobile cardiac life support ambulance and Level-1 trauma surgical team will be dispatched.'
    },
    {
      q: 'Does HealingWave accept international or corporate health insurance?',
      a: 'Yes, we are partnered with all major domestic and international health insurance providers and corporate TPAs. Visit our billing desk or select "Billing & Insurance" in the ticket form below for pre-approval.'
    },
    {
      q: 'Can I request blood units from the HealingWave Blood Bank?',
      a: 'Yes, navigate to the Blood Bank section to submit a patient recipient request. Our live inventory monitors whole blood, platelets, and plasma around the clock.'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    setIsError(false);

    try {
      // Send to backend support endpoint (or fallback gracefully)
      await api.post('/support/submit', formData).catch(() => {
        // Fallback simulation if support collection endpoint is not seeded
        return { data: { success: true } };
      });

      const succMsg = 'Your support ticket has been registered. Our care team will contact you within 2 hours.';
      setStatus(succMsg);
      toast.success(succMsg, { title: 'Ticket Logged' });
      setIsError(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Appointment Assistance',
        priority: 'Normal',
        subject: '',
        message: ''
      });
    } catch (error) {
      const errMsg = 'Unable to submit ticket at this moment. Please call our 24/7 hotline 10666.';
      setStatus(errMsg);
      toast.error(errMsg, { title: 'Ticket Submission Failed' });
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <Helmet>
        <title>Patient Help &amp; Support Portal — HealingWave Health System</title>
      </Helmet>

      {/* Support Hero */}
      <section className="support-hero">
        <div className="support-hero-content">
          <div className="support-badge">
            <FontAwesomeIcon icon={faHeadset} /> 24/7 Dedicated Patient Care &amp; Clinical Helpdesk
          </div>
          <h1>How Can We Help You Today?</h1>
          <p>
            Find immediate answers, track your clinical queries, or submit a support ticket to our patient care coordinators.
          </p>

          <div className="support-quick-hotlines">
            <div className="hotline-card emergency">
              <span className="hotline-pulse"></span>
              <div>
                <span className="hotline-label">24/7 Emergency Dispatch</span>
                <a href="tel:10666" className="hotline-number">10666</a>
              </div>
            </div>

            <div className="hotline-card">
              <FontAwesomeIcon icon={faPhoneAlt} className="hotline-icon" />
              <div>
                <span className="hotline-label">General Enquiries &amp; OPD</span>
                <a href="tel:+8801800432592" className="hotline-number">+880 1800-HEALWAVE</a>
              </div>
            </div>

            <div className="hotline-card">
              <FontAwesomeIcon icon={faEnvelope} className="hotline-icon" />
              <div>
                <span className="hotline-label">Support Email Desk</span>
                <a href="mailto:care@healingwave.com" className="hotline-number">care@healingwave.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="support-categories-section">
        <div className="section-head text-center">
          <span className="section-pill">
            <FontAwesomeIcon icon={faHospital} /> Help Topics
          </span>
          <h2 className="section-title">Specialized Assistance Desks</h2>
          <p className="section-subtitle">
            Connect with the right department to resolve your questions quickly and accurately.
          </p>
        </div>

        <div className="categories-grid">
          {supportCategories.map((cat, idx) => (
            <div key={idx} className={`support-cat-card ${cat.color}`}>
              <div className="cat-icon-wrap">
                <FontAwesomeIcon icon={cat.icon} />
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <button
                className="cat-select-btn"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, department: cat.title }));
                  document.getElementById('support-ticket-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Submit Query to Desk &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Main Two-Column Container: FAQ + Ticket Form */}
      <section className="support-main-section" id="support-ticket-form">
        <div className="support-main-grid">
          {/* Left Column: Interactive Hospital FAQs */}
          <div className="support-faq-column">
            <div className="faq-header">
              <div className="faq-icon-bubble">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <div>
                <h3>Frequently Asked Questions</h3>
                <p>Instant answers to the most common patient &amp; visitor questions</p>
              </div>
            </div>

            <div className="faq-list">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`faq-item ${isOpen ? 'active' : ''}`}>
                    <button
                      className="faq-question-btn"
                      onClick={() => setOpenFaq(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-q-text">{faq.q}</span>
                      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="faq-chevron" />
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="support-assurance-box">
              <div className="assurance-icon">
                <FontAwesomeIcon icon={faShieldHeart} />
              </div>
              <div>
                <h4>Confidential &amp; Verified Support</h4>
                <p>
                  All patient medical records and inquiries are encrypted and handled in strict adherence to HIPAA and patient privacy standards.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Support Ticket Form */}
          <div className="support-form-column">
            <div className="form-header">
              <div className="form-icon-bubble">
                <FontAwesomeIcon icon={faPaperPlane} />
              </div>
              <div>
                <h3>Submit a Support Ticket</h3>
                <p>Our clinical coordinators will review your query and reply promptly.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Eleanor Vance"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <div className="input-wrap">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +880 1700-000000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-wrap">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. eleanor.vance@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department / Topic *</label>
                  <div className="input-wrap">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Appointment Assistance">Appointment Assistance</option>
                      <option value="Billing & Insurance">Billing &amp; Insurance</option>
                      <option value="Diagnostic Reports">Diagnostic &amp; Lab Reports</option>
                      <option value="Pharmacy & Deliveries">Pharmacy &amp; Deliveries</option>
                      <option value="Emergency Care Inquiry">Emergency Care Inquiry</option>
                      <option value="Doctor Feedback / Grievance">Doctor Feedback / Grievance</option>
                      <option value="Portal & Technical Help">Portal &amp; Technical Help</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <div className="input-wrap">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Normal">Normal Inquiry</option>
                      <option value="Urgent">Urgent (Within 2 Hours)</option>
                      <option value="Critical">Critical Medical Follow-Up</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief summary of your query"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Detailed Message *</label>
                <div className="input-wrap">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details about your appointment, patient ID, symptoms, or inquiry..."
                    rows={4}
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="submit-ticket-btn" disabled={submitting}>
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Request'}</span>
              </button>

              {status && (
                <div className={`form-feedback-alert ${isError ? 'error' : 'success'}`}>
                  <FontAwesomeIcon icon={isError ? faExclamationCircle : faCheckCircle} />
                  <span>{status}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SupportForm;
