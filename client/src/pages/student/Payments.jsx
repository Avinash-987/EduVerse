import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCreditCard, HiDownload, HiCurrencyRupee } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

export default function StudentPayments() {
    const [payments, setPayments] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/payments/my');
                if (res.data.success) {
                    setPayments(res.data.payments);
                    setTotalSpent(res.data.totalSpent || 0);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading payments..." />;

    const completedPayments = payments.filter(p => p.status === 'completed');

    const statCards = [
        { label: 'Total Spent', value: formatINR(totalSpent), icon: HiCurrencyRupee, color: 'from-blue-500 to-cyan-500' },
        { label: 'Transactions', value: completedPayments.length, icon: HiCreditCard, color: 'from-green-500 to-emerald-500' },
        { label: 'Invoices', value: completedPayments.length, icon: HiDownload, color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="page-transition space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">Payment History</h1>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="text-lg" />
                        </div>
                        <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {payments.length === 0 ? (
                <EmptyState
                    icon={HiCreditCard}
                    title="No payments yet"
                    message="Once you enroll in a course, your payment history will appear here."
                    actionLabel="Browse Courses"
                    actionPath="/courses"
                />
            ) : (
                <div className="glass-card !p-0 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-text-muted p-4">Course</th>
                                <th className="text-left text-xs font-medium text-text-muted p-4">Amount</th>
                                <th className="text-left text-xs font-medium text-text-muted p-4">Date</th>
                                <th className="text-left text-xs font-medium text-text-muted p-4">Status</th>
                                <th className="text-left text-xs font-medium text-text-muted p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id} className="border-b border-border/50 hover:bg-surface-2/50">
                                    <td className="p-4">
                                        <p className="font-medium text-text-primary text-sm line-clamp-1">{payment.course?.title || 'Course'}</p>
                                        <p className="text-xs text-text-muted">{payment.paymentMethod || '—'}</p>
                                    </td>
                                    <td className="p-4 font-semibold text-text-primary text-sm">{formatINR(payment.amount)}</td>
                                    <td className="p-4 text-sm text-text-muted">{new Date(payment.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${payment.status === 'completed' ? 'bg-green-500/10 text-green-500' : payment.status === 'refunded' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {payment.status === 'completed' && (
                                            <button className="text-xs text-primary-500 hover:underline flex items-center gap-1"><HiDownload /> Invoice</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
