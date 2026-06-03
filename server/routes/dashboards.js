const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Student Dashboard Data
router.get('/student', auth(['student']), async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user.id })
            .populate({
                path: 'courseId',
                populate: { path: 'instructor', select: 'name' }
            });
        
        const stats = {
            totalEnrolled: enrollments.length,
            completedCourses: enrollments.filter(e => e.completed).length,
            averageProgress: enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length || 0
        };

        res.json({ enrollments, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Instructor Dashboard Data
router.get('/instructor', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);
        
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
        
        const stats = {
            totalCourses: courses.length,
            totalStudents: enrollments.length,
            totalRevenue: courses.reduce((acc, curr) => acc + (curr.price * enrollments.filter(e => e.courseId.toString() === curr._id.toString()).length), 0)
        };

        res.json({ courses, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Dashboard Data
router.get('/admin', auth(['admin']), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalStudentsCount = await User.countDocuments({ role: 'student' });

        const allEnrollments = await Enrollment.find()
            .populate('studentId', 'name email')
            .populate('courseId', 'title price')
            .sort({ createdAt: -1 });

        // Detailed student tracking
        const students = await User.find({ role: 'student' }).select('name email');
        const studentDetails = await Promise.all(students.map(async (student) => {
            const enrollments = await Enrollment.find({ studentId: student._id }).populate('courseId', 'title');
            
            const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
            const completedCourses = approvedEnrollments.filter(e => e.progress === 100 || e.completed);
            
            const avgProgress = approvedEnrollments.length > 0 
                ? approvedEnrollments.reduce((acc, curr) => acc + curr.progress, 0) / approvedEnrollments.length 
                : 0;

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                totalEnrolled: approvedEnrollments.length,
                completedCertificates: completedCourses.length,
                averageProgress: avgProgress,
                courses: approvedEnrollments.map(e => ({
                    title: e.courseId ? e.courseId.title : 'Unknown Course',
                    progress: e.progress
                }))
            };
        }));

        // Enrollment stats per course (for admin dashboard graph)
        const courses = await Course.find().select('title');
        const coursesEnrollmentStats = await Promise.all(courses.map(async (course) => {
            const count = await Enrollment.countDocuments({ courseId: course._id, status: 'approved' });
            return {
                title: course.title,
                enrolledCount: count
            };
        }));

        // Pending student login registrations
        const pendingStudents = await User.find({ role: 'student', isApproved: false })
            .select('name email createdAt');

        res.json({
            stats: {
                totalUsers,
                totalCourses,
                totalEnrollments,
                totalInstructors,
                totalStudents: totalStudentsCount
            },
            allEnrollments,
            studentDetails,
            coursesEnrollmentStats,
            pendingStudents
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
