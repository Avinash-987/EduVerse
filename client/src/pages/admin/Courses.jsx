import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiBookOpen, HiSearch, HiEye, HiBan } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatINR } from '../../utils/constants';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const params = search ? `?search=${search}` : '?limit=50';
                const res = await api.get(`/courses${params}`);
                if (res.data.success) setCourses(res.data.courses);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        const debounce = setTimeout(fetch, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Course Management</h1>
                <p className="text-text-secondary text-sm mt-1">Manage all courses on the platform</p>
            </div>

            <div className="glass-card !p-4">
                <div className="relative">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-10" />
                </div>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading courses..." />
            ) : courses.length === 0 ? (
                <EmptyState
                    icon={HiBookOpen}
                    title="No courses found"
                    message={search ? 'Try a different search term.' : 'No courses have been created on the platform yet.'}
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, i) => {
                        const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : 'Instructor';
                        return (
                            <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card !p-0 overflow-hidden">
                                <div className="h-36 overflow-hidden relative">
                                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium text-white ${course.isPublished ? 'bg-green-500/90' : 'bg-amber-500/90'}`}>
                                        {course.isPublished ? 'Active' : 'Draft'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{course.title}</h3>
                                    <p className="text-xs text-text-muted mb-2">{instructorName}</p>
                                    <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                                        <span>👥 {(course.enrolledCount || 0).toLocaleString('en-IN')}</span>
                                        <span>⭐ {course.rating?.toFixed(1) || '—'}</span>
                                        <span>💰 {formatINR(course.price)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 btn-secondary !py-1.5 text-xs flex items-center justify-center gap-1"><HiEye /> View</button>
                                        <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><HiBan /></button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
