import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiAcademicCap, HiArrowLeft } from 'react-icons/hi';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await new Promise(r => setTimeout(r, 1000));
        setSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-24">
            <div className="floating-orb w-[500px] h-[500px] bg-primary-500/20 top-[-200px] right-[-200px]" />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
                <div className="glass-card !p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <HiAcademicCap className="text-white text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary">{sent ? 'Check Your Email' : 'Reset Password'}</h1>
                        <p className="text-sm text-text-muted mt-1">
                            {sent ? 'We sent a password reset link to your email' : 'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center">
                            <div className="text-5xl mb-4">📧</div>
                            <p className="text-sm text-text-secondary mb-6">Didn't receive the email? Check your spam folder or try again.</p>
                            <button onClick={() => setSent(false)} className="btn-secondary w-full text-center">Try Again</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                                <div className="relative">
                                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field !pl-10" required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full text-center">Send Reset Link</button>
                        </form>
                    )}

                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary-600 mt-6 transition-colors">
                        <HiArrowLeft /> Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
