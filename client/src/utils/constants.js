export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export const ROLES = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    ADMIN: 'admin',
};

export const COURSE_CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Digital Marketing',
    'UPSC',
    'JEE',
    'NEET',
    'Business',
];

export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' },
];

// ₹ INR currency formatter
export const formatINR = (amount) => {
    if (amount == null || isNaN(amount)) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Static marketing data for public pages (NOT dashboard mock data)
export const TESTIMONIALS = [
    {
        name: 'Ananya Sharma',
        role: 'Software Engineer at Google India',
        content: 'EduVerse completely transformed my learning journey. The AI tutor helped me crack concepts I struggled with for years. Got placed at Google!',
        avatar: '👩‍💻',
    },
    {
        name: 'Rohit Patel',
        role: 'Data Scientist at Flipkart',
        content: 'The Data Science course was worth every rupee. Real Indian datasets, practical projects, and the community support is amazing.',
        avatar: '👨‍🔬',
    },
    {
        name: 'Meera Iyer',
        role: 'IAS Officer (AIR 47)',
        content: 'From struggling aspirant to cracking UPSC — EduVerse UPSC course, combined with the AI tutor for doubt clearing, made all the difference.',
        avatar: '👩‍⚖️',
    },
];

export const PLATFORM_STATS = [
    { label: 'Active Students', value: '2,50,000+', icon: '🎓' },
    { label: 'Expert Instructors', value: '5,000+', icon: '👨‍🏫' },
    { label: 'Courses Available', value: '10,000+', icon: '📚' },
    { label: 'Success Rate', value: '94%', icon: '🏆' },
];
