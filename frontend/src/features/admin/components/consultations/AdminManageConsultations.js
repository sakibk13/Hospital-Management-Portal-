import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaSearch, FaFilePrescription, FaUserMd, FaUser, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const AdminManageConsultations = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions/all');
            setPrescriptions(res.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrescriptions = prescriptions.filter(p => 
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Consultations" subtitle="Monitor patient prescriptions and clinical notes">
            <Helmet>
                <title>Consultation Records - HealingWave</title>
            </Helmet>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Clinical Consultation Telemetry</h3>
                    <p className="text-xs text-slate-500 font-medium">Logged {prescriptions.length} historical medical consultations and prescription notes</p>
                </div>

                <div className="relative w-full md:w-80 max-w-full min-w-0">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaSearch />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by patient name or attending doctor..." 
                        className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Encounter Date</th>
                            <th>Patient Identity</th>
                            <th>Attending Physician</th>
                            <th>Clinical Findings & Rx Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">Retrieving patient consultation notes...</td></tr>
                        ) : filteredPrescriptions.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">No consultation records match the query.</td></tr>
                        ) : (
                            filteredPrescriptions.map((p, idx) => (
                                <tr key={p._id || p.id || `consult-${idx}`}>
                                    <td>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                            <FaCalendarAlt className="text-slate-400" />
                                            {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center font-bold text-xs">
                                                {p.patientName ? p.patientName[0] : 'P'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{p.patientName}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{p.patientEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-xs">
                                                <FaUserMd />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">Dr. {p.doctorName}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{p.doctorEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="max-w-md text-xs text-slate-700 font-medium italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            "{p.prescriptionText}"
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminManageConsultations;
