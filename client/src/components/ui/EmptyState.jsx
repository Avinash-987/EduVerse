import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBookOpen, HiAcademicCap, HiSearch } from 'react-icons/hi';

export default function EmptyState({ icon: Icon = HiBookOpen, title, message, actionLabel, actionPath }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center py-12 px-6"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-5">
                <Icon className="text-3xl text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-6">{message}</p>
            {actionLabel && actionPath && (
                <Link to={actionPath} className="btn-primary inline-flex items-center gap-2">
                    <HiSearch className="text-sm" /> {actionLabel}
                </Link>
            )}
        </motion.div>
    );
}
