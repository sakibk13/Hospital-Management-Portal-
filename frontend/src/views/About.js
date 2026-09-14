import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/About.css';
import { Helmet } from 'react-helmet';
import Footer from '../features/shared/components/layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faEye,
  faShieldHeart,
  faHeart,
  faAward,
  faUsers,
  faLightbulb,
  faHeartbeat,
  faUserMd,
  faProcedures,
  faXRay,
  faVial,
  faPills,
  faTint,
  faAmbulance,
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faClock,
  faCheckCircle,
  faHospital,
  faArrowRight,
  faHandHoldingHeart
} from '@fortawesome/free-solid-svg-icons';

import hospital1 from '../assets/hospital1.png';
import hospital2 from '../assets/hospital2.png';

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <Helmet>
        <title>About Us — HealingWave Hospital &amp; Medical Research Institute</title>
      </Helmet>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <FontAwesomeIcon icon={faShieldHeart} /> JCI Accredited • Est. 1999 • 25+ Years of Clinical Trust
          </div>
          <h1 className="about-hero-title">Advancing Healthcare, Touching Lives</h1>
          <p className="about-hero-subtitle">
            HealingWave Hospital &amp; Medical Research Institute is a premier multi-specialty healthcare institution
            dedicated to clinical excellence, patient safety, and compassionate care through cutting-edge medical technology.
          </p>
          <div className="about-hero-actions">
            <button className="about-btn-primary" onClick={() => navigate('/doctors')}>
              <FontAwesomeIcon icon={faUserMd} /> Find a Specialist
            </button>
            <button className="about-btn-secondary" onClick={() => navigate('/support')}>
              <FontAwesomeIcon icon={faPhoneAlt} /> Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Legacy & Overview Story Section */}
      <section className="about-story-section">
        <div className="about-story-container">
          <div className="story-media-col">
            <div className="story-image-wrap">
              <img src={hospital2?.src || hospital2} alt="HealingWave Medical Facility" className="story-image" />
              <div className="story-badge-floating">
                <span className="floating-number">25+</span>
                <span className="floating-text">Years of Medical Excellence</span>
              </div>
            </div>
          </div>

          <div className="story-content-col">
            <span className="section-pill">
              <FontAwesomeIcon icon={faHospital} /> Our Heritage
            </span>
            <h2 className="story-title">A Quarter-Century of Healing With Compassion</h2>
            <p className="story-lead">
              Founded in 1999 with a vision to provide international-standard quaternary medical care,
              HealingWave has grown from a specialized clinic into one of the country's most respected medical hubs.
            </p>
            <p className="story-text">
              Our 1,000-bed tertiary facility integrates board-certified medical specialists, state-of-the-art
              diagnostic imaging, modular infection-free surgical suites, and dedicated intensive care units to deliver
              personalized, evidence-based treatments.
            </p>

            <div className="story-features-list">
              <div className="story-feat-item">
                <div className="feat-icon-box">
                  <FontAwesomeIcon icon={faAward} />
                </div>
                <div>
                  <h4>International Standards</h4>
                  <p>Accredited by Joint Commission International (JCI) for zero-compromise patient safety protocols.</p>
                </div>
              </div>

              <div className="story-feat-item">
                <div className="feat-icon-box">
                  <FontAwesomeIcon icon={faHeartbeat} />
                </div>
                <div>
                  <h4>Patient-Centered Compassion</h4>
                  <p>Holistic healthcare delivery tailored to the physical, emotional, and social needs of each individual.</p>
                </div>
              </div>

              <div className="story-feat-item">
                <div className="feat-icon-box">
                  <FontAwesomeIcon icon={faAmbulance} />
                </div>
                <div>
                  <h4>24/7 Level-1 Emergency</h4>
                  <p>Immediate rapid-triage trauma care, cardiac life-support ambulances, and on-call specialist surgeons.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Pledge */}
      <section className="mission-vision-section">
        <div className="section-head text-center">
          <span className="section-pill">
            <FontAwesomeIcon icon={faBullseye} /> Purpose &amp; Direction
          </span>
          <h2 className="section-title">Our Guiding Principles</h2>
          <p className="section-subtitle">
            Defined by our unwavering commitment to human life, scientific rigor, and community well-being.
          </p>
        </div>

        <div className="mission-vision-container">
          <div className="mv-card mission-card">
            <div className="mv-icon-wrap">
              <FontAwesomeIcon icon={faBullseye} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To provide accessible, high-quality, compassionate medical care to all segments of society,
              fostering scientific clinical research, and training the next generation of healthcare leaders.
            </p>
            <div className="mv-badge">Affordable Excellence</div>
          </div>

          <div className="mv-card vision-card">
            <div className="mv-icon-wrap">
              <FontAwesomeIcon icon={faEye} />
            </div>
            <h3>Our Vision</h3>
            <p>
              To be internationally recognized as a center of medical excellence, pioneering medical advancements,
              robotic surgery, and delivering life-changing clinical outcomes with highest ethical integrity.
            </p>
            <div className="mv-badge">Global Recognition</div>
          </div>

          <div className="mv-card pledge-card">
            <div className="mv-icon-wrap">
              <FontAwesomeIcon icon={faShieldHeart} />
            </div>
            <h3>Our Clinical Pledge</h3>
            <p>
              We pledge uncompromising patient confidentiality, absolute transparency in clinical decision-making,
              and treating every patient with warmth, empathy, and dignity.
            </p>
            <div className="mv-badge">Zero Compromise</div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="values-section">
        <div className="section-head text-center">
          <span className="section-pill">
            <FontAwesomeIcon icon={faHandHoldingHeart} /> Foundational Values
          </span>
          <h2 className="section-title">The Pillars That Guide Our Care</h2>
          <p className="section-subtitle">
            Every clinical decision, patient interaction, and technological investment is driven by these core ethics.
          </p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon-box bg-rose">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <h3>Empathy &amp; Compassion</h3>
            <p>We listen with warmth, act with kindness, and treat every patient like our own family member.</p>
          </div>

          <div className="value-card">
            <div className="value-icon-box bg-teal">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <h3>Clinical Excellence</h3>
            <p>We adhere to strict international evidence-based treatment regimens and zero-error medical safety.</p>
          </div>

          <div className="value-card">
            <div className="value-icon-box bg-blue">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h3>Multi-Disciplinary Teamwork</h3>
            <p>Specialists, nurses, and allied technicians collaborate cohesively to devise optimal treatment plans.</p>
          </div>

          <div className="value-card">
            <div className="value-icon-box bg-amber">
              <FontAwesomeIcon icon={faLightbulb} />
            </div>
            <h3>Innovation &amp; Technology</h3>
            <p>Pioneering minimally invasive surgeries, artificial intelligence diagnostics, and electronic health systems.</p>
          </div>
        </div>
      </section>

      {/* Clinical Services & Facilities Showcase */}
      <section className="about-facilities-section">
        <div className="section-head text-center">
          <span className="section-pill">
            <FontAwesomeIcon icon={faHospital} /> Clinical Infrastructure
          </span>
          <h2 className="section-title">Comprehensive Medical Facilities</h2>
          <p className="section-subtitle">
            Equipped with modern healthcare technologies to ensure prompt, accurate, and comfortable treatment.
          </p>
        </div>

        <div className="facilities-grid">
          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faAmbulance} />
            </div>
            <h4>24/7 Emergency &amp; Trauma</h4>
            <p>Immediate Level-1 trauma resuscitation with dedicated mobile ICU ambulances on standby.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <h4>500+ Specialized Consultants</h4>
            <p>Board-certified specialists across Cardiology, Neurology, Oncology, Orthopaedics, and more.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faProcedures} />
            </div>
            <h4>Modular Clean-Room OTs</h4>
            <p>Laminar airflow surgical suites with HEPA air filtration and robotic surgical consoles.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faXRay} />
            </div>
            <h4>3T MRI &amp; 128-Slice CT</h4>
            <p>Next-generation diagnostic radiology providing crystal-clear imaging in minutes.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faVial} />
            </div>
            <h4>Automated Clinical Labs</h4>
            <p>Barcoded, high-throughput pathology laboratory ensuring precision diagnostic results.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faTint} />
            </div>
            <h4>Safe Certified Blood Bank</h4>
            <p>24/7 apheresis, whole blood, and component separation with stringent viral screening.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faPills} />
            </div>
            <h4>In-House Digital Pharmacy</h4>
            <p>100% genuine temperature-controlled medication with integrated electronic prescription dispensing.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={faHeartbeat} />
            </div>
            <h4>Intensive Care Units (ICU/CCU)</h4>
            <p>1:1 nursing care, advanced hemodynamic monitoring, invasive ventilators, and bedside dialysis.</p>
          </div>
        </div>
      </section>

      {/* Hospital Impact Numbers */}
      <section className="about-stats-section">
        <div className="about-stats-container">
          <div className="about-stat-item">
            <h3 className="about-stat-number">25+</h3>
            <p className="about-stat-label">Years of Service</p>
          </div>
          <div className="about-stat-item">
            <h3 className="about-stat-number">500+</h3>
            <p className="about-stat-label">Medical Specialists</p>
          </div>
          <div className="about-stat-item">
            <h3 className="about-stat-number">50,000+</h3>
            <p className="about-stat-label">Patients Healed Yearly</p>
          </div>
          <div className="about-stat-item">
            <h3 className="about-stat-number">99.4%</h3>
            <p className="about-stat-label">Satisfaction Rating</p>
          </div>
        </div>
      </section>

      {/* Hospital Campus & Contact Section */}
      <section className="about-contact-section">
        <div className="section-head text-center">
          <span className="section-pill">
            <FontAwesomeIcon icon={faMapMarkerAlt} /> Hospital Campus
          </span>
          <h2 className="section-title">Visit HealingWave Health System</h2>
          <p className="section-subtitle">
            Our central campus is designed for patient ease, featuring dedicated emergency drop-offs and parking.
          </p>
        </div>

        <div className="contact-cards-container">
          <div className="contact-info-card">
            <div className="contact-icon-bubble">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <h3>Campus Location</h3>
            <p>
              123 Healthcare Boulevard, Central Medical City<br />
              Dhaka 1212, Bangladesh
            </p>
            <span className="contact-meta">Valet Parking &amp; Emergency Gate 1</span>
          </div>

          <div className="contact-info-card highlighted-contact">
            <div className="contact-icon-bubble">
              <FontAwesomeIcon icon={faPhoneAlt} />
            </div>
            <h3>Emergency &amp; Appointments</h3>
            <p>
              <strong>Hotline 24/7:</strong> 10666<br />
              <strong>Appointments:</strong> +880 1800-432-592
            </p>
            <span className="contact-meta">Immediate Call Dispatch Available</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-bubble">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h3>Inquiries &amp; Support</h3>
            <p>
              info@healingwave.com<br />
              patientcare@healingwave.com
            </p>
            <span className="contact-meta">Response within 2 hours</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
