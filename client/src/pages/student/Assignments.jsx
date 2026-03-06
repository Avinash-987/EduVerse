import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiClipboardList, HiUpload, HiDownload } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentAssignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                // First get enrolled courses, then assignments for those courses
                const enrollRes = await api.get('/enrollments/my-dashboard');
                if (enrollRes.data.success) {
                    setAssignments(enrollRes.data.assignments || []);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading assignments..." />;

    // Get student's submission status for each assignment
    const getStudentSubmission = (assignment) => {
        return assignment.submissions?.find(s => s.student?.toString() === user?._id || s.student === user?._id);
    };

    const getStatus = (assignment) => {
        const submission = getStudentSubmission(assignment);
        if (submission?.status === 'graded') return 'graded';
        if (submission) return 'submitted';
        if (new Date(assignment.dueDate) < new Date()) return 'overdue';
        return 'pending';
    };

    const filteredAssignments = assignments.filter(a => {
        if (filter === 'all') return true;
        return getStatus(a) === filter;
    });

    const statusConfig = {
        submitted: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Submitted' },
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Pending' },
        graded: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Graded' },
        overdue: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Overdue' },
    };

    return (
        <div className="page-transition space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Assignments</h1>
                <div className="flex gap-2">
                    {['all', 'pending', 'submitted', 'graded'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? 'bg-primary-500 text-white' : 'glass-card !p-0 px-3 py-1.5 text-text-muted hover:text-text-primary'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredAssignments.length === 0 ? (
                <EmptyState
                    icon={HiClipboardList}
                    title={filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
                    message={filter === 'all' ? "Once you're enrolled in courses, assignments will appear here." : `No assignments with status "${filter}" found.`}
                    actionLabel={filter === 'all' ? 'Browse Courses' : undefined}
                    actionPath={filter === 'all' ? '/courses' : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {filteredAssignments.map((assignment) => {
                        const status = getStatus(assignment);
                        const submission = getStudentSubmission(assignment);
                        const config = statusConfig[status];
                        return (
                            <motion.div key={assignment._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-text-primary text-sm">{assignment.title}</h3>
                                    <p className="text-xs text-text-muted mt-1">{assignment.course?.title || 'Course'}</p>
                                    <p className="text-xs text-text-muted mt-0.5">Due: {new Date(assignment.dueDate).toLocaleString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })}</p>
                                    {submission?.score != null && (
                                        <p className="text-xs mt-1"><span className="text-green-500 font-semibold">Score: {submission.score}/{assignment.maxScore}</span> • Grade: {submission.grade}</p>
                                    )}
                                    {submission?.feedback && <p className="text-xs text-text-muted mt-1 italic">"{submission.feedback}"</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>{config.label}</span>
                                    {status === 'pending' && (
                                        <label className="btn-primary text-xs cursor-pointer inline-flex items-center gap-1">
                                            <HiUpload /> Upload PDF
                                            <input type="file" accept=".pdf" className="hidden" onChange={() => alert('File upload requires backend file storage (Cloudinary)')} />
                                        </label>
                                    )}
                                    {status === 'graded' && <button className="text-xs text-primary-500 flex items-center gap-1"><HiDownload /> Download</button>}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
