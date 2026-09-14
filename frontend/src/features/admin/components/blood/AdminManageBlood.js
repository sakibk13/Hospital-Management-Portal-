import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaSearch, FaTint, FaUserFriends, FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManageBlood = () => {
    const [donors, setDonors] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('donors');
    const [searchTerm, setSearchTerm] = useState('');

    // Availability management state
    const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const [editingId, setEditingId] = useState(null);
    const [editCount, setEditCount] = useState('');
    const [newGroup, setNewGroup] = useState('');
    const [newCount, setNewCount] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBloodData();
    }, []);

    const fetchBloodData = async () => {
        try {
            const [donorRes, recipientRes, availabilityRes] = await Promise.all([
                api.get('/bloodDonor/details'),
                api.get('/bloodRecipient'),
                api.get('/bloodAvailability')
            ]);
            setDonors(donorRes.data);
            setRecipients(recipientRes.data);
            setAvailability(availabilityRes.data);
        } catch (error) {
            console.error('Error fetching blood management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (entry) => {
        setEditingId(entry._id);
        setEditCount(String(entry.count));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditCount('');
    };

    const handleSaveCount = async (id) => {
        setSaving(true);
        try {
            await api.put('/bloodAvailability/' + id, { count: Number(editCount) || 0 });
            cancelEdit();
            await fetchBloodData();
            toast.success('Blood units updated successfully!', { title: 'Units Updated' });
        } catch (error) {
            console.error('Error updating blood availability:', error);
            toast.error('Failed to update unit count. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroup) {
            toast.error('Please select a blood group.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/bloodAvailability', { bloodGroup: newGroup, count: Number(newCount) || 0 });
            toast.success(`Blood group ${newGroup} added to inventory!`, { title: 'Blood Group Added' });
            setNewGroup('');
            setNewCount('');
            await fetchBloodData();
        } catch (error) {
            console.error('Error adding blood group:', error);
            toast.error(error.response?.data?.message || 'Failed to add blood group. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async (entry) => {
        if (!window.confirm(`Delete the ${entry.bloodGroup} availability entry? This cannot be undone.`)) return;
        try {
            await api.delete('/bloodAvailability/' + entry._id);
            await fetchBloodData();
            toast.success(`Blood group ${entry.bloodGroup} removed.`, { title: 'Entry Deleted' });
        } catch (error) {
            console.error('Error deleting blood group:', error);
            toast.error('Failed to delete blood group entry. Please try again.');
        }
    };

    const availableGroupsToAdd = ALL_BLOOD_GROUPS.filter(
        g => !availability.some(a => a.bloodGroup === g)
    );

    const filteredDonors = donors.filter(d => 
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecipients = recipients.filter(r => 
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.bloodNeeded.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Blood Bank Management" subtitle="Monitor donors, requests, and current stock">
            <Helmet>
                <title>Blood Management - HealingWave</title>
            </Helmet>

            {/* Tab Navigation & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="inline-flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                    <button 
                        onClick={() => { setActiveTab('donors'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'donors' 
                                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaUserFriends /> Blood Donors ({donors.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('recipients'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'recipients' 
                                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaClipboardList /> Patient Requests ({recipients.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('availability'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'availability' 
                                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaTint /> Blood Bank Reserves
                    </button>
                </div>

                {/* Search Bar (except for availability tab) */}
                {activeTab !== 'availability' && (
                    <div className="relative w-full xl:w-80 max-w-full min-w-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaSearch />
                        </span>
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'donors' ? 'donors' : 'requests'} by name or blood group...`}
                            className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Tab: Donors Table */}
            {activeTab === 'donors' && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Donor Profile</th>
                                <th>Blood Type</th>
                                <th>Phone Contact</th>
                                <th>Email Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">Loading blood donor records...</td></tr>
                            ) : filteredDonors.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">No registered donors found matching your search.</td></tr>
                            ) : (
                                filteredDonors.map((d, i) => (
                                    <tr key={d._id || i}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-bold text-xs">
                                                    {d.firstName ? d.firstName[0] : 'D'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{d.firstName} {d.lastName}</div>
                                                    <div className="text-[11px] text-slate-500 font-medium">Donor #{d._id?.slice(-6).toUpperCase() || 'REC'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-badge admin-badge-critical">
                                                <FaTint className="text-[9px]" /> {d.bloodGroup}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-medium text-slate-700 text-xs">{d.phoneNumber || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span className="font-medium text-slate-600 text-xs">{d.email || 'N/A'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Recipients Table */}
            {activeTab === 'recipients' && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Recipient Profile</th>
                                <th>Required Group</th>
                                <th>Quantity Needed</th>
                                <th>Contact Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">Loading recipient requests...</td></tr>
                            ) : filteredRecipients.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">No blood requests found matching your search.</td></tr>
                            ) : (
                                filteredRecipients.map((r, i) => (
                                    <tr key={r._id || i}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold text-xs">
                                                    {r.firstName ? r.firstName[0] : 'R'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{r.firstName} {r.lastName}</div>
                                                    <div className="text-[11px] text-slate-500 font-medium">Request #{r._id?.slice(-6).toUpperCase() || 'REQ'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-badge admin-badge-critical">
                                                <FaTint className="text-[9px]" /> {r.bloodNeeded}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-extrabold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {r.totalBagsNeeded} Units
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-medium text-slate-700 text-xs">{r.phoneNumber || 'N/A'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Availability Grid */}
            {activeTab === 'availability' && (
                <div className="space-y-6">
                    {/* Add new blood group form */}
                    <div className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Add Blood Group Stock</h3>
                                <p className="text-xs text-slate-500">Track an additional blood group in the hospital bank inventory</p>
                            </div>
                        </div>
                        <form onSubmit={handleAddGroup} className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1 min-w-[180px]">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                                <select
                                    value={newGroup}
                                    onChange={(e) => setNewGroup(e.target.value)}
                                    className="admin-input text-xs"
                                >
                                    <option value="">Select blood group...</option>
                                    {availableGroupsToAdd.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 w-28">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Available Units</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newCount}
                                    onChange={(e) => setNewCount(e.target.value)}
                                    placeholder="0"
                                    className="admin-input text-xs"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving || availableGroupsToAdd.length === 0}
                                className="admin-btn-primary text-xs py-2 px-4"
                            >
                                <FaPlus /> Add Blood Group
                            </button>
                            {availableGroupsToAdd.length === 0 && (
                                <span className="text-xs text-slate-500 self-center font-medium">All 8 standard blood groups are already active in the bank.</span>
                            )}
                        </form>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            <div className="col-span-full text-center py-12 text-slate-400 font-semibold">Checking inventory levels...</div>
                        ) : availability.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-slate-400 font-semibold">No blood groups recorded yet.</div>
                        ) : availability.map((a, idx) => (
                            <div key={a._id || a.id || a.bloodGroup || `avail-${idx}`} className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center relative hover:border-rose-300 transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl font-black text-rose-600 mb-2">
                                    {a.bloodGroup}
                                </div>

                                {editingId === a._id ? (
                                    <div className="flex flex-col items-center gap-2.5 w-full mt-1">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase">Update Available Units</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editCount}
                                            onChange={(e) => setEditCount(e.target.value)}
                                            className="admin-input w-full text-center text-sm font-bold"
                                        />
                                        <div className="flex items-center gap-2 w-full mt-1">
                                            <button
                                                onClick={() => handleSaveCount(a._id)}
                                                disabled={saving}
                                                className="admin-btn-primary flex-1 justify-center py-1.5 text-xs"
                                            >
                                                <FaSave /> Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                disabled={saving}
                                                className="admin-btn-secondary flex-1 justify-center py-1.5 text-xs"
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                                            {a.count} <span className="text-xs font-semibold text-slate-500">Units</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`admin-badge ${a.count > 3 ? 'admin-badge-success' : a.count > 0 ? 'admin-badge-warning' : 'admin-badge-critical'}`}>
                                                {a.count > 0 ? `${a.count} In Stock` : 'Depleted Stock'}
                                            </span>
                                        </div>
                                        {a.count <= 2 && a.count > 0 && (
                                            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                                                <FaExclamationTriangle className="text-[10px]" /> Critical Reserve Level
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-4 w-full pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => startEdit(a)}
                                                className="admin-btn-secondary flex-1 justify-center py-1.5 text-xs"
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(a)}
                                                className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                                                title={`Delete ${a.bloodGroup}`}
                                                aria-label={`Delete ${a.bloodGroup}`}
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminManageBlood;
