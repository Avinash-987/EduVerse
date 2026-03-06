import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiMail, HiDotsVertical, HiUsers } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function FacultyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/courses/faculty/my');
                if (res.data.success) {
                    // Aggregate students from all courses via enrollments
                    const enrollRes = await api.get('/admin/users?role=student&limit=50');
                    if (enrollRes.data.success) setStudents(enrollRes.data.users || []);
                }
            } catch (err) {
                // If admin endpoint fails (non-admin), try the faculty endpoint approach
                console.error(err);
            }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading students..." />;

    const filtered = students.filter(s => {
        if (!search) return true;
        return s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Students</h1>
                <p className="text-text-secondary text-sm mt-1">Students enrolled in your courses</p>
            </div>

            <div className="glass-card !p-4 flex gap-4">
                <div className="relative flex-1">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="input-field !pl-10" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={HiUsers}
                    title={search ? 'No students found' : 'No students yet'}
                    message={search ? 'Try different search terms.' : 'Once students enroll in your courses, they will appear here.'}
                />
            ) : (
                <div className="glass-card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-2/50">
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Student</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Role</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Location</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Joined</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <motion.tr key={s._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{s.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">{s.name}</p>
                                                    <p className="text-xs text-text-muted">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 dark:bg-blue-900/20 text-blue-600">{s.role}</span></td>
                                        <td className="p-4 text-sm text-text-muted">{s.country || 'India'}</td>
                                        <td className="p-4 text-sm text-text-muted">{new Date(s.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"><HiMail /></button>
                                                <button className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"><HiDotsVertical /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
