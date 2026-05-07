const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});

        // Create Instructor
        const hashedPassword = await bcrypt.hash('password123', 10);
        const instructor = new User({
            name: 'John Smith',
            email: 'john@example.com',
            password: hashedPassword,
            role: 'instructor'
        });
        await instructor.save();

        // Create Student
        const student = new User({
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: hashedPassword,
            role: 'student'
        });
        await student.save();

        // Create Sample Courses
        const courses = [
            {
                title: 'Full Stack Web Development',
                description: 'Master React, Node.js, and MongoDB in this comprehensive course.',
                instructor: instructor._id,
                price: 99,
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
                lessons: [
                    { title: 'Introduction to Web', content: 'Basic HTML and CSS overview.' },
                    { title: 'Advanced React Hooks', content: 'Deep dive into useEffect and useMemo.' }
                ]
            },
            {
                title: 'Machine Learning Basics',
                description: 'Learn the fundamentals of AI and Python data science.',
                instructor: instructor._id,
                price: 149,
                thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&q=80',
                lessons: [
                    { title: 'Linear Regression', content: 'Understanding math behind linear models.' }
                ]
            },
            {
                title: 'UI/UX Design for Beginners',
                description: 'Master Figma and learn the principles of modern user interface design.',
                instructor: instructor._id,
                price: 79,
                thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=500&q=80',
                lessons: [
                    { title: 'Introduction to Figma', content: 'Setting up your first project.' },
                    { title: 'Design Principles', content: 'Typography, color theory, and layout.' }
                ]
            },
            {
                title: 'Cyber Security Essentials',
                description: 'Protect systems and networks from digital attacks. Learn ethical hacking.',
                instructor: instructor._id,
                price: 199,
                thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80',
                lessons: [
                    { title: 'Network Security', content: 'Firewalls, VPNs, and secure protocols.' },
                    { title: 'Ethical Hacking', content: 'Introduction to penetration testing.' }
                ]
            },
            {
                title: 'Data Science with Python',
                description: 'Analyze data and build predictive models using NumPy, Pandas, and Scikit-Learn.',
                instructor: instructor._id,
                price: 129,
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bbda38a5f971?w=500&q=80',
                lessons: [
                    { title: 'Pandas Dataframes', content: 'Data manipulation and cleaning.' },
                    { title: 'Visualizing Data', content: 'Creating charts with Matplotlib and Seaborn.' }
                ]
            }
        ];

        await Course.insertMany(courses);
        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
