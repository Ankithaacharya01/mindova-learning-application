import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Play, Check, X, Clock, Award, Download, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myCourses, setMyCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [studentDetails, setStudentDetails] = useState([]);

    const fetchDashboardData = () => {
        if (user) {
            let endpoint = '';
            if (user.role === 'admin') endpoint = '/api/dashboards/admin';
            else if (user.role === 'instructor') endpoint = '/api/dashboards/instructor';
            else endpoint = '/api/dashboards/student';

            fetch(`http://localhost:5000${endpoint}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json())
            .then(data => {
                if (user.role === 'admin') {
                    setStats(data.stats);
                    setPendingRequests(data.pendingEnrollments);
                    setStudentDetails(data.studentDetails || []);
                } else if (user.role === 'instructor') {
                    setMyCourses(data.courses);
                    setStats(data.stats);
                } else {
                    setMyCourses(data.enrollments); // Keep the whole enrollment object to check status
                    setStats(data.stats);
                }
            })
            .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const handleApproval = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/enrollments/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProgress = async (id, progress) => {
        try {
            const res = await fetch(`http://localhost:5000/api/enrollments/${id}/progress`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ progress })
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Student Progress Report', 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Student Name", "Email", "Enrolled Courses", "Completed Certificates", "Avg Progress"];
        const tableRows = [];

        studentDetails.forEach(student => {
            const studentData = [
                student.name,
                student.email,
                student.totalEnrolled,
                student.completedCertificates,
                `${Math.round(student.averageProgress)}%`
            ];
            tableRows.push(studentData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [43, 60, 245], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`student_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!user) return <div>Please login to view dashboard</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Welcome, {user.name} ({user.role})</h2>
                {user.role === 'instructor' && (
                    <button onClick={() => navigate('/create-course')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Create Course
                    </button>
                )}
            </div>

            {user.role === 'admin' ? (
                <>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="auth-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>Total Users</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalUsers || 0}</p>
                        </div>
                        <div className="auth-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>Total Courses</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalCourses || 0}</p>
                        </div>
                        <div className="auth-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>Students</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalStudents || 0}</p>
                        </div>
                        <div className="auth-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>Instructors</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalInstructors || 0}</p>
                        </div>
                    </div>

                    <h3>Pending Enrollment Requests</h3>
                    <div className="auth-card" style={{ marginTop: '1rem', padding: '1rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Student</th>
                                    <th style={{ padding: '1rem' }}>Course</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(req => (
                                    <tr key={req._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{req.studentId?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.studentId?.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{req.courseId?.title}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleApproval(req._id, 'approved')}
                                                className="btn" 
                                                style={{ background: '#10b981', color: 'white', padding: '0.5rem' }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleApproval(req._id, 'rejected')}
                                                className="btn" 
                                                style={{ background: '#ef4444', color: 'white', padding: '0.5rem' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
                        <h3>Student Progress Report</h3>
                        <button onClick={generatePDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>
                    
                    <div className="auth-card" style={{ padding: '1rem', overflowX: 'auto', marginBottom: '3rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Enrolled Courses</th>
                                    <th style={{ padding: '1rem' }}>Certificates</th>
                                    <th style={{ padding: '1rem' }}>Avg Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentDetails.map(student => (
                                    <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{student.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{student.totalEnrolled}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                background: student.completedCertificates > 0 ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass)',
                                                color: student.completedCertificates > 0 ? '#10b981' : 'var(--text-muted)',
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                fontWeight: 600
                                            }}>
                                                {student.completedCertificates}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>{Math.round(student.averageProgress)}%</span>
                                                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', minWidth: '60px' }}>
                                                    <div style={{ height: '100%', width: `${student.averageProgress}%`, background: 'var(--primary)', borderRadius: '3px' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {studentDetails.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : user.role === 'instructor' ? (
                <>
                    <h3>Your Created Courses</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '1rem' }}>
                        {myCourses.map(item => {
                            const course = item;
                            
                            return (
                                <div key={item._id} className="course-card">
                                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80'} alt={course.title} />
                                    <div className="p-4">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h4>{course.title}</h4>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/edit-course/${course._id}`)}
                                            className="btn mt-4" 
                                            style={{ 
                                                background: 'var(--glass)', 
                                                color: 'white', 
                                                width: '100%', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Play size={18} /> Edit Course
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {myCourses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No courses found. Start creating!</p>}
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Top Section: Profile & Stats */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Profile Card */}
                        <div className="auth-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{user.name}</h3>
                                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>{user.email}</p>
                                <span style={{ background: 'var(--glass)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Student Profile</span>
                            </div>
                        </div>

                        {/* Progress Pie Chart Card */}
                        <div className="auth-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overall Progress</h4>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{Math.round(stats?.averageProgress || 0)}%</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Across {stats?.totalEnrolled || 0} enrolled courses</p>
                            </div>
                            
                            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="10" />
                                    <circle 
                                        cx="50" cy="50" r="40" fill="transparent" 
                                        stroke="var(--primary)" strokeWidth="10" 
                                        strokeDasharray={`${2 * Math.PI * 40}`} 
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats?.averageProgress || 0) / 100)}`} 
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                    />
                                </svg>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Section: Progress Activities */}
                    <div>
                        <h3>Progress Activities</h3>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '1rem' }}>
                            {myCourses.map(item => {
                                const course = item.courseId;
                                const isPending = item.status === 'pending';
                                
                                return (
                                    <div key={item._id} className="course-card" style={{ opacity: isPending ? 0.7 : 1 }}>
                                        <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80'} alt={course.title} />
                                        <div className="p-4">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4>{course.title}</h4>
                                                {isPending && (
                                                    <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        <Clock size={10} /> Pending
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {!isPending && (
                                                <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                                                        <span>Course Progress</span>
                                                        <span>{item.progress || 0}%</span>
                                                    </div>
                                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${item.progress || 0}%`, background: 'var(--primary)', borderRadius: '3px' }}></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                <button 
                                                    onClick={() => {
                                                        if (isPending) return;
                                                        
                                                        // Update progress automatically when they start learning
                                                        if (item.progress < 100) {
                                                            handleUpdateProgress(item._id, 100);
                                                        }

                                                        if (course.videoUrl) {
                                                            let url = course.videoUrl;
                                                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                                                url = 'https://' + url;
                                                            }
                                                            window.location.href = url;
                                                        } else {
                                                            navigate(`/course/${course._id}/lesson/`);
                                                        }
                                                    }}
                                                    className="btn" 
                                                    disabled={isPending}
                                                    style={{ 
                                                        flex: 1,
                                                        background: isPending ? 'var(--border)' : 'var(--glass)', 
                                                        color: 'white', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        gap: '0.5rem',
                                                        cursor: isPending ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <Play size={18} /> {isPending ? 'Awaiting Approval' : 'Continue Learning'}
                                                </button>

                                                {!isPending && (
                                                    <button 
                                                        onClick={() => navigate(`/course-quiz/${course._id}`)}
                                                        className="btn"
                                                        title="Take Course Quiz"
                                                        style={{ background: '#818cf8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}
                                                    >
                                                        <HelpCircle size={18} />
                                                    </button>
                                                )}
                                                
                                                {!isPending && item.progress === 100 && (
                                                    <button 
                                                        onClick={() => navigate(`/certificate/${item._id}`)}
                                                        className="btn btn-primary"
                                                        title="View Certificate"
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}
                                                    >
                                                        <Award size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {myCourses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No courses found. Start exploring!</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
