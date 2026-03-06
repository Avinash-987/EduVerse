import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiArrowRight, HiStar, HiLightningBolt, HiGlobe, HiShieldCheck, HiChat, HiAcademicCap } from 'react-icons/hi';
import { PLATFORM_STATS, TESTIMONIALS, COURSE_CATEGORIES, formatINR } from '../utils/constants';
import api from '../services/api';

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
};

const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
};

export default function Landing() {
    const [popularCourses, setPopularCourses] = useState([]);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await api.get('/courses?sort=popular&limit=3');
                if (res.data.success) setPopularCourses(res.data.courses);
            } catch (err) { console.error(err); }
        };
        fetchPopular();
    }, []);

    return (
        <div className="page-transition">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Orbs */}
                <div className="floating-orb w-[600px] h-[600px] bg-primary-500/20 top-[-200px] right-[-200px]" />
                <div className="floating-orb w-[400px] h-[400px] bg-accent-500/15 bottom-[-100px] left-[-100px]" />
                <div className="floating-orb w-[300px] h-[300px] bg-primary-400/10 top-1/2 left-1/3" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary-600 mb-6">
                                <HiLightningBolt className="text-amber-500" />
                                AI-Powered Learning Platform
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                Transform Your
                                <span className="block gradient-text">Future with AI</span>
                                <span className="block">Education</span>
                            </h1>

                            <p className="text-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
                                Learn from world-class instructors, get personalized AI tutoring, and
                                build real-world skills with our cutting-edge educational platform.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/courses" className="btn-primary inline-flex items-center gap-2 text-lg">
                                    Explore Courses <HiArrowRight />
                                </Link>
                                <button className="btn-secondary inline-flex items-center gap-2">
                                    <HiPlay className="text-xl" /> Watch Demo
                                </button>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-10 flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {['🧑‍💻', '👩‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-lg">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                                    </div>
                                    <p className="text-sm text-text-muted">2,50,000+ Students Trust Us</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block relative"
                        >
                            <div className="relative">
                                {/* Main Card */}
                                <div className="glass-card p-6 max-w-md mx-auto">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                                            <HiAcademicCap className="text-white text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text-primary">AI Learning Path</h3>
                                            <p className="text-sm text-text-muted">Personalized for you</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {['React Fundamentals', 'Advanced Patterns', 'Full-Stack Project'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 dark:bg-surface-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-primary-500' : 'bg-surface-3 dark:bg-surface text-text-muted'}`}>
                                                    {i === 0 ? '✓' : i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-text-primary">{item}</span>
                                                {i === 1 && <span className="ml-auto text-xs font-medium text-primary-500">In Progress</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-text-muted">Progress</span>
                                            <span className="font-semibold text-primary-600">45%</span>
                                        </div>
                                        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '45%' }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="h-full gradient-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -top-6 -right-6 glass-card !p-3 flex items-center gap-2 shadow-xl"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                        <HiChat />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-primary">AI Tutor Online</p>
                                        <p className="text-[10px] text-text-muted">Ask anything!</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                                    className="absolute -bottom-4 -left-6 glass-card !p-3 flex items-center gap-2 shadow-xl"
                                >
                                    <div className="text-2xl">🏆</div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-primary">Certificate Earned!</p>
                                        <p className="text-[10px] text-text-muted">React Mastery</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative py-12 bg-surface-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {PLATFORM_STATS.map((stat, i) => (
                            <motion.div key={i} {...stagger} transition={{ delay: i * 0.1 }} className="text-center">
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="text-2xl lg:text-3xl font-bold gradient-text">{stat.value}</div>
                                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-28 relative overflow-hidden">
                <div className="floating-orb w-[500px] h-[500px] bg-accent-500/10 top-0 left-[-200px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Why Choose <span className="gradient-text">EduVerse</span>?
                        </h2>
                        <p className="text-text-secondary text-lg">
                            Experience the future of education with features designed to accelerate your learning journey.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: HiLightningBolt, title: 'AI-Powered Tutoring', desc: 'Get 24/7 personalized help from our AI tutor that understands your learning style and adapts in real-time.', color: 'from-amber-500 to-orange-600' },
                            { icon: HiGlobe, title: 'Live Interactive Classes', desc: 'Join live video classes with instructors, participate in discussions, share screens, and collaborate in real-time.', color: 'from-blue-500 to-cyan-600' },
                            { icon: HiShieldCheck, title: 'Certified Courses', desc: 'Earn industry-recognized certificates upon completion. Our courses are designed with top employers in mind.', color: 'from-green-500 to-emerald-600' },
                            { icon: HiChat, title: 'Real-Time Collaboration', desc: 'Connect with peers and instructors through instant messaging, group chats, and collaborative projects.', color: 'from-purple-500 to-pink-600' },
                            { icon: HiAcademicCap, title: 'Smart Assessments', desc: 'AI-graded assignments with detailed feedback, plus performance analytics to track your growth over time.', color: 'from-indigo-500 to-violet-600' },
                            { icon: HiStar, title: 'Personalized Paths', desc: 'Our AI recommendation engine creates custom learning paths based on your goals, skills, and progress.', color: 'from-rose-500 to-red-600' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                {...stagger}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Courses Preview */}
            <section className="py-20 lg:py-28 bg-surface-2 relative overflow-hidden">
                <div className="floating-orb w-[400px] h-[400px] bg-primary-500/10 bottom-[-100px] right-[-100px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div {...fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                                Popular <span className="gradient-text">Courses</span>
                            </h2>
                            <p className="text-text-secondary">Start your learning journey with our most popular courses</p>
                        </div>
                        <Link to="/courses" className="btn-secondary inline-flex items-center gap-2">
                            View All <HiArrowRight />
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularCourses.length > 0 ? popularCourses.map((course, i) => {
                            const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : 'Instructor';
                            return (
                                <motion.div key={course._id} {...stagger} transition={{ delay: i * 0.15 }}>
                                    <Link to={`/courses/${course._id}`} className="block glass-card !p-0 overflow-hidden group">
                                        <div className="relative h-48 overflow-hidden">
                                            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-3 left-3">
                                                <span className="px-2 py-1 rounded-md bg-primary-500 text-white text-xs font-medium">{course.category}</span>
                                            </div>
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-md glass text-white text-xs font-bold">
                                                {formatINR(course.price)}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">{course.title}</h3>
                                            <p className="text-sm text-text-muted mb-3">{instructorName}</p>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="flex items-center gap-1 text-amber-500"><HiStar /> {course.rating?.toFixed(1) || '—'}</span>
                                                <span className="text-text-muted">({(course.reviewCount || 0).toLocaleString('en-IN')})</span>
                                                <span className="text-text-muted ml-auto">{(course.enrolledCount || 0).toLocaleString('en-IN')} students</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-3 text-center py-12 text-text-muted">Loading popular courses...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 lg:py-28 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Browse by <span className="gradient-text">Category</span>
                        </h2>
                        <p className="text-text-secondary text-lg">Find the perfect course for your career goals</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {COURSE_CATEGORIES.map((cat, i) => (
                            <motion.div key={cat} {...stagger} transition={{ delay: i * 0.05 }}>
                                <Link to={`/courses?category=${encodeURIComponent(cat)}`} className="glass-card !p-4 text-center group cursor-pointer">
                                    <div className="text-2xl mb-2">
                                        {['💻', '📱', '📊', '🤖', '☁️', '🔧', '🔒', '🎨', '📈', '📝', '🧪', '🩺', '💼'][i] || '📚'}
                                    </div>
                                    <span className="text-sm font-medium text-text-primary group-hover:text-primary-500 transition-colors">
                                        {cat}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 lg:py-28 bg-surface-2 relative overflow-hidden">
                <div className="floating-orb w-[500px] h-[500px] bg-accent-500/10 top-[-200px] right-[-200px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Loved by <span className="gradient-text">Learners</span>
                        </h2>
                        <p className="text-text-secondary text-lg">Hear from our community of successful graduates</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} {...stagger} transition={{ delay: i * 0.15 }} className="glass-card">
                                <div className="flex items-center gap-1 text-amber-500 mb-4">
                                    {[...Array(5)].map((_, j) => <HiStar key={j} />)}
                                </div>
                                <p className="text-text-secondary mb-6 leading-relaxed italic">"{t.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-xl">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-text-primary">{t.name}</p>
                                        <p className="text-xs text-text-muted">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="relative rounded-3xl gradient-primary p-12 lg:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                                Ready to Start Learning?
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                                Join over 2,50,000 students across India already learning on EduVerse. Your next career breakthrough starts here.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/register" className="bg-white text-primary-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg inline-block">
                                    Get Started Free
                                </Link>
                                <Link to="/courses" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all inline-block">
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
