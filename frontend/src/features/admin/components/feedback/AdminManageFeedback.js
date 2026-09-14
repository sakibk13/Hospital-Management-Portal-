import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaReply, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaEnvelope, FaHistory } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { storage } from '../../../../utils/storage';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminManageFeedback = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [solution, setSolution] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = storage.getItem('adminToken');
            const res = await api.get('/support/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (e) => {
        e.preventDefault();
        try {
            const token = storage.getItem('adminToken');
            await api.post(`/support/respond/${selectedRequest._id}`, { solution }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSolution('');
            setSelectedRequest(null);
            fetchRequests();
            toast.success('Response sent successfully to patient!', { title: 'Feedback Resolved' });
        } catch (error) {
            toast.error('Failed to send response. Please check your connection.');
        }
    };

    const filteredRequests = requests.filter(r => 
        statusFilter === 'All' || r.status === statusFilter
    );

    return (
        <AdminLayout title="Feedback & Support" subtitle="Review and respond to user messages and inquiries">
            <Helmet>
                <title>Feedback - HealingWave Admin</title>
            </Helmet>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['All', 'Pending', 'Resolved'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === tab 
                                    ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            {tab === 'All' ? 'All Inquiries' : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inbox List */}
                <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-semibold">Loading patient feedback...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-semibold">No feedback records found in this category.</div>
                    ) : (
                        filteredRequests.map((req, idx) => (
                            <div 
                                key={req._id || req.id || `req-${idx}`}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                    selectedRequest?._id === req._id 
                                    ? 'bg-sky-50/60 border-sky-300 shadow-sm' 
                                    : 'admin-card bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xs border border-sky-200">
                                            {req.name ? req.name[0] : 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{req.name}</div>
                                            <div className="text-[11px] text-slate-500 font-medium">{req.email}</div>
                                        </div>
                                    </div>
                                    <span className={`admin-badge ${req.status === 'Resolved' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-700 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    "{req.message}"
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Response Area */}
                <div className="admin-card bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 h-fit sticky top-6">
                    {selectedRequest ? (
                        <>
                            <div className="border-b border-slate-100 pb-4 mb-4">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <FaReply className="text-sky-600" /> Patient Message Resolution
                                </h3>
                                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-800 italic border-l-4 border-sky-600">
                                    {selectedRequest.message}
                                </div>
                            </div>

                            {selectedRequest.status === 'Resolved' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 border border-emerald-200">
                                        <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />
                                        <div>
                                            <div className="font-bold text-xs">Response Dispatched</div>
                                            <div className="mt-1 text-emerald-700 font-medium">{selectedRequest.solution}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRequest(null)}
                                        className="admin-btn-secondary w-full justify-center text-xs"
                                    >
                                        Close Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRespond} className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Resolution / Feedback Reply</label>
                                    <textarea 
                                        value={solution}
                                        onChange={(e) => setSolution(e.target.value)}
                                        className="admin-input w-full h-36 resize-none text-xs"
                                        placeholder="Compose administrative or clinical response to patient..."
                                        required
                                    ></textarea>
                                    <div className="flex gap-2.5 pt-1">
                                        <button 
                                            type="submit" 
                                            className="admin-btn-primary flex-1 justify-center text-xs"
                                        >
                                            <FaEnvelope /> Send Resolution
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedRequest(null)}
                                            className="admin-btn-secondary text-xs"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                                <FaHistory size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">Select an Inquiry</h3>
                            <p className="text-xs text-slate-500 max-w-[220px]">Choose any feedback record from the panel to compose a response.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManageFeedback;
