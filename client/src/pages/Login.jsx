import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading, error, setError } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.email || !form.password) return setError('Please fill in all fields');
        const success = await login(form.email, form.password);
        if (success) {
            const user = JSON.parse(localStorage.getItem('eduverse-user'));
            navigate(`/${user?.role || 'student'}/dashboard`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md relative z-10">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl mx-auto mb-3">🎓</div>
                    <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
                    <p className="text-text-muted text-sm mt-1">Sign in to continue learning</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                        <div className="relative">
                            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-field !pl-10" autoComplete="email" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field !pl-10 !pr-10" autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 text-text-muted"><input type="checkbox" className="rounded" /> Remember me</label>
                        <Link to="/forgot-password" className="text-primary-500 hover:underline">Forgot Password?</Link>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-text-muted text-sm mt-6">
                    Don't have an account? <Link to="/register" className="text-primary-500 hover:underline font-medium">Sign Up</Link>
                </p>

                {/* Seed data login hint — remove in production */}
                <div className="mt-4 p-3 rounded-xl bg-surface-2 dark:bg-surface-3 text-xs text-text-muted">
                    <p className="font-medium text-text-secondary mb-1">🧪 Test Accounts (after seeding):</p>
                    <p>Student: student@eduverse.in / student123</p>
                    <p>Faculty: rajesh@eduverse.in / instructor123</p>
                    <p>Admin: admin@eduverse.in / admin123</p>
                </div>
            </motion.div>
        </div>
    );
}
