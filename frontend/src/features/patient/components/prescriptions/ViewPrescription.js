import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { prescriptionPDF } from '../../../../features/shared/components/utils/PDFGenerator';
import { FaTimes, FaSearch, FaUserInjured, FaCalendarAlt, FaFilePdf, FaPlus } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { storage } from '../../../../utils/storage';
import Link from 'next/link';

const ViewPrescription = () => {
  const doctorEmail = storage.getItem('doctorEmail');
  const patientEmail = storage.getItem('patientEmail');
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, [doctorEmail, patientEmail]);

  const fetchPrescriptions = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (doctorEmail) {
        url = `/api/prescriptions/dsearch?doctorEmail=${encodeURIComponent(doctorEmail)}&query=${encodeURIComponent(query)}`;
      } else if (patientEmail) {
        url = `/api/prescriptions/psearch?patientEmail=${encodeURIComponent(patientEmail)}&query=${encodeURIComponent(query)}`;
      } else {
        url = `/api/prescriptions/all`;
      }
      const response = await axios.get(url, {
        headers: { 'Doctor-Email': doctorEmail || '', 'Patient-Email': patientEmail || '' }
      });
      setPrescriptions(response.data || []);
    } catch (err) {
      console.error('Prescription fetch error:', err);
      setError('Unable to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPrescriptions(searchTerm);
    }
  };

  const handleDownload = (prescription) => {
    prescriptionPDF(prescription);
  };

  const handleRemove = (id) => {
    if (window.confirm('Dismiss this prescription card?')) {
      setPrescriptions(prev => prev.filter(p => p._id !== id));
    }
  };

  return (
    <div className="animate-fade-in-up flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8">
      <Helmet>
        <title>Prescriptions Management | Doctor Portal</title>
      </Helmet>
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            Clinical Records
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Prescription Registry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, search and re-download outpatient prescriptions issued to your patients</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search by patient or drug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 border border-slate-200 dark:border-slate-700 transition-all placeholder:text-slate-400"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </div>

          <Link
            href="/doctor/add-prescription"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all whitespace-nowrap active:scale-95"
          >
            <FaPlus className="text-xs" /> New Rx
          </Link>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading clinical prescriptions...</p>
        </div>
      )}

      {error && <p className="text-center text-red-500 py-4 font-medium">{error}</p>}

      {/* Prescription List */}
      {!loading && prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl mb-4">
            ℞
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No Prescriptions Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">You have not issued any prescriptions matching your query. Create a new prescription using the button above.</p>
          <Link
            href="/doctor/add-prescription"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
          >
            Create Prescription
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {prescriptions.map((rx) => {
            const rxDate = rx.date ? new Date(rx.date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            }) : 'Recent';

            return (
              <div 
                key={rx._id || rx.id} 
                className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-base shrink-0">
                        ℞
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-teal-600 transition-colors">
                          {rx.patientName || 'Patient'}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{rx.patientEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                        <FaCalendarAlt className="text-[10px]" /> {rxDate}
                      </span>
                      <button
                        onClick={() => handleRemove(rx._id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Dismiss"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/80 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Medication Summary
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-4 leading-relaxed">
                      {rx.prescriptionText || 'No detailed instructions.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Age: {rx.age || 'N/A'} • {rx.sex || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleDownload(rx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all"
                  >
                    <FaFilePdf /> PDF Rx
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewPrescription;
