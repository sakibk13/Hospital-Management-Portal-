import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaFilter, FaFileExport, FaSearch, FaChevronRight, FaCalendarCheck } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const AdminManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
          case 'completed': return 'admin-badge admin-badge-success';
          case 'pending': return 'admin-badge admin-badge-warning';
          case 'cancelled': return 'admin-badge admin-badge-critical';
          default: return 'admin-badge admin-badge-info';
        }
    };

    const getPaidStatusColor = (status) => {
        return status?.toLowerCase() === 'paid' 
            ? 'admin-badge admin-badge-success' 
            : 'admin-badge admin-badge-warning';
    };

    const filteredAppointments = appointments.filter(a => 
        a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Consultation Registry" subtitle="Monitor and manage all outpatient and clinical appointments">
            <Helmet>
                <title>Consultation Registry - HealingWave</title>
            </Helmet>

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Consultation Registry</h1>
                    <p className="text-sm text-slate-600 mt-0.5">Total {appointments.length} appointments and visits recorded</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="admin-badge admin-badge-success py-2 px-3 text-xs">
                        <FaCalendarCheck />
                        Live Registry Active
                    </div>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 flex-wrap">
                    <div className="relative max-w-sm w-full min-w-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaSearch />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search patient, physician or ward..." 
                            className="admin-input w-full pl-10 pr-4 py-2 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="admin-btn-secondary text-xs">
                            <FaFilter className="text-slate-400 text-xs" />
                            Filter
                        </button>
                        <button className="admin-btn-secondary text-xs">
                            <FaFileExport className="text-slate-400 text-xs" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Patient Details</th>
                                <th>Attending Physician</th>
                                <th>Department</th>
                                <th>Schedule & Slot</th>
                                <th>Billing Status</th>
                                <th>Visit Status</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-medium">Loading consultations...</td></tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-medium">No scheduled appointments recorded yet.</td></tr>
                            ) : (
                                filteredAppointments.map((app, idx) => (
                                    <tr key={app._id || app.id || `app-${idx}`} className="hover:bg-sky-50/50 transition-colors">
                                        <td>
                                            <div className="font-bold text-slate-900">{app.patientName || 'Outpatient'}</div>
                                            <div className="text-xs text-slate-500">{app.patientEmail}</div>
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900">{app.doctorName || 'Dr. On Duty'}</div>
                                            <div className="text-xs text-slate-500">{app.doctorEmail}</div>
                                        </td>
                                        <td>
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">{app.department || 'OPD'}</span>
                                        </td>
                                        <td>
                                            <div className="text-sm font-semibold text-slate-800">{new Date(app.date).toLocaleDateString()}</div>
                                            <div className="text-xs font-medium text-slate-500">{app.timeSlot || 'Scheduled'}</div>
                                        </td>
                                        <td>
                                            <span className={getPaidStatusColor(app.paidStatus)}>
                                                {app.paidStatus || 'Unpaid'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getStatusColor(app.status)}>
                                                {app.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <FaChevronRight className="text-slate-300 text-xs" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50/50">
                    <div className="text-xs font-semibold">Showing {filteredAppointments.length} recorded consultations</div>
                    <div className="flex gap-2">
                        <button className="admin-btn-secondary text-xs" disabled>Previous</button>
                        <button className="admin-btn-secondary text-xs" disabled>Next</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManageAppointments;
