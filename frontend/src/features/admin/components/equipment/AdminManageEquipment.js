import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaTools, FaPlus, FaSearch, FaCheckCircle, FaExclamationCircle, FaWrench, FaTrashAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManageEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'add'
    
    // Form state
    const [formData, setFormData] = useState({
        name: '', category: 'Diagnostic', serialNumber: '', 
        status: 'Functional', lastMaintenance: new Date().toISOString().split('T')[0],
        description: '', location: ''
    });

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const res = await api.get('/equipment');
            setEquipment(res.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/equipment/add', formData);
            setFormData({
                name: '', category: 'Diagnostic', serialNumber: '', 
                status: 'Functional', lastMaintenance: new Date().toISOString().split('T')[0],
                description: '', location: ''
            });
            fetchEquipment();
            setViewMode('list');
            toast.success('Medical equipment added successfully!', { title: 'Equipment Added' });
        } catch (error) {
            toast.error('Failed to add equipment. Please try again.');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/equipment/update/${id}`, { status: newStatus });
            fetchEquipment();
            toast.success(`Equipment status updated to ${newStatus}`, { title: 'Status Changed' });
        } catch (error) {
            toast.error('Status update failed. Please try again.');
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Functional': return <FaCheckCircle className="text-emerald-500" />;
            case 'Maintenance': return <FaWrench className="text-amber-500" />;
            case 'Under Repair': return <FaExclamationCircle className="text-red-500" />;
            default: return <FaTools className="text-gray-400" />;
        }
    };

    const filteredEquipment = equipment.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Equipment Management" subtitle="Track hospital assets and maintenance status">
            <Helmet>
                <title>Equipment Management - HealingWave</title>
            </Helmet>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'list' 
                                ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaTools /> Equipment Directory ({equipment.length})
                    </button>
                    <button 
                        onClick={() => setViewMode('add')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'add' 
                                ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaPlus /> Register New Asset
                    </button>
                </div>

                {viewMode === 'list' && (
                    <div className="relative w-full md:w-80 max-w-full min-w-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaSearch />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by equipment name or serial..." 
                            className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Equipment Specimen</th>
                                <th>Classification</th>
                                <th>Serial Number</th>
                                <th>Operational Status</th>
                                <th>Last Servicing</th>
                                <th className="text-right">Status Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">Syncing biomedical asset database...</td></tr>
                            ) : filteredEquipment.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">No equipment found matching criteria.</td></tr>
                            ) : (
                                filteredEquipment.map((e, idx) => (
                                    <tr key={e._id || e.id || `eq-${idx}`}>
                                        <td>
                                            <div className="font-bold text-slate-900 text-sm">{e.name}</div>
                                            <div className="text-[11px] text-slate-500 font-medium">{e.location || 'Hospital Main Building'}</div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {e.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                {e.serialNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className={`admin-badge ${
                                                    e.status === 'Functional' 
                                                        ? 'admin-badge-success' 
                                                        : e.status === 'Maintenance' 
                                                            ? 'admin-badge-warning' 
                                                            : 'admin-badge-critical'
                                                }`}>
                                                    {getStatusIcon(e.status)}
                                                    {e.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-medium text-slate-600">
                                                {e.lastMaintenance ? new Date(e.lastMaintenance).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <select 
                                                value={e.status}
                                                onChange={(opt) => handleStatusUpdate(e._id, opt.target.value)}
                                                className="admin-input text-xs py-1 px-2 font-bold cursor-pointer"
                                            >
                                                <option value="Functional">Functional</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Under Repair">Under Repair</option>
                                                <option value="Decommissioned">Decommissioned</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-card bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-3xl mx-auto">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-base font-bold text-slate-900">Register Medical Asset</h3>
                        <p className="text-xs text-slate-500">Record diagnostic, surgical or therapeutic machinery in the hospital registry</p>
                    </div>

                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Asset / Machine Name *</label>
                                <input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. MRI Scanner 3.0T"
                                    className="admin-input w-full text-xs" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department *</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="admin-input w-full text-xs"
                                    >
                                        <option>Diagnostic</option>
                                        <option>Therapeutic</option>
                                        <option>Life Support</option>
                                        <option>Monitoring</option>
                                        <option>Laboratory</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Serial Number *</label>
                                    <input 
                                        value={formData.serialNumber} 
                                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                                        placeholder="SN-XXXX-YYYY"
                                        className="admin-input w-full text-xs font-mono" 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Facility Location / Ward</label>
                                <input 
                                    value={formData.location} 
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    placeholder="e.g. Radiology Wing, Room 204"
                                    className="admin-input w-full text-xs" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Last Maintenance Date</label>
                                <input 
                                    type="date"
                                    value={formData.lastMaintenance} 
                                    onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                                    className="admin-input w-full text-xs" 
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Technical & Calibration Specifications</label>
                            <textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Service provider, warranty terms, power specs..."
                                className="admin-input w-full h-24 resize-none text-xs"
                            ></textarea>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setViewMode('list')}
                                className="admin-btn-secondary text-xs"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="admin-btn-primary text-xs">
                                Register Medical Asset
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminManageEquipment;
