import React, { useState, useEffect } from 'react';
import api from '../../../../core/api/config';
import AdminLayout from '../layout/AdminLayout';
import { FaCloudUploadAlt, FaSave, FaShieldAlt, FaPalette, FaUserShield } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { toast } from '../../../shared/components/ui/ToastContext';

const AdminSettings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [profile, setProfile] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/admin/profile');
            setProfile({ ...res.data, password: '' }); // Don't show password
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('/admin/profile', profile);
            toast.success('Admin profile updated successfully!', { title: 'Settings Saved' });
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update profile. Please try again.');
        }
    };
    
    return (
        <AdminLayout title="System Settings" subtitle="Manage your administrative credentials and clinic configuration">
            <Helmet>
                <title>Settings - HealingWave Admin</title>
            </Helmet>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidemenu */}
                <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
                    {[
                        { id: 'profile', label: 'Admin Profile', icon: <FaUserShield /> },
                        { id: 'security', label: 'Security & Access', icon: <FaShieldAlt /> },
                        { id: 'branding', label: 'Clinic Customization', icon: <FaPalette /> },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs ${
                                activeSection === item.id 
                                ? 'bg-sky-600 text-white shadow-sm' 
                                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
                            }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="admin-card flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-semibold">Loading system settings...</div>
                    ) : activeSection === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">Administrative Profile</h3>
                                <p className="text-xs text-slate-500">Update your primary hospital administrator credentials and identity</p>
                            </div>
                            
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-xl">
                                    {profile.name ? profile.name[0] : 'A'}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="font-extrabold text-slate-900 text-base">{profile.name || 'System Administrator'}</div>
                                    <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Super Administrator • Root Level</div>
                                    <div className="text-xs text-slate-500 font-medium">{profile.email}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Display Name</label>
                                    <input 
                                        className="admin-input w-full text-xs" 
                                        value={profile.name} 
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Email Address</label>
                                    <input 
                                        className="admin-input w-full text-xs" 
                                        value={profile.email} 
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                                    <button type="submit" className="admin-btn-primary text-xs">
                                        <FaSave /> Save Profile Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">System Security & Access Controls</h3>
                                <p className="text-xs text-slate-500">Configure authentication timeouts and credentials</p>
                            </div>
                            <div className="space-y-3">
                                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">Account Password</div>
                                        <div className="text-xs text-slate-500">Administrator authentication key</div>
                                    </div>
                                    <button type="button" className="admin-btn-secondary text-xs">Update Key</button>
                                </div>
                                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">Session Timeout</div>
                                        <div className="text-xs text-slate-500">Automatic logout period: 30 minutes</div>
                                    </div>
                                    <button type="button" className="admin-btn-secondary text-xs">Configure</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'branding' && (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                                <FaPalette size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Hospital Portal Theming Engine</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Hospital custom color scheme, logo branding, and department color profiles are configured via system administrator.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
