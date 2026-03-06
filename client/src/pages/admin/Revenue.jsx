import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCurrencyRupee, HiTrendingUp, HiCreditCard, HiRefresh } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

export default function AdminRevenue() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/admin/stats');
                if (res.data.success) setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading revenue data..." />;

    const stats = data?.stats || {};
    const monthlyRevenue = data?.monthlyRevenue || [];

    const statCards = [
        { label: 'Total Revenue', value: formatINR(stats.totalRevenue || 0), icon: HiCurrencyRupee, color: 'from-green-500 to-emerald-500' },
        { label: 'Transactions', value: (stats.totalTransactions || 0).toLocaleString('en-IN'), icon: HiCreditCard, color: 'from-purple-500 to-pink-500' },
        { label: 'Active Enrollments', value: (stats.activeEnrollments || 0).toLocaleString('en-IN'), icon: HiTrendingUp, color: 'from-blue-500 to-cyan-500' },
        { label: 'Pending Approvals', value: stats.pendingApprovals || 0, icon: HiRefresh, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Revenue Analytics</h1>
                <p className="text-text-secondary text-sm mt-1">Platform financial overview (₹ INR)</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Monthly Revenue Chart */}
            {monthlyRevenue.length > 0 && (
                <div className="glass-card">
                    <h2 className="font-bold text-text-primary mb-6">Monthly Revenue Trend</h2>
                    <div className="flex items-end gap-2 h-56">
                        {monthlyRevenue.map((item, i) => {
                            const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue));
                            const h = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
                            return (
                                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} className="flex-1 gradient-primary rounded-t-lg relative group cursor-pointer">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-surface-3 text-xs font-medium text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {formatINR(item.revenue)}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 mt-2 text-[10px] text-text-muted">
                        {monthlyRevenue.map((item, i) => (
                            <div key={i} className="flex-1 text-center">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id?.month - 1] || `M${i}`}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state for no revenue data */}
            {monthlyRevenue.length === 0 && (
                <div className="glass-card text-center py-12">
                    <p className="text-text-muted">No revenue data yet. Revenue will appear once students start enrolling.</p>
                </div>
            )}
        </div>
    );
}
