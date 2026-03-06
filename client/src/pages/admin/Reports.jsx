import { motion } from 'framer-motion';
import { HiFlag, HiExclamation, HiCheckCircle, HiEye } from 'react-icons/hi';

const REPORTS = [
    { id: 1, type: 'Content', title: 'Inappropriate content in course discussion', reporter: 'Alice J.', course: 'React Masterclass', status: 'open', date: '2026-02-28', severity: 'high' },
    { id: 2, type: 'User', title: 'Spam messages in group chat', reporter: 'Bob S.', course: 'Python for Data Science', status: 'investigating', date: '2026-02-27', severity: 'medium' },
    { id: 3, type: 'Payment', title: 'Unauthorized charge reported', reporter: 'Carol W.', course: 'Cloud Architecture', status: 'resolved', date: '2026-02-25', severity: 'high' },
    { id: 4, type: 'Content', title: 'Broken video link in module 3', reporter: 'David L.', course: 'Mobile Dev', status: 'open', date: '2026-02-24', severity: 'low' },
];

const statusStyles = {
    open: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    investigating: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    resolved: 'bg-green-50 dark:bg-green-900/20 text-green-600',
};

export default function AdminReports() {
    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Reports & Monitoring</h1>
                <p className="text-text-secondary text-sm mt-1">Review and manage platform reports</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open', count: 2, color: 'text-red-500' },
                    { label: 'Investigating', count: 1, color: 'text-amber-500' },
                    { label: 'Resolved', count: 1, color: 'text-green-500' },
                ].map((s, i) => (
                    <div key={i} className="stat-card text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-sm text-text-muted">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {REPORTS.map((report, i) => (
                    <motion.div key={report.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.severity === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : report.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-500' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-500'}`}>
                            <HiFlag />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-text-primary text-sm">{report.title}</h3>
                            <p className="text-xs text-text-muted">By {report.reporter} • {report.course} • {report.date}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[report.status]}`}>{report.status}</span>
                            <button className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1"><HiEye /> Review</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
