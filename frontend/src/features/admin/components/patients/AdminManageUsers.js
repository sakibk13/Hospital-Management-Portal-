import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import PatientDetailsSheet from './PatientDetailsSheet';
import SuccessNotification from '../../../../features/shared/components/ui/SuccessNotification';
import { FaFilter, FaFileExport, FaCog, FaEllipsisH, FaSearch, FaUserPlus, FaChevronRight, FaTimes, FaTrash } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManageUsers = () => {
    // We'll focus on Patients for this "Patient" view as per sidebar.
    // (If "Staff" link existed, we'd use a separate component or toggle, but sidebar says "Patient")
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [successPatientName, setSuccessPatientName] = useState('');
    const [newPatient, setNewPatient] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        sex: 'Male', 
        dateOfBirth: '', 
        mobileNumber: '', 
        password: 'password123',
        diagnosis: 'Checkup',
        status: 'Stable'
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/admin/patients');
            setPatients(res.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fullName = `${newPatient.firstName} ${newPatient.lastName}`;
            if (editingPatient) {
                await api.put(`/admin/patients/${editingPatient._id}`, newPatient);
                setSuccessMessage('Patient updated successfully!');
                setSuccessPatientName(fullName);
            } else {
                await api.post('/admin/patients', newPatient);
                setSuccessMessage('Patient created successfully!');
                setSuccessPatientName(fullName);
            }
            toast.success(editingPatient ? 'Patient record updated successfully!' : `Patient ${fullName} added successfully!`, { title: editingPatient ? 'Record Updated' : 'Patient Registered' });
            setShowSuccessNotification(true);
            setShowAddForm(false);
            setEditingPatient(null);
            setNewPatient({ 
                firstName: '', 
                lastName: '', 
                email: '', 
                sex: 'Male', 
                dateOfBirth: '', 
                mobileNumber: '', 
                password: 'password123',
                diagnosis: 'Checkup',
                status: 'Stable'
            });
            await fetchPatients();
        } catch (error) {
            console.error('Failed to save patient:', error);
            toast.error('Failed to save patient data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (patient, e) => {
        e.stopPropagation();
        setEditingPatient(patient);
        const [firstName, ...lastNameParts] = (patient.name || '').split(' ');
        setNewPatient({
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            email: patient.email || '',
            sex: patient.sex || 'Male',
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
            mobileNumber: patient.mobileNumber || '',
            password: 'password123',
            diagnosis: patient.diagnosis || 'Checkup',
            status: patient.status || 'Stable'
        });
        setShowAddForm(true);
    };

    const handleDeletePatient = async (patient, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ${patient.name || 'this patient'}? This action cannot be undone.`)) {
            return;
        }
        try {
            await api.delete(`/admin/patients/${patient._id}`);
            await fetchPatients();
            toast.success(`Patient record for ${patient.name || 'patient'} has been removed.`, { title: 'Patient Deleted' });
        } catch (error) {
            console.error('Failed to delete patient:', error);
            toast.error('Failed to delete patient. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
          case 'stable': return 'admin-badge admin-badge-success';
          case 'mild': return 'admin-badge admin-badge-info';
          case 'critical': return 'admin-badge admin-badge-critical';
          default: return 'admin-badge admin-badge-info';
        }
    };

    const filteredPatients = patients.filter(p => 
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout title="Patient Directory" subtitle="Manage and monitor all hospital registered patients">
            <Helmet>
                <title>Patient Directory - HealingWave</title>
            </Helmet>

            {/* Header / Actions Row */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Patient Directory</h1>
                    <p className="text-sm text-slate-600 mt-0.5">Total {patients.length} active registered patients under care</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="admin-btn-primary"
                >
                    <FaUserPlus />
                    Register New Patient
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
                            placeholder="Search patient name, email..." 
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
                            Export Records
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
                                <th>Patient Name</th>
                                <th>Contact Information</th>
                                <th>Last Visit</th>
                                <th>Gender</th>
                                <th>Diagnosis</th>
                                <th>Clinical Status</th>
                                <th className="w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">Loading patients directory...</td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">No patients found matching your search.</td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient, idx) => (
                                    <tr 
                                        key={patient._id || patient.id || patient.email || `pat-${idx}`} 
                                        onClick={() => setSelectedPatient(patient)}
                                        className="cursor-pointer group hover:bg-sky-50/50 transition-colors"
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
                                                    {(patient.name || patient.firstName || 'P')[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}</div>
                                                    <div className="text-xs font-mono text-slate-400">ID: #{patient._id ? patient._id.slice(-6).toUpperCase() : (patient.id ? patient.id.slice(-6).toUpperCase() : 'PAT')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm font-semibold text-slate-800">{patient.email}</div>
                                            <div className="text-xs text-slate-500">{patient.mobileNumber || patient.phoneNumber || 'N/A'}</div>
                                        </td>
                                        <td className="text-sm text-slate-600 font-medium">{patient.lastVisit || 'Today'}</td>
                                        <td>
                                            <span className="text-xs font-bold text-slate-700 uppercase px-2.5 py-1 bg-slate-100 rounded-lg">{patient.sex || 'Male'}</span>
                                        </td>
                                        <td className="text-sm font-bold text-slate-800">{patient.diagnosis || 'Routine'}</td>
                                        <td>
                                            <span className={getStatusColor(patient.status)}>
                                                {patient.status || 'Stable'}
                                            </span>
                                        </td>
                                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button 
                                                    onClick={(e) => handleEditClick(patient, e)}
                                                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                    title="Edit Patient"
                                                >
                                                    <FaCog size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDeletePatient(patient, e)}
                                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Patient"
                                                >
                                                    <FaTrash size={14} />
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
                    <div className="text-xs font-semibold">Showing {filteredPatients.length} recorded patients</div>
                    <div className="flex gap-2">
                        <button className="admin-pagination-btn px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50" disabled>Previous</button>
                        <button className="admin-pagination-btn px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Add Patient Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{editingPatient ? 'Edit Patient Details' : 'Register New Patient'}</h2>
                            <button onClick={() => { setShowAddForm(false); setEditingPatient(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddPatient} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">First Name</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Name</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                                <input required type="email" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gender</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.sex} onChange={e => setNewPatient({...newPatient, sex: e.target.value})}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                                <input required className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.mobileNumber} onChange={e => setNewPatient({...newPatient, mobileNumber: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date of Birth</label>
                                <input required type="date" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.dateOfBirth} onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Initial Diagnosis</label>
                                <input 
                                    list="diagnosis-options"
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" 
                                    placeholder="e.g. Fever" 
                                    value={newPatient.diagnosis}
                                    onChange={e => setNewPatient({...newPatient, diagnosis: e.target.value})} 
                                />
                                <datalist id="diagnosis-options">
                                    <option value="Fever" />
                                    <option value="Cold / Flu" />
                                    <option value="Hypertension" />
                                    <option value="Diabetes" />
                                    <option value="Asthma" />
                                    <option value="Injury" />
                                    <option value="General Checkup" />
                                </datalist>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Admission Status</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-gray-700/10 dark:text-gray-100" value={newPatient.status} onChange={e => setNewPatient({...newPatient, status: e.target.value})}>
                                    <option>Stable</option>
                                    <option>Mild</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                            {!editingPatient && (
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Default Password</label>
                                    <input disabled className="w-full p-3 bg-gray-100 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none dark:text-gray-400 italic" value="password123" />
                                </div>
                            )}
                            <div className="col-span-2 flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                                    {editingPatient ? 'Update Patient' : 'Create Patient'}
                                </button>
                                <button type="button" onClick={() => { setShowAddForm(false); setEditingPatient(null); }} className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold rounded-xl transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Sheet Overlay */}
            {selectedPatient && (
                <PatientDetailsSheet 
                    patient={selectedPatient} 
                    onClose={() => setSelectedPatient(null)} 
                />
            )}

            {/* Success Notification Popup */}
            <SuccessNotification 
                show={showSuccessNotification}
                message={successMessage}
                patientName={successPatientName}
                onClose={() => setShowSuccessNotification(false)}
                duration={4000}
            />
        </AdminLayout>
    );
};

export default AdminManageUsers;
