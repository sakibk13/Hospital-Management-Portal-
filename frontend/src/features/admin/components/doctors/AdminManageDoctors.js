import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import DoctorDetailsSheet from './DoctorDetailsSheet';
import { FaFilter, FaFileExport, FaCog, FaEllipsisH, FaSearch, FaUserPlus, FaUserMd, FaChevronRight } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDoctor, setNewDoctor] = useState({ firstName: '', lastName: '', email: '', sex: 'Male', dateOfBirth: '', mobileNumber: '', password: 'password123' });
    const [editDoctor, setEditDoctor] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/admin/doctors');
            // Mocking enhanced data to match the UI requirements
            const enhancedData = res.data.map(d => ({
                ...d,
                specialty: d.specialty || ['Cardiology', 'Neurology', 'Pediatrics', 'General Surgery'][Math.floor(Math.random() * 4)],
                department: d.department || 'General',
                status: ['Available', 'On Leave', 'Busy'][Math.floor(Math.random() * 3)],
                rating: (Math.random() * 2 + 3).toFixed(1) // Mock rating 3.0 - 5.0
            }));
            setDoctors(enhancedData);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/doctors', newDoctor);
            setShowAddForm(false);
            setNewDoctor({ firstName: '', lastName: '', email: '', sex: 'Male', dateOfBirth: '', mobileNumber: '', password: 'password123' });
            await fetchDoctors();
            toast.success('Doctor registered successfully!', { title: 'Doctor Added' });
        } catch (error) {
            console.error('Failed to add doctor:', error);
            toast.error('Failed to register doctor. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const openEditDoctor = (doctor) => {
        setEditDoctor({
            _id: doctor._id,
            firstName: doctor.firstName || '',
            lastName: doctor.lastName || '',
            email: doctor.email || '',
            sex: doctor.sex || 'Male',
            dateOfBirth: doctor.dateOfBirth ? String(doctor.dateOfBirth).slice(0, 10) : '',
            mobileNumber: doctor.mobileNumber || '',
            specialty: doctor.specialty || '',
            department: doctor.department || ''
        });
    };

    const handleEditDoctor = async (e) => {
        e.preventDefault();
        if (!editDoctor) return;
        setLoading(true);
        try {
            const { _id, ...payload } = editDoctor;
            await api.put('/admin/doctors/' + _id, payload);
            setEditDoctor(null);
            await fetchDoctors();
            toast.success('Doctor details updated successfully!', { title: 'Profile Updated' });
        } catch (error) {
            console.error('Failed to update doctor:', error);
            toast.error('Failed to update doctor. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoctor = async (doctor) => {
        if (!window.confirm(`Delete Dr. ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) return;
        setLoading(true);
        try {
            await api.delete('/admin/doctors/' + doctor._id);
            await fetchDoctors();
            toast.success(`Dr. ${doctor.firstName} ${doctor.lastName} removed from directory.`, { title: 'Doctor Deleted' });
        } catch (error) {
            console.error('Failed to delete doctor:', error);
            toast.error('Failed to delete doctor. Please check your connection.');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
          case 'available': return 'admin-badge admin-badge-success';
          case 'busy': return 'admin-badge admin-badge-warning';
          case 'on leave': return 'admin-badge admin-badge-critical';
          default: return 'admin-badge admin-badge-info';
        }
    };

    const filteredDoctors = doctors.filter(d => 
        (d.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.specialty?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout title="Medical Staff Directory" subtitle="Hospital physicians, consultants and specialists">
            <Helmet>
                <title>Medical Staff Directory - HealingWave</title>
            </Helmet>

            {/* Header / Actions Row */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Medical Staff Directory</h1>
                    <p className="text-sm text-slate-600 mt-0.5">Total {doctors.length} accredited physicians & clinical consultants</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="admin-btn-primary"
                >
                    <FaUserPlus />
                    Register New Doctor
                </button>
            </div>

            {/* Main Content Card */}
            <div className="admin-table-wrapper">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 flex-wrap">
                    <div className="relative max-w-sm w-full min-w-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaSearch />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search doctor by name, specialty..." 
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
                            Export Staff
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                </th>
                                <th>Physician Name</th>
                                <th>Hospital Contact</th>
                                <th>Specialty</th>
                                <th>Department</th>
                                <th>Patient Rating</th>
                                <th>Duty Status</th>
                                <th className="w-32 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">Loading medical staff directory...</td>
                                </tr>
                            ) : filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">No doctors found matching your search.</td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doctor, idx) => (
                                    <tr 
                                        key={doctor._id || doctor.id || doctor.email || `doc-${idx}`} 
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="cursor-pointer group hover:bg-sky-50/50 transition-colors"
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
                                                    {(doctor.firstName?.[0] || 'D').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Dr. {doctor.firstName} {doctor.lastName}</div>
                                                    <div className="text-xs font-mono text-slate-400">ID: #{doctor._id ? doctor._id.slice(-6).toUpperCase() : (doctor.id ? doctor.id.slice(-6).toUpperCase() : 'DOC')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm font-semibold text-slate-800">{doctor.email}</div>
                                            <div className="text-xs text-slate-500">{doctor.mobileNumber || 'N/A'}</div>
                                        </td>
                                        <td className="text-sm text-sky-700 font-bold">{doctor.specialty || 'General'}</td>
                                        <td className="text-sm text-slate-600 font-medium">{doctor.department || 'OPD'}</td>
                                        <td className="text-sm font-bold text-amber-500">
                                            ★ {doctor.rating || '4.8'}
                                        </td>
                                        <td>
                                            <span className={getStatusColor(doctor.status)}>
                                                {doctor.status || 'Available'}
                                            </span>
                                        </td>
                                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditDoctor(doctor)}
                                                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg border border-sky-200 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDoctor(doctor)}
                                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                                <FaChevronRight className="text-slate-300 group-hover:text-slate-500 transition-colors text-xs ml-1" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50/50">
                    <div className="text-xs font-semibold">Showing {filteredDoctors.length} accredited physicians</div>
                    <div className="flex gap-2">
                        <button className="admin-pagination-btn px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50" disabled>Previous</button>
                        <button className="admin-pagination-btn px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Add Doctor Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Register New Doctor</h2>
                        <form onSubmit={handleAddDoctor} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">First Name</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, firstName: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Name</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, lastName: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                                <input required type="email" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gender</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, sex: e.target.value})}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, mobileNumber: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date of Birth</label>
                                <input required type="date" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setNewDoctor({...newDoctor, dateOfBirth: e.target.value})} />
                            </div>
                            <div className="col-span-2 flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-gray-800 dark:bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-100 dark:shadow-none transition-all">Create Staff Account</button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold rounded-xl transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Doctor Modal */}
            {editDoctor && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setEditDoctor(null)}></div>
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Doctor</h2>
                        <form onSubmit={handleEditDoctor} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">First Name</label>
                                <input required value={editDoctor.firstName} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, firstName: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Name</label>
                                <input required value={editDoctor.lastName} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, lastName: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                                <input required type="email" value={editDoctor.email} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, email: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gender</label>
                                <select value={editDoctor.sex} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, sex: e.target.value})}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                                <input required value={editDoctor.mobileNumber} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, mobileNumber: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date of Birth</label>
                                <input type="date" value={editDoctor.dateOfBirth} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, dateOfBirth: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Specialty</label>
                                <input value={editDoctor.specialty} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, specialty: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Department</label>
                                <input value={editDoctor.department} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" onChange={e => setEditDoctor({...editDoctor, department: e.target.value})} />
                            </div>
                            <div className="col-span-2 flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 dark:bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-100 dark:shadow-none transition-all">Save Changes</button>
                                <button type="button" onClick={() => setEditDoctor(null)} className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold rounded-xl transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Sheet Overlay */}
            {selectedDoctor && (
                <DoctorDetailsSheet 
                    doctor={selectedDoctor} 
                    onClose={() => setSelectedDoctor(null)} 
                />
            )}
        </AdminLayout>
    );
};

export default AdminManageDoctors;
