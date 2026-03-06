import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiPencil, HiUsers, HiStar, HiCurrencyRupee, HiBookOpen } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

export default function FacultyMyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/courses/faculty/my');
                if (res.data.success) setCourses(res.data.courses);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading your courses..." />;

    return (
        <div className="page-transition space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">My Courses</h1>
                    <p className="text-text-secondary text-sm mt-1">Manage your published courses</p>
                </div>
                <Link to="/faculty/create-course" className="btn-primary text-sm">+ New Course</Link>
            </div>

            {courses.length === 0 ? (
                <EmptyState
                    icon={HiBookOpen}
                    title="No courses created yet"
                    message="Start building your first course and share your knowledge with students across India."
                    actionLabel="Create Course"
                    actionPath="/faculty/create-course"
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, i) => (
                        <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card !p-0 overflow-hidden">
                            <div className="h-40 overflow-hidden relative">
                                <img src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course.title} className="w-full h-full object-cover" />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-medium ${course.isPublished ? 'bg-green-500' : 'bg-amber-500'}`}>
                                    {course.isPublished ? 'Published' : 'Draft'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-text-primary mb-2">{course.title}</h3>
                                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                                    <div className="p-2 rounded-lg bg-surface-2 dark:bg-surface-3">
                                        <HiUsers className="text-blue-500 mx-auto mb-1" />
                                        <p className="text-xs text-text-muted">{(course.enrolledCount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-surface-2 dark:bg-surface-3">
                                        <HiStar className="text-amber-500 mx-auto mb-1" />
                                        <p className="text-xs text-text-muted">{course.rating?.toFixed(1) || '—'}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-surface-2 dark:bg-surface-3">
                                        <HiCurrencyRupee className="text-green-500 mx-auto mb-1" />
                                        <p className="text-xs text-text-muted">{formatINR(course.price)}</p>
                                    </div>
                                </div>
                                <Link to={`/faculty/manage-course/${course._id}`} className="btn-secondary w-full flex items-center justify-center gap-1 !py-2 text-sm">
                                    <HiPencil /> Manage
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
