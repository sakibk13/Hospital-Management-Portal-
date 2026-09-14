import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaPlus, FaSearch, FaCapsules, FaSyncAlt, FaTrashAlt, FaImage, FaPen, FaTimes } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManagePharmacy = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('inventory'); // 'inventory' or 'add'

    // Form state for adding medicine
    const [formData, setFormData] = useState({
        name: '', genericName: '', dosageForm: '', strength: '',
        price: '', strip: '', manufacturer: '', description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Edit modal state
    const [editMedicine, setEditMedicine] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', genericName: '', dosageForm: '', strength: '',
        price: '', strip: '', manufacturer: '', description: ''
    });
    const [editStatus, setEditStatus] = useState({ type: '', message: '' });
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/medicines');
            setMedicines(res.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            await api.post('/medicines/add', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Medicine added successfully!' });
            setFormData({ name: '', genericName: '', dosageForm: '', strength: '', price: '', strip: '', manufacturer: '', description: '', image: null });
            setImagePreview(null);
            fetchMedicines();
            setTimeout(() => setViewMode('inventory'), 1500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to add medicine.' });
        }
    };

    const handleStockUpdate = async (id, currentVal) => {
        const newVal = prompt("Enter new stock count (Strips):", currentVal);
        if (newVal === null || newVal === "") return;
        
        try {
            await api.put(`/medicines/${id}`, { strip: parseInt(newVal) });
            fetchMedicines();
            toast.success('Medicine stock updated successfully!', { title: 'Stock Updated' });
        } catch (error) {
            toast.error('Stock update failed. Please try again.');
        }
    };

    const openEditModal = (m) => {
        setEditMedicine(m);
        setEditForm({
            name: m.name || '',
            genericName: m.genericName || '',
            dosageForm: m.dosageForm || '',
            strength: m.strength || '',
            price: m.price ?? '',
            strip: m.strip ?? '',
            manufacturer: m.manufacturer || '',
            description: m.description || ''
        });
        setEditStatus({ type: '', message: '' });
    };

    const closeEditModal = () => {
        setEditMedicine(null);
        setEditSaving(false);
        setEditStatus({ type: '', message: '' });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editMedicine) return;
        setEditSaving(true);
        try {
            await api.put(`/medicines/edit/${editMedicine._id}`, {
                name: editForm.name,
                genericName: editForm.genericName,
                dosageForm: editForm.dosageForm,
                strength: editForm.strength,
                price: editForm.price,
                strip: editForm.strip,
                manufacturer: editForm.manufacturer,
                description: editForm.description
            });
            await fetchMedicines();
            closeEditModal();
            toast.success('Medicine updated in inventory successfully!', { title: 'Medicine Updated' });
        } catch (error) {
            setEditSaving(false);
            setEditStatus({ type: 'error', message: 'Failed to update medicine.' });
            toast.error('Failed to update medicine. Please try again.');
        }
    };

    const handleDeleteMedicine = async (id, name) => {
        if (!window.confirm(`Delete "${name}" from the inventory? This action cannot be undone.`)) return;
        try {
            await api.delete(`/medicines/${id}`);
            fetchMedicines();
            toast.success(`"${name}" removed from inventory.`, { title: 'Medicine Deleted' });
        } catch (error) {
            toast.error('Failed to delete medicine.');
        }
    };

    const filteredMedicines = medicines.filter(m => 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Pharmacy Management" subtitle="Manage drug inventory and clinical supply">
            <Helmet>
                <title>Pharmacy Management - HealingWave</title>
            </Helmet>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => setViewMode('inventory')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'inventory' 
                                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaCapsules /> Medication Stock ({medicines.length})
                    </button>
                    <button 
                        onClick={() => setViewMode('add')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'add' 
                                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaPlus /> Register New Drug
                    </button>
                </div>

                {viewMode === 'inventory' && (
                    <div className="relative w-full md:w-80 max-w-full min-w-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaSearch />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by brand or generic name..." 
                            className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {viewMode === 'inventory' ? (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Drug Information</th>
                                <th>Active Formulation</th>
                                <th>MRPT / Strip</th>
                                <th>Inventory Level</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">Loading pharmacy inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">No pharmaceutical products matching your search.</td></tr>
                            ) : (
                                filteredMedicines.map((m, idx) => (
                                    <tr key={m._id || m.id || `med-${idx}`}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {m.image ? (
                                                        <img src={`${m.image}`} alt={m.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaCapsules className="text-emerald-600 text-sm" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                                                    <div className="text-[11px] text-slate-500 font-medium">{m.manufacturer || 'General Pharma'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-xs font-semibold text-slate-800">{m.genericName || 'N/A'}</div>
                                            <div className="text-[11px] text-slate-500 font-medium">{m.strength} • {m.dosageForm}</div>
                                        </td>
                                        <td>
                                            <div className="font-black text-slate-900 text-sm">৳{m.price}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Per Strip</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-black ${m.strip < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {m.strip} Strips
                                                </span>
                                                <span className={`admin-badge ${m.strip < 10 ? 'admin-badge-critical' : m.strip < 25 ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                                                    {m.strip < 10 ? 'Low Stock' : 'Available'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={() => handleStockUpdate(m._id, m.strip)} 
                                                    title="Adjust Stock Count" 
                                                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                                                >
                                                    <FaSyncAlt className="text-xs" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(m)} 
                                                    title="Edit Drug Details" 
                                                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50 transition-colors"
                                                >
                                                    <FaPen className="text-xs" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMedicine(m._id, m.name)} 
                                                    title="Delete Drug Record" 
                                                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                                                >
                                                    <FaTrashAlt className="text-xs" />
                                                </button>
                                            </div>
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
                        <h3 className="text-base font-bold text-slate-900">Add New Pharmaceutical Product</h3>
                        <p className="text-xs text-slate-500">Register new medical stock into the hospital central pharmacy registry</p>
                    </div>

                    <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Brand / Trade Name *</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Paracetamol 500" className="admin-input w-full text-xs" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Generic / Composition *</label>
                                <input name="genericName" value={formData.genericName} onChange={handleInputChange} placeholder="e.g. Acetaminophen" className="admin-input w-full text-xs" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Strength *</label>
                                    <input placeholder="e.g. 500mg" name="strength" value={formData.strength} onChange={handleInputChange} className="admin-input w-full text-xs" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dosage Form *</label>
                                    <input placeholder="e.g. Tablet, Syrup" name="dosageForm" value={formData.dosageForm} onChange={handleInputChange} className="admin-input w-full text-xs" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Manufacturer *</label>
                                <input placeholder="e.g. Square Pharmaceuticals" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="admin-input w-full text-xs" required />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Unit Price (৳) *</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="admin-input w-full text-xs" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Initial Stock (Strips) *</label>
                                    <input type="number" name="strip" value={formData.strip} onChange={handleInputChange} placeholder="0" className="admin-input w-full text-xs" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Packaging Visual (Optional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 hover:border-emerald-400 transition-all cursor-pointer relative overflow-hidden h-28 bg-slate-50/50">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                                    ) : (
                                        <>
                                            <FaImage className="text-slate-400 text-xl" />
                                            <span className="text-xs text-slate-500 font-medium">Click to upload drug image</span>
                                        </>
                                    )}
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Clinical Instructions / Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Usage notes, storage conditions..." className="admin-input w-full h-20 resize-none text-xs"></textarea>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            {status.message && (
                                <div className={`text-xs font-bold ${status.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {status.message}
                                </div>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button 
                                    type="button" 
                                    onClick={() => setViewMode('inventory')}
                                    className="admin-btn-secondary text-xs"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn-primary text-xs">
                                    Save Pharmaceutical Product
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Medicine Modal */}
            {editMedicine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeEditModal}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                                    <FaPen className="text-xs" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">Edit Pharmaceutical Details</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">{editMedicine.name}</p>
                                </div>
                            </div>
                            <button onClick={closeEditModal} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Drug Name</label>
                                <input name="name" value={editForm.name} onChange={handleEditChange} className="admin-input w-full text-xs" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Generic Name</label>
                                <input name="genericName" value={editForm.genericName} onChange={handleEditChange} className="admin-input w-full text-xs" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Strength</label>
                                <input name="strength" value={editForm.strength} onChange={handleEditChange} className="admin-input w-full text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Dosage Form</label>
                                <input name="dosageForm" value={editForm.dosageForm} onChange={handleEditChange} className="admin-input w-full text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Price (৳)</label>
                                <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="admin-input w-full text-xs" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stock (Strips)</label>
                                <input type="number" name="strip" value={editForm.strip} onChange={handleEditChange} className="admin-input w-full text-xs" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Manufacturer</label>
                                <input name="manufacturer" value={editForm.manufacturer} onChange={handleEditChange} className="admin-input w-full text-xs" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Description</label>
                                <textarea name="description" value={editForm.description} onChange={handleEditChange} className="admin-input w-full h-20 resize-none text-xs"></textarea>
                            </div>

                            {editStatus.message && (
                                <div className="md:col-span-2 px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    {editStatus.message}
                                </div>
                            )}

                            <div className="md:col-span-2 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button type="button" onClick={closeEditModal} className="admin-btn-secondary text-xs">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editSaving} className="admin-btn-primary text-xs">
                                    {editSaving ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminManagePharmacy;
