import { motion } from 'framer-motion';
import { HiAcademicCap, HiLightBulb, HiGlobe, HiHeart, HiUsers, HiChartBar } from 'react-icons/hi';

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
};

export default function About() {
    return (
        <div className="page-transition pt-24">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                <div className="floating-orb w-[500px] h-[500px] bg-primary-500/15 top-[-200px] right-[-200px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary-600 mb-6">
                            <HiHeart className="text-red-500" /> Our Mission
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            Making Quality Education <span className="gradient-text">Accessible to All</span>
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            EduVerse is on a mission to democratize education through AI technology.
                            We believe everyone deserves access to world-class learning, regardless of location or background.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-surface-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { value: '150K+', label: 'Active Learners', icon: HiUsers },
                            { value: '2,500+', label: 'Expert Instructors', icon: HiAcademicCap },
                            { value: '50+', label: 'Countries', icon: HiGlobe },
                            { value: '94%', label: 'Completion Rate', icon: HiChartBar },
                        ].map((stat, i) => (
                            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="glass-card text-center">
                                <stat.icon className="text-3xl text-primary-500 mx-auto mb-3" />
                                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our <span className="gradient-text">Values</span></h2>
                        <p className="text-text-secondary text-lg">The principles that guide everything we do</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: HiLightBulb, title: 'Innovation First', desc: 'We leverage cutting-edge AI and technology to create learning experiences that are personalized, engaging, and effective.', color: 'from-amber-500 to-orange-600' },
                            { icon: HiUsers, title: 'Community Driven', desc: 'Our vibrant community of learners and instructors collaborate, support each other, and grow together.', color: 'from-blue-500 to-cyan-600' },
                            { icon: HiHeart, title: 'Learner Obsessed', desc: 'Every feature we build, every course we curate, is designed with the learner\'s success as our north star.', color: 'from-rose-500 to-pink-600' },
                        ].map((val, i) => (
                            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.15 }} className="glass-card text-center group">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${val.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <val.icon className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-text-primary mb-3">{val.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-surface-2 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Meet Our <span className="gradient-text">Team</span></h2>
                        <p className="text-text-secondary text-lg">Passionate people building the future of education</p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Dr. Lisa Wang', role: 'CEO & Founder', emoji: '👩‍💼' },
                            { name: 'Raj Patel', role: 'CTO', emoji: '👨‍💻' },
                            { name: 'Maria Santos', role: 'Head of AI', emoji: '👩‍🔬' },
                            { name: 'James Lee', role: 'Head of Content', emoji: '👨‍🎓' },
                        ].map((member, i) => (
                            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="glass-card text-center group">
                                <div className="w-20 h-20 rounded-2xl bg-surface-3 flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    {member.emoji}
                                </div>
                                <h3 className="font-semibold text-text-primary">{member.name}</h3>
                                <p className="text-sm text-text-muted">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp} className="relative rounded-3xl gradient-primary p-12 text-center overflow-hidden">
                        <h2 className="text-3xl font-bold text-white mb-4">Join Our Journey</h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Whether you're a learner, instructor, or partner — we'd love to have you on board.
                        </p>
                        <a href="/register" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-all hover:scale-105 inline-block shadow-lg">
                            Get Started Today
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
