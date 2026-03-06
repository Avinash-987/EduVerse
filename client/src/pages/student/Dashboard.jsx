import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiBookOpen, HiAcademicCap, HiChat, HiClock, HiTrendingUp, HiPlay, HiLightBulb, HiClipboardList } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/enrollments/my-dashboard');
                if (res.data.success) setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <LoadingSpinner text="Loading your dashboard..." />;
    if (error) return <div className="text-center py-20 text-red-400">{error}</div>;

    const stats = [
        { label: 'Enrolled Courses', value: data?.stats?.enrolledCount || 0, icon: HiBookOpen, color: 'from-blue-500 to-cyan-500' },
        { label: 'Completed', value: data?.stats?.completedCount || 0, icon: HiAcademicCap, color: 'from-green-500 to-emerald-500' },
        { label: 'Hours Learned', value: data?.stats?.hoursLearned || 0, icon: HiClock, color: 'from-purple-500 to-pink-500' },
        { label: 'Assignments', value: data?.stats?.assignmentCount || 0, icon: HiClipboardList, color: 'from-amber-500 to-orange-500' },
    ];

    const enrolledCourses = data?.enrollments || [];
    const liveClasses = data?.liveClasses || [];

    return (
        <div className="page-transition space-y-6">
            {/* Welcome */}
            <motion.div {...fadeIn} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-text-secondary mt-1">Continue your learning journey</p>
                </div>
                <Link to="/student/ai-tutor" className="btn-primary inline-flex items-center gap-2 text-sm">
                    <HiLightBulb /> Ask AI Tutor
                </Link>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="text-lg" />
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Continue Learning */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Continue Learning</h2>
                    <Link to="/student/courses" className="text-sm text-primary-600 hover:underline">View All</Link>
                </div>

                {enrolledCourses.length === 0 ? (
                    <EmptyState
                        icon={HiBookOpen}
                        title="No courses enrolled yet"
                        message="Start your learning journey by exploring our courses. We have everything from UPSC to Web Development!"
                        actionLabel="Browse Courses"
                        actionPath="/courses"
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrolledCourses.slice(0, 6).map((enrollment) => (
                            <div key={enrollment._id} className="glass-card !p-0 overflow-hidden group">
                                <div className="relative h-36 overflow-hidden">
                                    <img src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={enrollment.course?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
                                        <HiPlay className="text-white text-lg ml-0.5" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{enrollment.course?.title}</h3>
                                    <p className="text-xs text-text-muted mb-3">{enrollment.course?.instructor?.name || 'Instructor'}</p>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <span className="text-text-muted">Progress</span>
                                        <span className="font-semibold text-primary-600">{enrollment.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                                        <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: HiLightBulb, label: 'AI Tutor', path: '/student/ai-tutor', color: 'from-violet-500 to-purple-600' },
                        { icon: HiChat, label: 'Messages', path: '/student/chat', color: 'from-blue-500 to-cyan-600' },
                        { icon: HiClipboardList, label: 'Assignments', path: '/student/assignments', color: 'from-amber-500 to-orange-600' },
                        { icon: HiTrendingUp, label: 'Progress', path: '/student/courses', color: 'from-green-500 to-emerald-600' },
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

            {/* Upcoming Live Classes */}
            <motion.div {...fadeIn} transition={{ delay: 0.55 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Upcoming</h2>
                {liveClasses.length === 0 ? (
                    <div className="glass-card text-center py-8">
                        <p className="text-text-muted text-sm">No live classes scheduled</p>
                    </div>
                ) : (
                    <div className="glass-card space-y-4">
                        {liveClasses.map((lc) => (
                            <div key={lc._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-2/50 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-text-primary">{lc.title}</p>
                                    <p className="text-xs text-text-muted">{new Date(lc.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-md bg-surface-2 text-text-muted">Live Class</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
