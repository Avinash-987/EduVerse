/**
 * 🇮🇳 India Data Seed Script
 * Seeds the database with Indian instructors, courses priced in INR,
 * and relevant categories (UPSC, JEE, NEET, Web Dev, Data Science).
 *
 * Usage: node utils/seedIndiaData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Course = require('../models/Course');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduverse';

const INSTRUCTORS = [
    { name: 'Prof. Rajesh Sharma', email: 'rajesh@eduverse.in', password: 'instructor123', role: 'faculty', bio: 'IIT Delhi professor with 15+ years in Computer Science.', location: 'New Delhi', country: 'India' },
    { name: 'Dr. Priya Nair', email: 'priya@eduverse.in', password: 'instructor123', role: 'faculty', bio: 'NIT Trichy alumna, Data Science lead at TCS.', location: 'Chennai', country: 'India' },
    { name: 'Amit Verma', email: 'amit@eduverse.in', password: 'instructor123', role: 'faculty', bio: 'Full-stack developer, 10+ years at Infosys & Flipkart.', location: 'Bengaluru', country: 'India' },
    { name: 'Dr. Sunita Gupta', email: 'sunita@eduverse.in', password: 'instructor123', role: 'faculty', bio: 'AIIMS professor, medical entrance exam expert.', location: 'Mumbai', country: 'India' },
    { name: 'Vikram Singh', email: 'vikram@eduverse.in', password: 'instructor123', role: 'faculty', bio: 'UPSC topper (AIR 23), IAS officer turned educator.', location: 'Jaipur', country: 'India' },
];

const ADMIN = {
    name: 'Admin', email: 'admin@eduverse.in', password: 'admin123', role: 'admin',
    location: 'New Delhi', country: 'India',
};

const DEMO_STUDENT = {
    name: 'Demo Student', email: 'student@eduverse.in', password: 'student123', role: 'student',
    location: 'Mumbai', country: 'India',
};

async function seed() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Course.deleteMany({});

        // Create admin
        console.log('👑 Creating admin...');
        await User.create(ADMIN);

        // Create demo student
        console.log('🎓 Creating demo student...');
        await User.create(DEMO_STUDENT);

        // Create instructors
        console.log('👨‍🏫 Creating instructors...');
        const instructors = [];
        for (const data of INSTRUCTORS) {
            const user = await User.create({ ...data, isApproved: true });
            instructors.push(user);
        }

        // Create courses
        console.log('📚 Creating courses (INR pricing)...');
        const courses = [
            {
                title: 'Complete Web Development Bootcamp 2026',
                description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 15+ real-world projects including e-commerce, social media, and SaaS apps. Perfect for beginners.',
                instructor: instructors[2]._id,
                category: 'Web Development',
                level: 'Beginner',
                price: 499,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
                tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
                isPublished: true,
                rating: 4.8,
                reviewCount: 3240,
                enrolledCount: 18500,
                modules: [
                    {
                        title: 'HTML & CSS Fundamentals', order: 1, lessons: [
                            { title: 'Introduction to Web Development', type: 'video', duration: 15, order: 1 },
                            { title: 'HTML Structure & Tags', type: 'video', duration: 25, order: 2 },
                            { title: 'CSS Styling Basics', type: 'video', duration: 30, order: 3 },
                            { title: 'Responsive Design', type: 'video', duration: 20, order: 4 },
                            { title: 'HTML & CSS Cheat Sheet', type: 'pdf', duration: 5, order: 5 },
                        ]
                    },
                    {
                        title: 'JavaScript Deep Dive', order: 2, lessons: [
                            { title: 'Variables & Data Types', type: 'video', duration: 20, order: 1 },
                            { title: 'Functions & Scope', type: 'video', duration: 25, order: 2 },
                            { title: 'DOM Manipulation', type: 'video', duration: 30, order: 3 },
                            { title: 'Async/Await & Promises', type: 'video', duration: 35, order: 4 },
                            { title: 'JavaScript Quiz', type: 'quiz', duration: 15, order: 5 },
                        ]
                    },
                    {
                        title: 'React.js Masterclass', order: 3, lessons: [
                            { title: 'React Fundamentals', type: 'video', duration: 30, order: 1 },
                            { title: 'Components & Props', type: 'video', duration: 25, order: 2 },
                            { title: 'State & Hooks', type: 'video', duration: 35, order: 3 },
                            { title: 'React Project', type: 'video', duration: 45, order: 4 },
                        ]
                    },
                ],
                requirements: ['Basic computer skills', 'No prior programming experience needed'],
                learningOutcomes: ['Build full-stack web applications', 'Master React.js', 'Deploy on Vercel'],
            },
            {
                title: 'Python for Data Science & Machine Learning',
                description: 'Learn Python, Pandas, NumPy, Matplotlib, Scikit-learn, and TensorFlow. Includes real-world datasets from Indian industries. Become job-ready for data roles at top Indian MNCs.',
                instructor: instructors[1]._id,
                category: 'Data Science',
                level: 'Intermediate',
                price: 799,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
                tags: ['Python', 'Data Science', 'Machine Learning', 'AI'],
                isPublished: true,
                rating: 4.9,
                reviewCount: 4100,
                enrolledCount: 32000,
                modules: [
                    {
                        title: 'Python Programming Basics', order: 1, lessons: [
                            { title: 'Python Setup & Jupyter Notebook', type: 'video', duration: 15, order: 1 },
                            { title: 'Variables, Loops & Functions', type: 'video', duration: 30, order: 2 },
                            { title: 'Data Structures in Python', type: 'video', duration: 25, order: 3 },
                        ]
                    },
                    {
                        title: 'Data Analysis with Pandas', order: 2, lessons: [
                            { title: 'DataFrames & Series', type: 'video', duration: 30, order: 1 },
                            { title: 'Data Cleaning & Wrangling', type: 'video', duration: 35, order: 2 },
                            { title: 'Indian Census Data Analysis', type: 'video', duration: 40, order: 3 },
                        ]
                    },
                    {
                        title: 'Machine Learning', order: 3, lessons: [
                            { title: 'ML Algorithms Overview', type: 'video', duration: 35, order: 1 },
                            { title: 'Regression & Classification', type: 'video', duration: 40, order: 2 },
                            { title: 'Building ML Pipeline', type: 'video', duration: 45, order: 3 },
                        ]
                    },
                ],
                requirements: ['Basic math knowledge', 'Laptop with 8GB RAM'],
                learningOutcomes: ['Analyze data with Python', 'Build ML models', 'Get data science job ready'],
            },
            {
                title: 'UPSC CSE Complete Preparation',
                description: 'Comprehensive UPSC Civil Services preparation covering Prelims, Mains, and Interview. Includes Indian History, Polity, Geography, Economy, and Current Affairs with daily practice questions.',
                instructor: instructors[4]._id,
                category: 'UPSC',
                level: 'Beginner',
                price: 2999,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
                tags: ['UPSC', 'IAS', 'Civil Services', 'Government Exam'],
                isPublished: true,
                rating: 4.7,
                reviewCount: 5200,
                enrolledCount: 45000,
                modules: [
                    {
                        title: 'Indian Polity & Governance', order: 1, lessons: [
                            { title: 'Indian Constitution Overview', type: 'video', duration: 40, order: 1 },
                            { title: 'Fundamental Rights & Duties', type: 'video', duration: 35, order: 2 },
                            { title: 'Parliament & State Legislature', type: 'video', duration: 30, order: 3 },
                            { title: 'Polity Practice Questions', type: 'quiz', duration: 20, order: 4 },
                        ]
                    },
                    {
                        title: 'Indian History', order: 2, lessons: [
                            { title: 'Ancient India', type: 'video', duration: 45, order: 1 },
                            { title: 'Medieval India', type: 'video', duration: 40, order: 2 },
                            { title: 'Modern India & Freedom Struggle', type: 'video', duration: 50, order: 3 },
                        ]
                    },
                    {
                        title: 'Geography & Environment', order: 3, lessons: [
                            { title: 'Indian Geography', type: 'video', duration: 35, order: 1 },
                            { title: 'Climate & Monsoon', type: 'video', duration: 30, order: 2 },
                            { title: 'Environmental Issues', type: 'video', duration: 25, order: 3 },
                        ]
                    },
                ],
                requirements: ['Graduate degree (any stream)', 'Dedication for 12-18 months'],
                learningOutcomes: ['Clear UPSC Prelims', 'Score high in Mains', 'Crack the interview'],
            },
            {
                title: 'JEE Main & Advanced Complete Course',
                description: 'Comprehensive JEE preparation covering Physics, Chemistry, and Mathematics. Includes PYQs from 2010-2026, mock tests, and doubt clearing sessions.',
                instructor: instructors[0]._id,
                category: 'JEE',
                level: 'Advanced',
                price: 1999,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
                tags: ['JEE', 'Physics', 'Chemistry', 'Mathematics', 'IIT'],
                isPublished: true,
                rating: 4.8,
                reviewCount: 6800,
                enrolledCount: 52000,
                modules: [
                    {
                        title: 'Physics - Mechanics', order: 1, lessons: [
                            { title: 'Kinematics', type: 'video', duration: 40, order: 1 },
                            { title: 'Laws of Motion', type: 'video', duration: 45, order: 2 },
                            { title: 'Work, Energy & Power', type: 'video', duration: 35, order: 3 },
                        ]
                    },
                    {
                        title: 'Chemistry - Physical', order: 2, lessons: [
                            { title: 'Atomic Structure', type: 'video', duration: 30, order: 1 },
                            { title: 'Chemical Bonding', type: 'video', duration: 35, order: 2 },
                            { title: 'Thermodynamics', type: 'video', duration: 40, order: 3 },
                        ]
                    },
                    {
                        title: 'Mathematics - Calculus', order: 3, lessons: [
                            { title: 'Limits & Continuity', type: 'video', duration: 35, order: 1 },
                            { title: 'Differentiation', type: 'video', duration: 40, order: 2 },
                            { title: 'Integration', type: 'video', duration: 45, order: 3 },
                        ]
                    },
                ],
                requirements: ['Class 11-12 student', 'Basic math foundation'],
                learningOutcomes: ['Score 200+ in JEE Main', 'Crack JEE Advanced', 'Get into IITs/NITs'],
            },
            {
                title: 'NEET UG 2026 Complete Biology',
                description: 'Master Biology for NEET UG — Botany & Zoology with NCERT line-by-line analysis, PYQs, and high-yield topics for guaranteed score improvement.',
                instructor: instructors[3]._id,
                category: 'NEET',
                level: 'Intermediate',
                price: 1499,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800',
                tags: ['NEET', 'Biology', 'Medical', 'MBBS'],
                isPublished: true,
                rating: 4.9,
                reviewCount: 7500,
                enrolledCount: 68000,
                modules: [
                    {
                        title: 'Cell Biology', order: 1, lessons: [
                            { title: 'Cell Structure & Function', type: 'video', duration: 35, order: 1 },
                            { title: 'Cell Division', type: 'video', duration: 30, order: 2 },
                            { title: 'Biomolecules', type: 'video', duration: 40, order: 3 },
                        ]
                    },
                    {
                        title: 'Human Physiology', order: 2, lessons: [
                            { title: 'Digestive System', type: 'video', duration: 35, order: 1 },
                            { title: 'Respiratory System', type: 'video', duration: 30, order: 2 },
                            { title: 'Circulatory System', type: 'video', duration: 40, order: 3 },
                        ]
                    },
                    {
                        title: 'Genetics & Evolution', order: 3, lessons: [
                            { title: 'Mendelian Genetics', type: 'video', duration: 40, order: 1 },
                            { title: 'Molecular Genetics', type: 'video', duration: 45, order: 2 },
                            { title: 'Evolution', type: 'video', duration: 30, order: 3 },
                        ]
                    },
                ],
                requirements: ['Class 11-12 student', 'NCERT textbooks'],
                learningOutcomes: ['Score 350+ in Biology', 'Master NCERT concepts', 'Crack NEET in first attempt'],
            },
            {
                title: 'React Native Mobile App Development',
                description: 'Build production-ready mobile apps with React Native for Android & iOS. Includes Razorpay integration, Firebase, and publishing to Play Store.',
                instructor: instructors[2]._id,
                category: 'Mobile Development',
                level: 'Intermediate',
                price: 699,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
                tags: ['React Native', 'Mobile', 'Android', 'iOS'],
                isPublished: true,
                rating: 4.6,
                reviewCount: 1800,
                enrolledCount: 12000,
                modules: [
                    {
                        title: 'React Native Setup', order: 1, lessons: [
                            { title: 'Environment Setup', type: 'video', duration: 20, order: 1 },
                            { title: 'First App', type: 'video', duration: 25, order: 2 },
                        ]
                    },
                    {
                        title: 'Navigation & State', order: 2, lessons: [
                            { title: 'React Navigation', type: 'video', duration: 30, order: 1 },
                            { title: 'Redux Toolkit', type: 'video', duration: 35, order: 2 },
                        ]
                    },
                ],
                requirements: ['JavaScript & React basics'],
                learningOutcomes: ['Build & publish mobile apps', 'Integrate payments'],
            },
            {
                title: 'Cloud Computing & AWS Certification',
                description: 'Prepare for AWS Solutions Architect Associate. Covers EC2, S3, Lambda, RDS, VPC, and hands-on labs. Includes exam-ready practice tests.',
                instructor: instructors[0]._id,
                category: 'Cloud Computing',
                level: 'Advanced',
                price: 999,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
                tags: ['AWS', 'Cloud', 'DevOps', 'Certification'],
                isPublished: true,
                rating: 4.7,
                reviewCount: 2400,
                enrolledCount: 9500,
                modules: [
                    {
                        title: 'AWS Core Services', order: 1, lessons: [
                            { title: 'EC2 & Elastic Beanstalk', type: 'video', duration: 30, order: 1 },
                            { title: 'S3 & CloudFront', type: 'video', duration: 25, order: 2 },
                            { title: 'Lambda & API Gateway', type: 'video', duration: 35, order: 3 },
                        ]
                    },
                    {
                        title: 'Networking & Security', order: 2, lessons: [
                            { title: 'VPC & Subnets', type: 'video', duration: 30, order: 1 },
                            { title: 'IAM & Security', type: 'video', duration: 25, order: 2 },
                        ]
                    },
                ],
                requirements: ['Basic networking knowledge', 'AWS Free Tier account'],
                learningOutcomes: ['Pass AWS SAA exam', 'Design cloud architectures'],
            },
            {
                title: 'Cybersecurity & Ethical Hacking',
                description: 'Learn ethical hacking, penetration testing, network security, and incident response. Covers tools like Kali Linux, Burp Suite, and Wireshark.',
                instructor: instructors[0]._id,
                category: 'Cybersecurity',
                level: 'Advanced',
                price: 1299,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
                tags: ['Cybersecurity', 'Ethical Hacking', 'Pentesting'],
                isPublished: true,
                rating: 4.8,
                reviewCount: 1900,
                enrolledCount: 8500,
                modules: [
                    {
                        title: 'Security Fundamentals', order: 1, lessons: [
                            { title: 'Introduction to Cybersecurity', type: 'video', duration: 25, order: 1 },
                            { title: 'Network Security Basics', type: 'video', duration: 30, order: 2 },
                        ]
                    },
                    {
                        title: 'Penetration Testing', order: 2, lessons: [
                            { title: 'Kali Linux Setup', type: 'video', duration: 20, order: 1 },
                            { title: 'Vulnerability Scanning', type: 'video', duration: 35, order: 2 },
                            { title: 'Exploitation Techniques', type: 'video', duration: 40, order: 3 },
                        ]
                    },
                ],
                requirements: ['Basic Linux knowledge', 'Networking concepts'],
                learningOutcomes: ['Perform penetration tests', 'Secure networks', 'Prepare for CEH exam'],
            },
            {
                title: 'UI/UX Design with Figma',
                description: 'Master user interface and experience design using Figma. Build portfolios with Indian startup case studies. Learn design thinking and prototyping.',
                instructor: instructors[1]._id,
                category: 'UI/UX Design',
                level: 'Beginner',
                price: 399,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
                tags: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
                isPublished: true,
                rating: 4.9,
                reviewCount: 2800,
                enrolledCount: 15000,
                modules: [
                    {
                        title: 'Design Thinking', order: 1, lessons: [
                            { title: 'What is UX?', type: 'video', duration: 15, order: 1 },
                            { title: 'User Research Methods', type: 'video', duration: 25, order: 2 },
                        ]
                    },
                    {
                        title: 'Figma Mastery', order: 2, lessons: [
                            { title: 'Figma Interface', type: 'video', duration: 20, order: 1 },
                            { title: 'Components & Auto Layout', type: 'video', duration: 30, order: 2 },
                            { title: 'Prototyping & Animations', type: 'video', duration: 25, order: 3 },
                        ]
                    },
                ],
                requirements: ['No prior design experience needed'],
                learningOutcomes: ['Design professional UIs', 'Build a UX portfolio', 'Land design internships'],
            },
            {
                title: 'Digital Marketing Masterclass',
                description: 'Complete digital marketing course — SEO, SEM, Social Media Marketing, Google Ads, Facebook Ads, and Email Marketing. Focused on Indian market strategies.',
                instructor: instructors[1]._id,
                category: 'Digital Marketing',
                level: 'Beginner',
                price: 599,
                currency: 'INR',
                thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                tags: ['SEO', 'Google Ads', 'Social Media', 'Marketing'],
                isPublished: true,
                rating: 4.6,
                reviewCount: 3100,
                enrolledCount: 22000,
                modules: [
                    {
                        title: 'SEO Foundations', order: 1, lessons: [
                            { title: 'What is SEO?', type: 'video', duration: 15, order: 1 },
                            { title: 'Keyword Research', type: 'video', duration: 25, order: 2 },
                            { title: 'On-Page SEO', type: 'video', duration: 20, order: 3 },
                        ]
                    },
                    {
                        title: 'Social Media Marketing', order: 2, lessons: [
                            { title: 'Instagram Marketing', type: 'video', duration: 25, order: 1 },
                            { title: 'LinkedIn Strategy', type: 'video', duration: 20, order: 2 },
                        ]
                    },
                ],
                requirements: ['Basic internet skills'],
                learningOutcomes: ['Run Google Ads campaigns', 'Grow social media presence', 'Master SEO'],
            },
        ];

        for (const courseData of courses) {
            await Course.create(courseData);
        }

        console.log('\n✅ Seed complete!');
        console.log(`   👑 Admin: admin@eduverse.in / admin123`);
        console.log(`   🎓 Student: student@eduverse.in / student123`);
        console.log(`   👨‍🏫 Faculty: rajesh@eduverse.in / instructor123`);
        console.log(`   📚 ${courses.length} courses created (INR pricing)`);
        console.log(`   💰 Price range: ₹399 - ₹2,999\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
