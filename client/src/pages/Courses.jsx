import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiStar, HiClock, HiBookOpen, HiX } from 'react-icons/hi';
import { COURSE_CATEGORIES, COURSE_LEVELS, formatINR } from '../utils/constants';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Courses() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (selectedCategory) params.append('category', selectedCategory);
                if (selectedLevel) params.append('level', selectedLevel);
                if (sortBy) params.append('sort', sortBy);
                params.append('limit', '50');

                const res = await api.get(`/courses?${params.toString()}`);
                if (res.data.success) {
                    setCourses(res.data.courses);
                    setTotal(res.data.total);
                }
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchCourses, 300);
        return () => clearTimeout(debounce);
    }, [search, selectedCategory, selectedLevel, sortBy]);

    const clearFilters = () => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); };
    const hasFilters = search || selectedCategory || selectedLevel;

    return (
        <div className="page-transition pt-24 pb-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                        Explore <span className="gradient-text">Courses</span>
                    </h1>
                    <p className="text-text-secondary">Discover courses taught by India's best instructors</p>
                </motion.div>

                {/* Search & Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card !p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input type="text" placeholder="Search courses, topics, or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-10" />
                        </div>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field lg:w-52">
                            <option value="">All Categories</option>
                            {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="input-field lg:w-40">
                            <option value="">All Levels</option>
                            {COURSE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field lg:w-44">
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                    {hasFilters && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-text-muted">Active Filters:</span>
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-medium">
                                    {selectedCategory} <button onClick={() => setSelectedCategory('')}><HiX className="text-xs" /></button>
                                </span>
                            )}
                            {selectedLevel && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-medium">
                                    {selectedLevel} <button onClick={() => setSelectedLevel('')}><HiX className="text-xs" /></button>
                                </span>
                            )}
                            <button onClick={clearFilters} className="text-xs text-danger-500 hover:underline ml-2">Clear All</button>
                        </div>
                    )}
                </motion.div>

                <div className="mb-6 text-sm text-text-muted">
                    Showing <span className="font-semibold text-text-primary">{courses.length}</span> of {total} courses
                </div>

                {loading ? (
                    <LoadingSpinner text="Searching courses..." />
                ) : courses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">No courses found</h3>
                        <p className="text-text-muted mb-4">Try adjusting your filters or search terms</p>
                        <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, i) => {
                            const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : 'Instructor';
                            const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
                            const totalDuration = course.modules?.reduce((s, m) => s + m.lessons?.reduce((ls, l) => ls + (l.duration || 0), 0), 0) || 0;
                            const hours = Math.round(totalDuration / 60);

                            return (
                                <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Link to={`/courses/${course._id}`} className="block glass-card !p-0 overflow-hidden group h-full">
                                        <div className="relative h-48 overflow-hidden">
                                            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-3 left-3 flex gap-2">
                                                <span className="px-2 py-1 rounded-md bg-primary-500 text-white text-xs font-medium">{course.category}</span>
                                                <span className="px-2 py-1 rounded-md glass text-white text-xs font-medium">{course.level}</span>
                                            </div>
                                            <div className="absolute top-3 right-3 px-3 py-1 rounded-lg gradient-primary text-white text-sm font-bold shadow-lg">
                                                {formatINR(course.price)}
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">{course.title}</h3>
                                            <p className="text-sm text-text-muted mb-3 line-clamp-2">{course.description}</p>
                                            <div className="mt-auto">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold">
                                                        {instructorName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-text-secondary">{instructorName}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                                                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                        <HiStar /> {course.rating?.toFixed(1) || '—'}
                                                        <span className="text-text-muted font-normal">({(course.reviewCount || 0).toLocaleString('en-IN')})</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-text-muted">
                                                        <HiClock className="text-xs" /> {hours > 0 ? `${hours}h` : '—'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-text-muted">
                                                        <HiBookOpen className="text-xs" /> {totalLessons || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
