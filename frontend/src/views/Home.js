import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Home.css';

import api from '../core/api/config';
import { storage } from '../utils/storage';
import { useAuthModal } from '../features/auth/AuthModalContext';
import Chatbot from '../features/shared/components/utils/Chatbot';
import NewsTicker from '../features/shared/components/utils/NewsTicker';
import { Helmet } from 'react-helmet';
import Footer from '../features/shared/components/layout/Footer';
import DoctorCard from '../features/shared/components/DoctorCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faHeartbeat,
  faAmbulance,
  faProcedures,
  faHospital,
  faStethoscope,
  faBrain,
  faBone,
  faBaby,
  faMicroscope,
  faTint,
  faCapsules,
  faCalendarCheck,
  faShieldHeart,
  faStar,
  faPhoneAlt,
  faCheckCircle,
  faRobot,
  faChevronLeft,
  faChevronRight,
  faArrowRight,
  faClock,
  faAward,
  faSmile
} from '@fortawesome/free-solid-svg-icons';

import hospital1 from '../assets/hospital1.png';
import hospital2 from '../assets/hospital2.png';
import hospital3 from '../assets/hospital3.png';
import hospital4 from '../assets/hospital4.png';

const Home = () => {
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const [showChatbox, setShowChatbox] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');

  const slides = [
    {
      image: hospital1,
      badge: 'Joint Commission International (JCI) Accredited',
      title: 'Advanced Healthcare With Compassionate Touch',
      subtitle: 'Internationally recognized medical institute providing world-class patient care, robotic surgery, and round-the-clock emergency assistance.'
    },
    {
      image: hospital2,
      badge: '500+ Board Certified Specialists',
      title: 'Personalized Consultations & Preventive Wellness',
      subtitle: 'Expert consultants and dedicated healthcare teams utilizing advanced diagnostics to tailor treatment plans for you and your family.'
    },
    {
      image: hospital3,
      badge: 'State-Of-The-Art Medical Infrastructure',
      title: 'Next-Generation Diagnostics & Modern Surgical Suites',
      subtitle: 'Equipped with 3T MRI, 128-Slice CT, modular infection-controlled operation theatres, and cutting-edge clinical laboratories.'
    },
    {
      image: hospital4,
      badge: '24/7 Level-1 Trauma & Emergency Response',
      title: 'Immediate Critical Care When Every Second Counts',
      subtitle: 'Dedicated trauma triage, advanced cardiac life support ambulances, and 24/7 on-call emergency physicians.'
    }
  ];

  const quickServices = [
    {
      icon: faUserMd,
      title: 'Find a Specialist',
      desc: 'Browse 500+ board-certified consultants across all departments.',
      action: () => navigate('/doctors'),
      cta: 'Explore Doctors'
    },
    {
      icon: faCalendarCheck,
      title: 'Book Appointment',
      desc: 'Quick online scheduling with immediate confirmation and reminders.',
      action: () => navigate('/doctors'),
      cta: 'Schedule Now'
    },
    {
      icon: faAmbulance,
      title: '24/7 Emergency Care',
      desc: 'Rapid response ambulance fleet and Level-1 trauma center.',
      action: () => {
        window.location.href = 'tel:10666';
      },
      cta: 'Call 10666',
      highlight: true
    },
    {
      icon: faTint,
      title: 'Blood Bank Inventory',
      desc: 'Check live donor requests and emergency blood unit availability.',
      action: () => navigate('/blood-availability'),
      cta: 'Check Stock'
    },
    {
      icon: faCapsules,
      title: 'Online Pharmacy',
      desc: '100% genuine prescribed medicines with doorstep delivery.',
      action: () => navigate('/pharmacy'),
      cta: 'Order Medicines'
    }
  ];

  const departments = [
    {
      icon: faHeartbeat,
      name: 'Cardiology & Heart',
      desc: 'Advanced cardiac cath lab, angioplasty, heart failure management, and preventive cardiology.'
    },
    {
      icon: faBrain,
      name: 'Neurology & Spine',
      desc: 'Comprehensive brain stroke care, neurosurgery, epilepsy management, and spinal reconstruction.'
    },
    {
      icon: faBone,
      name: 'Orthopaedics & Joints',
      desc: 'Robotic knee/hip replacements, sports injury rehabilitation, and complex fracture trauma.'
    },
    {
      icon: faAmbulance,
      name: 'Emergency & Critical',
      desc: '24/7 Level-1 trauma resuscitation, high-dependency ICU/CCU, and acute surgical intervention.'
    },
    {
      icon: faBaby,
      name: 'Paediatrics & Child Health',
      desc: 'Specialized neonatal intensive care (NICU), pediatric surgery, and child immunization clinics.'
    },
    {
      icon: faStethoscope,
      name: 'General Medicine',
      desc: 'Holistic chronic disease management, diabetes treatment, fever clinics, and diagnostic assessments.'
    },
    {
      icon: faProcedures,
      name: 'Surgical Care',
      desc: 'Minimally invasive laparoscopic procedures, laser surgery, and modern day-care operations.'
    },
    {
      icon: faMicroscope,
      name: 'Diagnostic Pathology',
      desc: 'Fully automated high-precision clinical pathology, molecular diagnostics, and imaging.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      dept: 'Cardiology Patient',
      stars: 5,
      text: 'The cardiology team at HealingWave saved my life during an acute cardiac event. Their rapid response and state-of-the-art care were extraordinary. Highly professional doctors and caring nurses!'
    },
    {
      name: 'Michael Rahim',
      dept: 'Orthopaedic Surgery',
      stars: 5,
      text: 'I underwent a robotic knee replacement here. The entire process from online appointment booking to discharge and physical therapy was seamless, clean, and completely transparent.'
    },
    {
      name: 'Ananya Roy',
      dept: 'Paediatric Care',
      stars: 5,
      text: 'HealingWave provided top-notch care for my newborn in their NICU. The doctors kept us informed at every single milestone with utmost empathy. Thank you for your miraculous work!'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    api.get('/doctors/all')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setFeaturedDoctors(list.slice(0, 8));
      })
      .catch((err) => console.error('Error loading featured doctors:', err));
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  // Mobile Touch Swipe Gesture Support
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleBook = (doctor) => {
    const target = `/patient/appointment?doctor=${doctor._id || doctor.id}`;
    if (storage.getItem('patientToken')) {
      navigate(target);
    } else {
      openAuth({ role: 'patient', mode: 'login', redirect: target });
    }
  };

  const toggleChatbox = () => setShowChatbox(!showChatbox);

  const filteredDoctors = selectedDept === 'All'
    ? featuredDoctors
    : featuredDoctors.filter((d) => d.department?.toLowerCase() === selectedDept.toLowerCase());

  return (
    <div className="home-page">
      <Helmet>
        <title>HealingWave Health System — Hospital &amp; Medical Research Institute</title>
      </Helmet>

      {/* Emergency Blood Request Live Ticker */}
      <NewsTicker />

      {/* Hero Section with Clinical Slider */}
      <section className="hero-section">
        <div
          className="carousel-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div key={index} className="carousel-slide">
                <img
                  src={slide.image?.src || slide.image}
                  alt={slide.title}
                  className="carousel-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'low'}
                />
                <div className="carousel-overlay">
                  <div className="carousel-content">
                    <div className="hero-badge">
                      <FontAwesomeIcon icon={faShieldHeart} className="hero-badge-icon" />
                      <span>{slide.badge}</span>
                    </div>
                    <h1 className="carousel-title">{slide.title}</h1>
                    <p className="carousel-subtitle">{slide.subtitle}</p>
                    <div className="hero-actions">
                      <button className="hero-btn-primary" onClick={() => navigate('/doctors')}>
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        <span>Book an Appointment</span>
                      </button>
                      <button className="hero-btn-secondary" onClick={() => { window.location.href = 'tel:10666'; }}>
                        <FontAwesomeIcon icon={faPhoneAlt} />
                        <span>Emergency: 10666</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide} aria-label="Previous Slide">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide} aria-label="Next Slide">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>

          <div className="carousel-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Floating Quick-Access Hospital Bar */}
      <section className="quick-access-section">
        <div className="quick-access-container">
          {quickServices.map((service, idx) => (
            <div
              key={idx}
              className={`quick-card ${service.highlight ? 'emergency-card' : ''}`}
              onClick={service.action}
            >
              <div className="quick-icon-wrap">
                <FontAwesomeIcon icon={service.icon} />
              </div>
              <h3 className="quick-card-title">{service.title}</h3>
              <p className="quick-card-desc">{service.desc}</p>
              <span className="quick-card-cta">
                {service.cta} <FontAwesomeIcon icon={faArrowRight} className="cta-arrow" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Departments & Centers of Excellence */}
      <section className="departments-section">
        <div className="section-head">
          <span className="section-badge">
            <FontAwesomeIcon icon={faHospital} /> Clinical Excellence
          </span>
          <h2 className="section-title">Specialized Medical Departments</h2>
          <p className="section-subtitle">
            Providing comprehensive care across multi-disciplinary institutes with cutting-edge medical technologies.
          </p>
        </div>

        <div className="departments-grid">
          {departments.map((dept, index) => (
            <div key={index} className="dept-card" onClick={() => navigate('/doctors')}>
              <div className="dept-icon-box">
                <FontAwesomeIcon icon={dept.icon} />
              </div>
              <h3 className="dept-title">{dept.name}</h3>
              <p className="dept-desc">{dept.desc}</p>
              <span className="dept-link">
                View Specialists <FontAwesomeIcon icon={faChevronRight} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 24/7 Rapid Emergency Banner */}
      <section className="emergency-banner-section">
        <div className="emergency-banner-card">
          <div className="emergency-banner-left">
            <div className="emergency-beacon">
              <span className="beacon-ring"></span>
              <FontAwesomeIcon icon={faAmbulance} className="beacon-icon" />
            </div>
            <div>
              <span className="emergency-badge">Immediate Medical Response</span>
              <h2 className="emergency-banner-title">In Case of Medical Emergency</h2>
              <p className="emergency-banner-desc">
                Our Level-1 Trauma Center and emergency resuscitation units operate 24 hours a day, 7 days a week.
                On-call trauma surgeons, cardiac specialists, and mobile ICU ambulances are always on standby.
              </p>
            </div>
          </div>
          <div className="emergency-banner-right">
            <a href="tel:10666" className="emergency-call-btn">
              <FontAwesomeIcon icon={faPhoneAlt} /> Call Hotline 10666
            </a>
            <span className="emergency-call-sub">Toll-Free Hospital Dispatch</span>
          </div>
        </div>
      </section>

      {/* Featured Medical Specialists */}
      {featuredDoctors.length > 0 && (
        <section className="featured-doctors-section">
          <div className="section-head">
            <span className="section-badge">
              <FontAwesomeIcon icon={faUserMd} /> Medical Team
            </span>
            <h2 className="section-title">Meet Our Leading Specialists</h2>
            <p className="section-subtitle">
              Internationally trained, board-certified physicians dedicated to high-precision diagnosis and treatment.
            </p>
          </div>

          <div className="dept-filter-pills">
            {['All', 'Cardiology', 'Neurology', 'Orthopaedics', 'Emergency', 'Paediatrics', 'General Medicine'].map((d) => (
              <button
                key={d}
                className={`filter-pill ${selectedDept === d ? 'active' : ''}`}
                onClick={() => setSelectedDept(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="doctors-grid">
            {filteredDoctors.slice(0, 4).map((doctor) => (
              <DoctorCard key={doctor._id || doctor.id} doctor={doctor} onBook={handleBook} />
            ))}
          </div>

          <div className="featured-doctors-cta">
            <button className="btn-view-all-doctors" onClick={() => navigate('/doctors')}>
              Browse All Doctors &amp; Consultations <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </section>
      )}

      {/* Hospital Clinical Statistics */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-icon-wrap">
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Certified Specialists</p>
            <span className="stat-desc">Across 40+ clinical disciplines</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap">
              <FontAwesomeIcon icon={faSmile} />
            </div>
            <h3 className="stat-number">50,000+</h3>
            <p className="stat-label">Happy Patients Treated</p>
            <span className="stat-desc">With 99.4% satisfaction score</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <h3 className="stat-number">25+</h3>
            <p className="stat-label">Years of Excellence</p>
            <span className="stat-desc">Delivering compassionate care</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <h3 className="stat-number">100+</h3>
            <p className="stat-label">International Awards</p>
            <span className="stat-desc">For clinical research &amp; safety</span>
          </div>
        </div>
      </section>

      {/* Why Choose HealingWave Hospital */}
      <section className="why-choose-section">
        <div className="section-head">
          <span className="section-badge">
            <FontAwesomeIcon icon={faCheckCircle} /> Trust &amp; Quality
          </span>
          <h2 className="section-title">Why Patients Choose HealingWave</h2>
          <p className="section-subtitle">
            Setting benchmark standards in international healthcare with uncompromised clinical excellence.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon-box">
              <FontAwesomeIcon icon={faMicroscope} />
            </div>
            <h3>Advanced Diagnostic Technology</h3>
            <p>
              High-resolution 3T MRI, 128-slice CT scans, 4D ultrasound, and automated robotic pathology ensuring rapid and accurate diagnosis.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-box">
              <FontAwesomeIcon icon={faShieldHeart} />
            </div>
            <h3>Infection-Controlled Modular OTs</h3>
            <p>
              Laminar airflow surgical suites with HEPA filtration and robotic-assisted surgical equipment preventing surgical site infections.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-box">
              <FontAwesomeIcon icon={faHeartbeat} />
            </div>
            <h3>24/7 Dedicated Critical Care (ICU)</h3>
            <p>
              Round-the-clock intensive care units staffed by senior intensivists, invasive hemodynamic monitoring, and bedside dialysis.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-box">
              <FontAwesomeIcon icon={faProcedures} />
            </div>
            <h3>Integrated Digital Patient Records</h3>
            <p>
              Instant digital access to lab reports, physician prescriptions, blood requests, and appointment history via the patient portal.
            </p>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="testimonials-section">
        <div className="section-head">
          <span className="section-badge">
            <FontAwesomeIcon icon={faStar} /> Patient Experiences
          </span>
          <h2 className="section-title">Stories of Healing &amp; Hope</h2>
          <p className="section-subtitle">
            Hear directly from the patients and families who entrusted their health to HealingWave.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(t.stars)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name.charAt(0)}</div>
                <div>
                  <h4 className="author-name">{t.name}</h4>
                  <span className="author-dept">{t.dept}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modern Hospital Footer */}
      <Footer />

      {/* Floating AI Health Assistant Button */}
      <div className="chatbot-icon-wrap" onClick={toggleChatbox} title="HealingWave AI Health Assistant">
        <span className="chat-radar"></span>
        <div className="chatbot-icon">
          <FontAwesomeIcon icon={faRobot} />
        </div>
        <span className="chat-tooltip">Need Help? Chat with AI Assistant</span>
      </div>

      {showChatbox && <Chatbot onClose={toggleChatbox} />}
    </div>
  );
};

export default Home;
