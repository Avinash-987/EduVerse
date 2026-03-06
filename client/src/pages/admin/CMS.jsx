import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPencil, HiTrash, HiPlusCircle, HiSave } from 'react-icons/hi';

const CMS_SECTIONS = [
    { id: 1, name: 'Hero Section', page: 'Landing', status: 'published', lastModified: '2026-02-28' },
    { id: 2, name: 'Features Section', page: 'Landing', status: 'published', lastModified: '2026-02-25' },
    { id: 3, name: 'FAQ Section', page: 'Landing', status: 'draft', lastModified: '2026-02-20' },
    { id: 4, name: 'About Page Content', page: 'About', status: 'published', lastModified: '2026-02-15' },
    { id: 5, name: 'Privacy Policy', page: 'Legal', status: 'published', lastModified: '2026-01-10' },
    { id: 6, name: 'Terms of Service', page: 'Legal', status: 'draft', lastModified: '2026-01-05' },
];

export default function AdminCMS() {
    return (
        <div className="page-transition space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Content Management</h1>
                    <p className="text-text-secondary text-sm mt-1">Manage platform content and pages</p>
                </div>
                <button className="btn-primary inline-flex items-center gap-2 text-sm">
                    <HiPlusCircle /> New Section
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                            <th className="text-left p-4 text-sm font-semibold text-text-primary">Section</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-primary">Page</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-primary">Status</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-primary">Last Modified</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-primary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CMS_SECTIONS.map((section, i) => (
                            <motion.tr key={section.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                <td className="p-4 text-sm font-medium text-text-primary">{section.name}</td>
                                <td className="p-4 text-sm text-text-muted">{section.page}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${section.status === 'published' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                                        {section.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-text-muted">{section.lastModified}</td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        <button className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-primary-500"><HiPencil /></button>
                                        <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"><HiTrash /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
