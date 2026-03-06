import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiPlay, HiBookOpen } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

export default function StudentMyCourses() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/enrollments/my');
                if (res.data.success) setEnrollments(res.data.enrollments);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading your courses..." />;

    return (
        <div className="page-transition space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">My Courses</h1>
                <Link to="/courses" className="btn-primary text-sm">Browse Courses</Link>
            </div>

            {enrollments.length === 0 ? (
                <EmptyState
                    icon={HiBookOpen}
                    title="No courses enrolled yet"
                    message="You haven't enrolled in any course yet. Browse our catalog to find courses that match your interests."
                    actionLabel="Browse Courses"
                    actionPath="/courses"
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {enrollments.map((enrollment) => {
                        const course = enrollment.course;
                        return (
                            <motion.div key={enrollment._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card !p-0 overflow-hidden group">
                                <div className="relative h-40 overflow-hidden">
                                    <img src={course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary-500/90 text-white font-medium">{course?.category}</span>
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white">{course?.level}</span>
                                    </div>
                                    <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
                                        <HiPlay className="text-white text-lg ml-0.5" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-2">{course?.title}</h3>
                                    <p className="text-xs text-text-muted mb-1">{course?.instructor?.name || 'Instructor'}</p>
                                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                                        <span>⭐ {course?.rating?.toFixed(1) || '—'}</span>
                                        <span>•</span>
                                        <span>{formatINR(course?.price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <span className="text-text-muted">Progress</span>
                                        <span className="font-semibold text-primary-600">{enrollment.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-3">
                                        <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                                    </div>
                                    <Link to={`/courses/${course?._id}`} className="text-sm text-primary-600 hover:underline font-medium">Continue Learning →</Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
