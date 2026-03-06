import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
    HiHome, HiBookOpen, HiAcademicCap, HiChat, HiVideoCamera,
    HiCreditCard, HiUser, HiCog, HiChartBar, HiUsers,
    HiClipboardList, HiPlusCircle, HiDocumentText, HiShieldCheck,
    HiLightBulb, HiCash, HiCollection, HiFlag, HiDesktopComputer,
    HiChevronLeft, HiChevronRight
} from 'react-icons/hi';

const MENU_ITEMS = {
    student: [
        { path: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
        { path: '/student/courses', icon: HiBookOpen, label: 'My Courses' },
        { path: '/student/assignments', icon: HiClipboardList, label: 'Assignments' },
        { path: '/student/ai-tutor', icon: HiLightBulb, label: 'AI Tutor' },
        { path: '/student/chat', icon: HiChat, label: 'Messages' },
        { path: '/student/live-class', icon: HiVideoCamera, label: 'Live Classes' },
        { path: '/student/payments', icon: HiCreditCard, label: 'Payments' },
        { path: '/student/profile', icon: HiUser, label: 'Profile' },
    ],
    faculty: [
        { path: '/faculty/dashboard', icon: HiHome, label: 'Dashboard' },
        { path: '/faculty/courses', icon: HiBookOpen, label: 'My Courses' },
        { path: '/faculty/create-course', icon: HiPlusCircle, label: 'Create Course' },
        { path: '/faculty/students', icon: HiUsers, label: 'Students' },
        { path: '/faculty/assignments', icon: HiClipboardList, label: 'Assignments' },
        { path: '/faculty/live-class', icon: HiVideoCamera, label: 'Live Class' },
        { path: '/faculty/analytics', icon: HiChartBar, label: 'Analytics' },
        { path: '/faculty/profile', icon: HiUser, label: 'Profile' },
    ],
    admin: [
        { path: '/admin/dashboard', icon: HiHome, label: 'Dashboard' },
        { path: '/admin/users', icon: HiUsers, label: 'Users' },
        { path: '/admin/courses', icon: HiBookOpen, label: 'Courses' },
        { path: '/admin/faculty-approval', icon: HiShieldCheck, label: 'Approvals' },
        { path: '/admin/revenue', icon: HiCash, label: 'Revenue' },
        { path: '/admin/reports', icon: HiFlag, label: 'Reports' },
        { path: '/admin/cms', icon: HiCollection, label: 'CMS' },
        { path: '/admin/profile', icon: HiUser, label: 'Profile' },
    ],
};

export default function Sidebar() {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const items = MENU_ITEMS[user?.role] || [];

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 260 : 72 }}
            className="fixed left-0 top-16 lg:top-20 bottom-0 z-40 glass border-r border-border flex flex-col"
        >
            {/* Toggle Button */}
            <button
                onClick={() => dispatch(toggleSidebar())}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full gradient-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
            >
                {sidebarOpen ? <HiChevronLeft className="text-xs" /> : <HiChevronRight className="text-xs" />}
            </button>

            {/* User Info */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="overflow-hidden"
                            >
                                <p className="font-semibold text-sm text-text-primary truncate">{user?.name}</p>
                                <p className="text-xs text-text-muted capitalize">{user?.role}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center !px-2' : ''}`
                        }
                        title={!sidebarOpen ? item.label : undefined}
                    >
                        <item.icon className="text-lg shrink-0" />
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm whitespace-nowrap overflow-hidden"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            {sidebarOpen && (
                <div className="p-4 border-t border-border">
                    <p className="text-xs text-text-muted text-center">EduVerse v1.0</p>
                </div>
            )}
        </motion.aside>
    );
}
