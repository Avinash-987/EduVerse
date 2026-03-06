import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_LINKS } from '../../utils/constants';
import { HiMenu, HiX, HiMoon, HiSun, HiUser, HiLogout, HiAcademicCap } from 'react-icons/hi';

export default function Navbar() {
    const { darkMode, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location]);

    const getDashboardPath = () => {
        if (!user) return '/login';
        return `/${user.role}/dashboard`;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <HiAcademicCap className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold gradient-text">EduVerse</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${location.pathname === link.path
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                    : 'text-text-secondary hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl glass hover:scale-105 transition-all"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? (
                                <HiSun className="text-amber-400 text-lg" />
                            ) : (
                                <HiMoon className="text-indigo-600 text-lg" />
                            )}
                        </button>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl glass hover:scale-105 transition-all"
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-sm font-medium text-text-primary">{user.name.split(' ')[0]}</span>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-56 glass rounded-xl py-2 shadow-xl"
                                        >
                                            <div className="px-4 py-2 border-b border-border">
                                                <p className="font-semibold text-text-primary">{user.name}</p>
                                                <p className="text-xs text-text-muted capitalize">{user.role}</p>
                                            </div>
                                            <Link
                                                to={getDashboardPath()}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all"
                                            >
                                                <HiUser /> Dashboard
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                            >
                                                <HiLogout /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-primary-600 transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary text-sm !py-2 !px-5 inline-block">
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-xl glass"
                        >
                            {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-border"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="block px-4 py-2 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <>
                                    <Link to="/login" className="block px-4 py-2 text-text-secondary">Sign In</Link>
                                    <Link to="/register" className="block btn-primary text-center text-sm !py-2 mt-2">Get Started</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
