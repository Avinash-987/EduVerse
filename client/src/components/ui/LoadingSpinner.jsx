import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p className="text-text-muted text-sm">{text}</p>
        </motion.div>
    );
}
