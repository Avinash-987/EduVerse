import { motion } from 'framer-motion';
import { HiCheckCircle, HiClock, HiDownload, HiEye } from 'react-icons/hi';

const SUBMISSIONS = [
    { student: 'Alice Johnson', assignment: 'React Component Architecture', course: 'React Masterclass', submitted: '2026-02-28', status: 'pending', file: 'assignment_1.pdf' },
    { student: 'Bob Smith', assignment: 'React Component Architecture', course: 'React Masterclass', submitted: '2026-02-27', status: 'graded', grade: 'A', file: 'bob_assignment.pdf' },
    { student: 'Carol White', assignment: 'Cloud Security Analysis', course: 'Cloud Architecture', submitted: '2026-02-26', status: 'pending', file: 'carol_security.pdf' },
    { student: 'David Lee', assignment: 'React Component Architecture', course: 'React Masterclass', submitted: '2026-02-25', status: 'graded', grade: 'B+', file: 'david_hw.pdf' },
];

export default function FacultyAssignments() {
    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Assignments</h1>
                <p className="text-text-secondary text-sm mt-1">Review and grade student submissions</p>
            </div>

            <div className="flex gap-3 mb-4">
                <button className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">All</button>
                <button className="px-4 py-2 rounded-lg glass text-sm text-text-secondary hover:text-primary-600">Pending</button>
                <button className="px-4 py-2 rounded-lg glass text-sm text-text-secondary hover:text-primary-600">Graded</button>
            </div>

            <div className="space-y-4">
                {SUBMISSIONS.map((sub, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">{sub.student.charAt(0)}</div>
                            <div>
                                <p className="font-semibold text-text-primary text-sm">{sub.student}</p>
                                <p className="text-xs text-text-muted">{sub.assignment} • {sub.course}</p>
                                <p className="text-xs text-text-muted">Submitted: {sub.submitted}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {sub.status === 'graded' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-medium">
                                    <HiCheckCircle /> Graded: {sub.grade}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-xs font-medium">
                                    <HiClock /> Pending Review
                                </span>
                            )}
                            <button className="p-2 rounded-lg glass hover:scale-105 transition-all" title="View"><HiEye className="text-text-muted" /></button>
                            <button className="p-2 rounded-lg glass hover:scale-105 transition-all" title="Download"><HiDownload className="text-text-muted" /></button>
                            {sub.status === 'pending' && (
                                <button className="btn-primary !py-1.5 !px-3 text-xs">Grade</button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
