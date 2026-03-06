import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChartBar, HiTrendingUp, HiUsers, HiCurrencyRupee, HiAcademicCap } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatINR } from '../../utils/constants';

export default function FacultyAnalytics() {
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

    if (loading) return <LoadingSpinner text="Loading analytics..." />;

    const stats = data?.stats || {};
    const courses = data?.courses || [];

    const statCards = [
        { label: 'Total Revenue', value: formatINR(stats.totalRevenue || 0), icon: HiCurrencyRupee, color: 'from-green-500 to-emerald-500' },
        { label: 'Total Students', value: (stats.totalStudents || 0).toLocaleString('en-IN'), icon: HiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: 'Published Courses', value: stats.publishedCourses || 0, icon: HiAcademicCap, color: 'from-purple-500 to-pink-500' },
        { label: 'Avg Rating', value: stats.avgRating ? `${stats.avgRating}/5` : '—', icon: HiTrendingUp, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
                <p className="text-text-secondary text-sm mt-1">Track your teaching performance and revenue (₹ INR)</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="text-lg" />
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Course Performance */}
            <div className="glass-card">
                <h2 className="font-bold text-text-primary mb-4">Course Performance</h2>
                {courses.length === 0 ? (
                    <EmptyState icon={HiChartBar} title="No course data" message="Create courses to see performance analytics here." actionLabel="Create Course" actionPath="/faculty/create-course" />
                ) : (
                    <div className="space-y-4">
                        {courses.map((course) => {
                            const revenue = (course.price || 0) * (course.enrolledCount || 0);
                            return (
                                <div key={course._id} className="p-4 rounded-xl bg-surface-2 dark:bg-surface-3 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary text-sm">{course.title}</h3>
                                        <div className="flex gap-4 mt-1 text-xs text-text-muted">
                                            <span>👥 {(course.enrolledCount || 0).toLocaleString('en-IN')}</span>
                                            <span>💰 {formatINR(revenue)}</span>
                                            <span>⭐ {course.rating?.toFixed(1) || '—'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${course.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
