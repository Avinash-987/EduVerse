import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiMail, HiClipboardList } from 'react-icons/hi';

const PENDING_FACULTY = [
    { name: 'Dr. Robert Kim', email: 'robert.kim@university.edu', specialization: 'Machine Learning', experience: '8 years', applied: '2026-02-28', credentials: 'PhD in Computer Science, MIT' },
    { name: 'Prof. Maria Lopez', email: 'maria.lopez@college.edu', specialization: 'Web Development', experience: '12 years', applied: '2026-02-27', credentials: 'MSc Software Engineering, Stanford' },
    { name: 'Dr. Aisha Patel', email: 'aisha@techcorp.com', specialization: 'Cybersecurity', experience: '10 years', applied: '2026-02-25', credentials: 'CISSP, CEH, PhD Cybersecurity' },
    { name: 'John Anderson', email: 'john.a@startup.io', specialization: 'Mobile Development', experience: '6 years', applied: '2026-02-24', credentials: 'BSc CS, 3x Startup Founder' },
    { name: 'Dr. Li Wei', email: 'li.wei@research.org', specialization: 'Data Science', experience: '15 years', applied: '2026-02-22', credentials: 'PhD Statistics, Published 40+ Papers' },
];

export default function FacultyApproval() {
    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Faculty Approvals</h1>
                <p className="text-text-secondary text-sm mt-1">{PENDING_FACULTY.length} pending applications</p>
            </div>

            <div className="space-y-4">
                {PENDING_FACULTY.map((faculty, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                                    {faculty.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">{faculty.name}</h3>
                                    <p className="text-sm text-text-muted">{faculty.email}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs">{faculty.specialization}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-surface-3 text-text-muted text-xs">{faculty.experience}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-sm text-text-secondary">
                                <p className="flex items-center gap-1 mb-1"><HiClipboardList className="text-text-muted" /> {faculty.credentials}</p>
                                <p className="text-xs text-text-muted">Applied: {faculty.applied}</p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-1">
                                    <HiCheckCircle /> Approve
                                </button>
                                <button className="p-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <HiXCircle />
                                </button>
                                <button className="p-2 rounded-lg glass hover:scale-105 transition-all">
                                    <HiMail className="text-text-muted" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
