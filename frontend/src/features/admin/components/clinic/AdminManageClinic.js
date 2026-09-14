import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaSearch, FaFilter, FaFileExport, FaBed, FaHotel, FaChevronRight } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const AdminManageClinic = () => {
    const [wards, setWards] = useState([]);
    const [cabins, setCabins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wards');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wardRes, cabinRes] = await Promise.all([
                api.get('/wardBooking/all-bills'),
                api.get('/cabinBooking/all-bills')
            ]);
            setWards(wardRes.data);
            setCabins(cabinRes.data);
        } catch (error) {
            console.error('Error fetching clinic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPaidStatusStyle = (paid) => {
        return paid 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
    };

    const currentData = activeTab === 'wards' ? wards : cabins;

    const filteredData = currentData.filter(item => 
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activeTab === 'wards' ? item.wardNo : item.cabinNo)?.toString().includes(searchTerm)
    );

    return (
        <AdminLayout title="Clinic Management" subtitle="Manage hospital wards and private cabins">
            <Helmet>
                <title>Clinic Management - HealingWave</title>
            </Helmet>

            {/* Toggle Controls & Search Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => { setActiveTab('wards'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'wards' 
                                ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaBed /> Inpatient Wards ({wards.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('cabins'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'cabins' 
                                ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <FaHotel /> Private Cabins ({cabins.length})
                    </button>
                </div>

                <div className="relative w-full md:w-80 max-w-full min-w-0">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaSearch />
                    </span>
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab === 'wards' ? 'ward' : 'cabin'} records by patient or number...`}
                        className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Accommodation Table */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Patient Beneficiary</th>
                            <th>Clinical Space</th>
                            <th>Status & Allocation</th>
                            <th>Intake Date</th>
                            <th className="text-right">Room Service</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">Syncing accommodation telemetry...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">No active bookings found for current selection.</td></tr>
                        ) : (
                            filteredData.map((item, idx) => (
                                <tr key={item._id || item.id || `clinic-${idx}`}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center font-bold text-xs">
                                                {item.patientName ? item.patientName[0] : 'P'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{item.patientName}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{item.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-slate-900 text-sm">
                                            {activeTab === 'wards' ? `Ward #${item.wardNo}` : `Cabin #${item.cabinNo}`}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium">{item.wardType || item.cabinType} • Floor {item.floor}</div>
                                    </td>
                                    <td>
                                        <div className="text-xs font-bold text-slate-800">{item.totalDays} Days</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Booked: {new Date(item.bookedDate).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div className="font-black text-slate-900 text-sm">৳{item.totalBill}</div>
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${item.paid ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                            {item.paid ? 'Settled / Paid' : 'Payment Due'}
                                        </span>
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

export default AdminManageClinic;
