import { Link } from 'react-router-dom';
import { HiAcademicCap, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="relative bg-surface-2 border-t border-border overflow-hidden">
            {/* Decorative orb */}
            <div className="floating-orb w-96 h-96 bg-primary-500/20 -bottom-48 -right-48" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <HiAcademicCap className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold gradient-text">EduVerse</span>
                        </Link>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Empowering learners worldwide with AI-powered education. Transform your career with courses from industry experts.
                        </p>
                        <div className="flex gap-3">
                            {[FaTwitter, FaLinkedin, FaGithub, FaYoutube].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-muted hover:text-primary-500 hover:scale-110 transition-all">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Platform</h4>
                        <ul className="space-y-2">
                            {['Browse Courses', 'Become Instructor', 'Enterprise', 'Pricing', 'Blog'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-text-secondary hover:text-primary-500 transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {['Help Center', 'Documentation', 'Community', 'Terms of Service', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-text-secondary hover:text-primary-500 transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-text-secondary">
                                <HiMail className="text-primary-500" /> hello@eduverse.com
                            </li>
                            <li className="flex items-center gap-2 text-sm text-text-secondary">
                                <HiPhone className="text-primary-500" /> +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2 text-sm text-text-secondary">
                                <HiLocationMarker className="text-primary-500" /> San Francisco, CA
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-muted">
                        © {new Date().getFullYear()} EduVerse. All rights reserved.
                    </p>
                    <p className="text-sm text-text-muted flex items-center gap-1">
                        Built with <span className="text-red-500">❤</span> for learners everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
