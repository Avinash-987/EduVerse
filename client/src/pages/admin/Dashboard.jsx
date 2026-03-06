import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiUsers, HiBookOpen, HiCurrencyRupee, HiTrendingUp, HiExclamation, HiShieldCheck, HiUserGroup, HiServer } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
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

    if (loading) return <LoadingSpinner text="Loading platform data..." />;

    const stats = data?.stats || {};
    const statCards = [
        { label: 'Total Users', value: stats.totalUsers || 0, icon: HiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: 'Total Courses', value: stats.totalCourses || 0, icon: HiBookOpen, color: 'from-purple-500 to-pink-500' },
        { label: 'Total Revenue', value: formatINR(stats.totalRevenue || 0), icon: HiCurrencyRupee, color: 'from-green-500 to-emerald-500' },
        { label: 'Active Enrollments', value: stats.activeEnrollments || 0, icon: HiTrendingUp, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="page-transition space-y-6">
            <motion.div {...fadeIn}>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Platform Overview</h1>
                <p className="text-text-secondary mt-1">Admin Dashboard — India Region (INR)</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="text-lg" />
                        </div>
                        <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Pending Actions */}
            {(stats.pendingApprovals > 0) && (
                <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                    <h2 className="text-xl font-bold text-text-primary mb-4">Pending Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {stats.pendingApprovals > 0 && (
                            <Link to="/admin/faculty-approval" className="glass-card border-l-4 border-amber-500">
                                <div className="flex items-center gap-3">
                                    <HiExclamation className="text-amber-500 text-xl" />
                                    <div>
                                        <p className="font-semibold text-text-primary text-sm">{stats.pendingApprovals} Faculty Approval{stats.pendingApprovals > 1 ? 's' : ''}</p>
                                        <p className="text-xs text-text-muted">Pending review</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}

            {/* User Distribution */}
            <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="grid md:grid-cols-2 gap-6">
                <div className="glass-card">
                    <h3 className="text-lg font-bold text-text-primary mb-4">User Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Students', count: stats.totalStudents || 0, color: 'bg-blue-500', icon: '🎓' },
                            { label: 'Faculty', count: stats.totalFaculty || 0, color: 'bg-purple-500', icon: '👨‍🏫' },
                            { label: 'Admins', count: (stats.totalUsers || 0) - (stats.totalStudents || 0) - (stats.totalFaculty || 0), color: 'bg-amber-500', icon: '👑' },
                        ].map((item) => {
                            const pct = stats.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-text-primary">{item.icon} {item.label}</span>
                                        <span className="text-text-muted">{item.count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="glass-card">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Recent Users</h3>
                    {(data?.recentUsers?.length || 0) === 0 ? (
                        <p className="text-text-muted text-sm">No users yet</p>
                    ) : (
                        <div className="space-y-3">
                            {data.recentUsers.map((u) => (
                                <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2/50">
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-500">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-text-primary">{u.name}</p>
                                        <p className="text-[10px] text-text-muted">{u.email}</p>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted capitalize">{u.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Management</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: HiUsers, label: 'Users', path: '/admin/users', color: 'from-blue-500 to-cyan-600' },
                        { icon: HiBookOpen, label: 'Courses', path: '/admin/courses', color: 'from-purple-500 to-pink-600' },
                        { icon: HiShieldCheck, label: 'Faculty Approvals', path: '/admin/faculty-approval', color: 'from-amber-500 to-orange-600' },
                        { icon: HiCurrencyRupee, label: 'Revenue', path: '/admin/revenue', color: 'from-green-500 to-emerald-600' },
                    ].map((action, i) => (
                        <Link key={i} to={action.path} className="glass-card text-center group cursor-pointer">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                <action.icon className="text-xl" />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
