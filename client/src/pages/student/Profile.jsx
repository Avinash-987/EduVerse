import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { HiUser, HiMail, HiCamera, HiSave, HiPhone, HiLocationMarker, HiCheckCircle, HiExclamationCircle, HiTrash, HiPencil } from 'react-icons/hi';
import api from '../../services/api';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        bio: '',
        phone: '',
        location: '',
    });
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error'
    const [avatarPreview, setAvatarPreview] = useState('');

    // Load real profile data from DB on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.success) {
                    const u = res.data.user;
                    setForm({
                        name: u.name || '',
                        email: u.email || '',
                        bio: u.bio || '',
                        phone: u.phone || '',
                        location: u.location || '',
                    });
                    setAvatarPreview(u.avatar || '');
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                // Fall back to context data
                setForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    bio: user?.bio || '',
                    phone: user?.phone || '',
                    location: user?.location || '',
                });
                setAvatarPreview(user?.avatar || '');
            }
        };
        loadProfile();
    }, []);

    // Save profile details
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setStatus({ type: 'error', message: 'Name cannot be empty.' });
            return;
        }
        setSaving(true);
        setStatus({ type: '', message: '' });
        try {
            const res = await api.put('/users/profile', {
                name: form.name,
                bio: form.bio,
                phone: form.phone,
                location: form.location,
            });
            if (res.data.success) {
                updateUser(res.data.user);
                setStatus({ type: 'success', message: '✅ Profile updated successfully!' });
                setTimeout(() => setStatus({ type: '', message: '' }), 4000);
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    // Handle photo selection
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setStatus({ type: 'error', message: 'Only JPG, PNG, or WebP images are allowed.' });
            return;
        }
        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setStatus({ type: 'error', message: 'Image must be smaller than 2MB.' });
            return;
        }

        uploadPhoto(file);
    };

    // Upload photo to backend
    const uploadPhoto = async (file) => {
        setUploadingPhoto(true);
        setStatus({ type: '', message: '' });
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await api.put('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setAvatarPreview(res.data.user.avatar);
                updateUser(res.data.user);
                setStatus({ type: 'success', message: '📸 Photo updated successfully!' });
                setTimeout(() => setStatus({ type: '', message: '' }), 4000);
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to upload photo.' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Remove photo
    const handleRemovePhoto = async () => {
        setUploadingPhoto(true);
        try {
            const res = await api.delete('/users/avatar');
            if (res.data.success) {
                setAvatarPreview('');
                updateUser(res.data.user);
                setStatus({ type: 'success', message: 'Photo removed.' });
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to remove photo.' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div className="page-transition space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
                <p className="text-text-secondary text-sm mt-1">Manage your account information</p>
            </div>

            {/* Status Message */}
            {status.message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${status.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}
                >
                    {status.type === 'success' ? <HiCheckCircle className="text-lg shrink-0" /> : <HiExclamationCircle className="text-lg shrink-0" />}
                    {status.message}
                </motion.div>
            )}

            <div className="glass-card">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt={form.name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-200 dark:border-primary-800"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                                {form.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}

                        {/* Upload overlay */}
                        <div
                            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            {uploadingPhoto ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <HiCamera className="text-white text-xl" />
                            )}
                        </div>

                        {/* Camera badge */}
                        <button
                            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                            {uploadingPhoto ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <HiCamera className="text-xs" />
                            )}
                        </button>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h2 className="font-bold text-text-primary text-lg">{form.name || user?.name}</h2>
                        <p className="text-sm text-text-muted capitalize">{user?.role}</p>
                        <div className="flex gap-2 mt-1.5">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                                <HiPencil /> Change photo
                            </button>
                            {avatarPreview && (
                                <button
                                    onClick={handleRemovePhoto}
                                    disabled={uploadingPhoto}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                    <HiTrash /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-text-muted mb-4">JPG, PNG, or WebP. Max 2MB.</p>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                            <div className="relative">
                                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field !pl-10"
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                            <div className="relative">
                                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={form.email}
                                    className="input-field !pl-10 opacity-60 cursor-not-allowed"
                                    disabled
                                    title="Email cannot be changed"
                                />
                            </div>
                            <p className="text-[11px] text-text-muted mt-1">Email cannot be changed</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Tell us about yourself..."
                            maxLength={500}
                        />
                        <p className="text-[11px] text-text-muted mt-1">{form.bio.length}/500 characters</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
                            <div className="relative">
                                <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input-field !pl-10"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Location</label>
                            <div className="relative">
                                <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="input-field !pl-10"
                                    placeholder="e.g., Mumbai, India"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <HiSave /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Info Card */}
            <div className="glass-card">
                <h3 className="font-semibold text-text-primary mb-3">Account Information</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-surface-2 dark:bg-surface-3">
                        <p className="text-text-muted text-xs mb-1">Role</p>
                        <p className="text-text-primary font-medium capitalize">{user?.role}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-2 dark:bg-surface-3">
                        <p className="text-text-muted text-xs mb-1">Country</p>
                        <p className="text-text-primary font-medium">{user?.country || 'India'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-2 dark:bg-surface-3">
                        <p className="text-text-muted text-xs mb-1">Timezone</p>
                        <p className="text-text-primary font-medium">{user?.timezone || 'Asia/Kolkata'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-2 dark:bg-surface-3">
                        <p className="text-text-muted text-xs mb-1">Member since</p>
                        <p className="text-text-primary font-medium">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long' }) : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
