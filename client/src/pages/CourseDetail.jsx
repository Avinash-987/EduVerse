import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiClock, HiBookOpen, HiUsers, HiPlay, HiChevronDown, HiChevronUp, HiShieldCheck, HiDownload, HiChat } from 'react-icons/hi';
import { formatINR } from '../utils/constants';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

export default function CourseDetail() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [openModule, setOpenModule] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                if (res.data.success) {
                    setCourse(res.data.course);
                    setReviews(res.data.reviews || []);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleEnroll = async () => {
        if (!isAuthenticated) return navigate('/login');
        navigate(`/checkout/${id}`);
    };

    if (loading) return <div className="pt-24"><LoadingSpinner text="Loading course details..." /></div>;
    if (!course) return <div className="pt-24 text-center py-20 text-text-muted">Course not found</div>;

    const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : 'Instructor';
    const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
    const totalDuration = course.modules?.reduce((s, m) => s + (m.lessons?.reduce((ls, l) => ls + (l.duration || 0), 0) || 0), 0) || 0;
    const hours = Math.round(totalDuration / 60);

    return (
        <div className="page-transition pt-24 pb-16 min-h-screen">
            {/* Hero */}
            <div className="relative bg-surface-2 border-b border-border">
                <div className="absolute inset-0 opacity-20">
                    <img src={course.thumbnail || ''} alt="" className="w-full h-full object-cover blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-sm font-medium">{course.category}</span>
                                    <span className="px-3 py-1 rounded-full bg-surface-3 text-text-muted text-sm">{course.level}</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">{course.title}</h1>
                                <p className="text-text-secondary mb-6 text-lg leading-relaxed">{course.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                                    <span className="flex items-center gap-1 text-amber-500 font-semibold"><HiStar /> {course.rating?.toFixed(1) || '—'}</span>
                                    <span className="text-text-muted">({(course.reviewCount || 0).toLocaleString('en-IN')} reviews)</span>
                                    <span className="flex items-center gap-1 text-text-muted"><HiUsers /> {(course.enrolledCount || 0).toLocaleString('en-IN')} enrolled</span>
                                    <span className="flex items-center gap-1 text-text-muted"><HiClock /> {hours > 0 ? `${hours} hours` : '—'}</span>
                                    <span className="flex items-center gap-1 text-text-muted"><HiBookOpen /> {totalLessons} lessons</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                                        {instructorName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary">{instructorName}</p>
                                        <p className="text-xs text-text-muted">Course Instructor</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Enrollment Card */}
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card sticky top-24">
                            <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                                <img src={course.thumbnail || ''} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
                                        <HiPlay className="text-white text-2xl ml-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold gradient-text">{formatINR(course.discountPrice || course.price)}</span>
                                {course.discountPrice && <span className="text-lg text-text-muted line-through">{formatINR(course.price)}</span>}
                                {course.discountPrice && (
                                    <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 text-sm font-medium">
                                        {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                                    </span>
                                )}
                            </div>
                            <button onClick={handleEnroll} className="btn-primary w-full mb-3 text-center">
                                Enroll Now
                            </button>
                            <div className="space-y-3 text-sm">
                                {[
                                    { icon: HiClock, text: `${hours > 0 ? `${hours} hours` : '—'} of content` },
                                    { icon: HiBookOpen, text: `${totalLessons} lessons` },
                                    { icon: HiDownload, text: 'Downloadable resources' },
                                    { icon: HiShieldCheck, text: 'Certificate of completion' },
                                    { icon: HiChat, text: 'AI Tutor access' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-text-secondary">
                                        <item.icon className="text-primary-500" /> {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:max-w-2xl">
                    <div className="flex gap-1 p-1 glass rounded-xl mb-8">
                        {['overview', 'curriculum', 'reviews'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'gradient-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {course.learningOutcomes?.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold text-text-primary mb-4">What You'll Learn</h2>
                                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                                        {course.learningOutcomes.map((item, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                <span className="text-green-500 mt-0.5">✓</span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {course.requirements?.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold text-text-primary mb-4">Requirements</h2>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary mb-8">
                                        {course.requirements.map((req, i) => <li key={i}>{req}</li>)}
                                    </ul>
                                </>
                            )}
                            {course.tags?.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold text-text-primary mb-4">Tags</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags.map(tag => <span key={tag} className="px-3 py-1.5 rounded-lg bg-surface-2 text-text-secondary text-sm">{tag}</span>)}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'curriculum' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {(!course.modules || course.modules.length === 0) ? (
                                <p className="text-text-muted text-sm text-center py-8">Curriculum coming soon</p>
                            ) : (
                                course.modules.map((mod, i) => (
                                    <div key={i} className="glass-card !p-0 overflow-hidden">
                                        <button onClick={() => setOpenModule(openModule === i ? -1 : i)} className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">{i + 1}</div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-text-primary text-sm">{mod.title}</p>
                                                    <p className="text-xs text-text-muted">{mod.lessons?.length || 0} lessons</p>
                                                </div>
                                            </div>
                                            {openModule === i ? <HiChevronUp className="text-text-muted" /> : <HiChevronDown className="text-text-muted" />}
                                        </button>
                                        {openModule === i && mod.lessons?.length > 0 && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-border px-4 pb-4">
                                                <div className="space-y-2 pt-3">
                                                    {mod.lessons.map((lesson, j) => (
                                                        <div key={j} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2/50 text-sm">
                                                            <HiPlay className="text-primary-500 shrink-0" />
                                                            <span className="text-text-secondary flex-1">{lesson.title}</span>
                                                            <span className="text-xs text-text-muted">{lesson.duration > 0 ? `${lesson.duration}m` : '—'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="glass-card mb-6 flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold gradient-text">{course.rating?.toFixed(1) || '—'}</div>
                                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                                        {[...Array(5)].map((_, i) => <HiStar key={i} className={i < Math.round(course.rating || 0) ? '' : 'opacity-30'} />)}
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">{(course.reviewCount || 0).toLocaleString('en-IN')} reviews</p>
                                </div>
                            </div>
                            {reviews.length === 0 ? (
                                <p className="text-center text-text-muted text-sm py-8">No reviews yet. Be the first to review!</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="glass-card">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold text-text-muted">
                                                        {review.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-medium text-text-primary text-sm">{review.user?.name || 'Anonymous'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                                    {[...Array(review.rating)].map((_, j) => <HiStar key={j} />)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                                            <p className="text-xs text-text-muted mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
