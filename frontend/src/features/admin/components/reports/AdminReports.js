import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaChartLine, FaWallet, FaPrescriptionBottle, FaMicroscope, FaBed, FaSearch, FaArrowRight } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const AdminReports = () => {
    const [reports, setReports] = useState({
        medBills: [],
        testBills: [],
        wardBills: [],
        cabinBills: []
    });
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        try {
            const [med, test, ward, cabin] = await Promise.all([
                api.get('/medicineBill/all-bills'),
                api.get('/testAndServicesBill/all-bills'),
                api.get('/wardBooking/all-bills'),
                api.get('/cabinBooking/all-bills')
            ]);

            setReports({
                medBills: med.data,
                testBills: test.data,
                wardBills: ward.data,
                cabinBills: cabin.data
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (bills) => bills.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);

    const totals = {
        medicine: calculateTotal(reports.medBills),
        test: calculateTotal(reports.testBills),
        ward: calculateTotal(reports.wardBills),
        cabin: calculateTotal(reports.cabinBills),
    };

    const grossRevenue = Object.values(totals).reduce((a, b) => a + b, 0);

    const allTransactions = [
        ...reports.medBills.map(b => ({ ...b, type: 'Medicine', name: b.name })),
        ...reports.testBills.map(b => ({ ...b, type: 'Test', name: b.patientName })),
        ...reports.wardBills.map(b => ({ ...b, type: 'Ward', name: b.patientName })),
        ...reports.cabinBills.map(b => ({ ...b, type: 'Cabin', name: b.patientName }))
    ].sort((a, b) => new Date(b.date || b.bookedDate) - new Date(a.date || a.bookedDate));

    const filteredTransactions = allTransactions.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || t.type === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="Reports" subtitle="Clinical and financial performance dashboard">
            <Helmet>
                <title>Clinical Reports - HealingWave</title>
            </Helmet>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard title="Gross Hospital Billing" value={`৳${grossRevenue.toLocaleString()}`} icon={<FaWallet />} color="blue" />
                <SummaryCard title="Dispensary Sales" value={`৳${totals.medicine.toLocaleString()}`} icon={<FaPrescriptionBottle />} color="indigo" />
                <SummaryCard title="Diagnostic & Pathology" value={`৳${totals.test.toLocaleString()}`} icon={<FaMicroscope />} color="emerald" />
                <SummaryCard title="Inpatient Bed / Cabins" value={`৳${(totals.ward + totals.cabin).toLocaleString()}`} icon={<FaBed />} color="orange" />
            </div>

            {/* Filter Controls & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="inline-flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                    {['All', 'Medicine', 'Test', 'Ward', 'Cabin'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeCategory === cat 
                                ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            {cat === 'All' ? 'All Revenue' : cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 max-w-full min-w-0">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaSearch />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by patient name or bill..." 
                        className="admin-input w-full pl-10 pr-4 py-2 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Billing Date</th>
                            <th>Patient / Client</th>
                            <th>Revenue Category</th>
                            <th>Total Billed</th>
                            <th>Settlement Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">Compiling financial telemetry...</td></tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">No transactions found for current filter.</td></tr>
                        ) : (
                            filteredTransactions.map((t, i) => (
                                <tr key={t._id || t.id || `rep-${i}`}>
                                    <td>
                                        <span className="text-xs font-medium text-slate-600">
                                            {new Date(t.date || t.bookedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="font-bold text-slate-900 text-sm">{t.name || 'Outpatient Patient'}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">Invoice #{t._id ? t._id.slice(-8).toUpperCase() : 'INV-001'}</div>
                                    </td>
                                    <td>
                                        <span className="admin-badge admin-badge-info">
                                            {t.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="font-extrabold text-slate-900 text-sm">৳{t.totalBill ? t.totalBill.toLocaleString() : 0}</span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${t.paid ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                            {t.paid ? 'Settled / Paid' : 'Payment Due'}
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

const SummaryCard = ({ title, value, icon, color }) => {
    const iconColors = {
        blue: "bg-sky-50 text-sky-700 border-sky-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        orange: "bg-amber-50 text-amber-700 border-amber-100"
    };

    return (
        <div className="admin-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${iconColors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            </div>
        </div>
    );
};

export default AdminReports;
