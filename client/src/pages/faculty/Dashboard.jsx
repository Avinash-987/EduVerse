import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCurrencyRupee, HiUsers, HiBookOpen, HiStar, HiPlusCircle, HiPlay, HiTrendingUp, HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function FacultyDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/courses/faculty/my');
                if (res.data.success) setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

    const stats = [
        { label: 'Total Revenue', value: formatINR(data?.stats?.totalRevenue || 0), icon: HiCurrencyRupee, color: 'from-green-500 to-emerald-500' },
        { label: 'Total Students', value: data?.stats?.totalStudents || 0, icon: HiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Courses', value: data?.stats?.publishedCourses || 0, icon: HiBookOpen, color: 'from-purple-500 to-pink-500' },
        { label: 'Avg Rating', value: data?.stats?.avgRating || '—', icon: HiStar, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="page-transition space-y-6">
            <motion.div {...fadeIn} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                        Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-text-secondary mt-1">Manage your courses and students</p>
                </div>
                <Link to="/faculty/create-course" className="btn-primary inline-flex items-center gap-2 text-sm">
                    <HiPlusCircle /> Create Course
                </Link>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="text-lg" />
                        </div>
                        <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* My Courses */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">My Courses</h2>
                    <Link to="/faculty/courses" className="text-sm text-primary-600 hover:underline">View All</Link>
                </div>

                {(data?.courses?.length || 0) === 0 ? (
                    <EmptyState
                        icon={HiBookOpen}
                        title="No courses created yet"
                        message="Start sharing your knowledge! Create your first course and reach thousands of students across India."
                        actionLabel="Create Course"
                        actionPath="/faculty/create-course"
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.courses.slice(0, 3).map((course) => (
                            <div key={course._id} className="glass-card !p-0 overflow-hidden">
                                <div className="relative h-32 overflow-hidden">
                                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${course.isPublished ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary text-sm mb-2 line-clamp-1">{course.title}</h3>
                                    <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span>👥 {course.enrolledCount || 0} students</span>
                                        <span>⭐ {course.rating?.toFixed(1) || '—'}</span>
                                        <span className="font-semibold text-primary-500">{formatINR(course.price)}</span>
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
                        { icon: HiPlusCircle, label: 'Create Course', path: '/faculty/create-course', color: 'from-violet-500 to-purple-600' },
                        { icon: HiPlay, label: 'Start Live Class', path: '/faculty/live-class', color: 'from-red-500 to-pink-600' },
                        { icon: HiTrendingUp, label: 'View Analytics', path: '/faculty/analytics', color: 'from-blue-500 to-cyan-600' },
                        { icon: HiAcademicCap, label: 'Manage Students', path: '/faculty/students', color: 'from-green-500 to-emerald-600' },
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
