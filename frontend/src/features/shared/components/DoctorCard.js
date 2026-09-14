import React, { useState, useEffect } from 'react';
import '../../../components/styles/Doctors.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faStethoscope, faGraduationCap, faClock, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

// Resolve a usable image URL from the stored profilePicture value.
const resolveImage = (doctor) => {
  const pic = doctor?.profilePicture;
  if (!pic) return null;
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  return pic.startsWith('/') ? pic : `/${pic}`;
};

// Fallback portrait lookup by doctor's full name
const fallbackByName = (doctor) => {
  if (!doctor) return null;
  const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
  if (name.includes('ned') || name.includes('stark')) return '/uploads/doctors/Dr_Ned_Stark.jpg';
  if (name.includes('tyrion') || name.includes('lannister')) return '/uploads/doctors/Dr_Tyrion_Lannister.jpg';
  if (name.includes('arthur') || (name.includes('shelby') && !name.includes('thomas'))) return '/uploads/doctors/Dr_Arthur_Shelby.jpg';
  if (name.includes('thomas')) return '/uploads/doctors/Dr_Thomas_Shelby.jpg';
  if (name.includes('polly') || name.includes('gray')) return '/uploads/doctors/Dr_Polly_Gray.jpg';
  if (name.includes('ragnar') || name.includes('lothbrok')) return '/uploads/doctors/Dr_Ragnar_Lothbrok.jpg';
  if (name.includes('kaleen')) return '/uploads/doctors/Dr_Kaleen_Bhaiya.jpg';
  if (name.includes('srikant') || name.includes('tiwari')) return '/uploads/doctors/Dr_Srikant_Tiwari.jpg';
  return null;
};

const DoctorCard = ({ doctor, onBook }) => {
  const primaryImg = resolveImage(doctor);
  const fallbackImg = fallbackByName(doctor);

  const [currentImg, setCurrentImg] = useState(primaryImg || fallbackImg);
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    const p = resolveImage(doctor);
    const f = fallbackByName(doctor);
    setCurrentImg(p || f);
    setImgError(false);
    setFallbackAttempted(false);
  }, [doctor]);

  const handleImgError = () => {
    if (!fallbackAttempted && fallbackImg && currentImg !== fallbackImg) {
      setFallbackAttempted(true);
      setCurrentImg(fallbackImg);
    } else {
      setImgError(true);
    }
  };

  const fullName = `Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}`;

  return (
    <div className="doctor-card">
      <div className="doctor-card__media">
        {currentImg && !imgError ? (
          <img
            src={currentImg}
            alt={fullName}
            onError={handleImgError}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="doctor-card__placeholder">
            <FontAwesomeIcon icon={faUserMd} />
          </div>
        )}
        {doctor?.department && <span className="doctor-card__dept">{doctor.department}</span>}
      </div>

      <div className="doctor-card__body">
        <h3 className="doctor-card__name">{fullName}</h3>
        {doctor?.specialty && (
          <p className="doctor-card__specialty">
            <FontAwesomeIcon icon={faStethoscope} /> {doctor.specialty}
          </p>
        )}
        {doctor?.degrees && (
          <p className="doctor-card__meta">
            <FontAwesomeIcon icon={faGraduationCap} /> {doctor.degrees}
          </p>
        )}
        {doctor?.availability && (
          <p className="doctor-card__meta">
            <FontAwesomeIcon icon={faClock} /> {doctor.availability}
          </p>
        )}

        <button className="doctor-card__book" onClick={() => onBook(doctor)}>
          <FontAwesomeIcon icon={faCalendarCheck} /> Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
