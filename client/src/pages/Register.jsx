import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register, loading, error, setError } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.name || !form.email || !form.password) return setError('Please fill in all fields');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');

        const success = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
        if (success) navigate(`/${form.role}/dashboard`);
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
                    <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
                    <p className="text-text-muted text-sm mt-1">Start your learning journey today</p>
                </div>

                {/* Role Selection */}
                <div className="flex gap-2 mb-5">
                    {[
                        { value: 'student', label: '🎓 Student', desc: 'Learn & grow' },
                        { value: 'faculty', label: '👨‍🏫 Faculty', desc: 'Teach & earn' },
                    ].map(r => (
                        <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                            className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${form.role === r.value ? 'border-primary-500 bg-primary-500/10' : 'border-border hover:border-primary-300'}`}>
                            <div className="text-lg mb-0.5">{r.label}</div>
                            <div className="text-[10px] text-text-muted">{r.desc}</div>
                        </button>
                    ))}
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                        <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="input-field !pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                        <div className="relative">
                            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-field !pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" className="input-field !pl-10 !pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"><HiEye /></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" className="input-field !pl-10" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-text-muted text-sm mt-6">
                    Already have an account? <Link to="/login" className="text-primary-500 hover:underline font-medium">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
}
