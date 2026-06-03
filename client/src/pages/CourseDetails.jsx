import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuizView from '../components/QuizView';

const CourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courseQuiz, setCourseQuiz] = useState(null);
    const [takingCourseQuiz, setTakingCourseQuiz] = useState(false);
    
    // UPI Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [upiName, setUpiName] = useState('');
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        fetch(`https://mindova-learning-application-1.onrender.com/api/courses/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Course not found');
                return res.json();
            })
            .then(data => {
                setCourse(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });

        // Fetch course quiz if exists
        fetch(`https://mindova-learning-application-1.onrender.com/api/quizzes/course/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setCourseQuiz(data);
            })
            .catch(err => console.error("No course quiz", err));
    }, [id]);

    const handleEnrollClick = () => {
        if (!user) return alert('Please login to enroll');
        setShowPaymentModal(true);
    };

    const processPaymentAndEnroll = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        
        // Simulate payment request delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const res = await fetch(`https://mindova-learning-application-1.onrender.com/api/courses/${id}/enroll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ upiName, transactionId })
            });
            if (res.ok) {
                alert('Fake UPI Payment Details submitted! Awaiting Admin verification and approval.');
                setShowPaymentModal(false);
                navigate('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error);
                setShowPaymentModal(false);
            }
        } catch (err) {
            console.error(err);
            alert('Payment request submission failed. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading course details...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
    if (!course) return null;

    if (takingCourseQuiz && courseQuiz) {
        return (
            <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <button onClick={() => setTakingCourseQuiz(false)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>&larr; Back to Course Details</button>
                <QuizView 
                    quizId={courseQuiz._id} 
                    courseId={id} 
                    onComplete={() => setTakingCourseQuiz(false)} 
                />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>&larr; Back</button>
            
            <div className="course-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                <img 
                    src={course.thumbnail || 'https://via.placeholder.com/1000x400?text=Course+Thumbnail'} 
                    alt={course.title} 
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }} 
                />
                
                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: '1 1 500px' }}>
                            <span style={{ 
                                display: 'inline-block', 
                                padding: '0.4rem 1rem', 
                                backgroundColor: 'var(--primary-color)', 
                                color: 'white', 
                                borderRadius: '99px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem'
                            }}>
                                {course.category || 'General'}
                            </span>
                            <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', lineHeight: '1.2' }}>{course.title}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                                Instructed by: <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{course.instructor?.name || 'Unknown Instructor'}</span>
                            </p>
                        </div>
                        
                        <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                                ₹{course.price || 15000}
                            </div>
                            <button onClick={handleEnrollClick} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Enroll Now
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem' }}>
                        <h2 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>About This Course</h2>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{course.description}</p>
                    </div>

                    {course.lessons && course.lessons.length > 0 && (
                        <div style={{ marginTop: '4rem' }}>
                            <h2 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Course Curriculum ({course.lessons.length} lessons)</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {course.lessons.map((lesson, index) => (
                                    <div key={lesson._id} style={{ 
                                        padding: '1.2rem 1.5rem', 
                                        backgroundColor: 'var(--bg-color)', 
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <span style={{ 
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                alignItems: 'center', 
                                                width: '32px', 
                                                height: '32px', 
                                                backgroundColor: 'var(--primary-color)', 
                                                color: 'white', 
                                                borderRadius: '50%',
                                                fontWeight: 'bold'
                                            }}>
                                                {index + 1}
                                            </span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{lesson.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {courseQuiz && (
                        <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--primary-color)' }}>
                            <h2 style={{ marginBottom: '1rem' }}>Final Course Quiz</h2>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Test your knowledge on the entire course content.</p>
                            <button 
                                onClick={() => setTakingCourseQuiz(true)} 
                                className="btn btn-primary" 
                                style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: '#10b981' }}
                            >
                                Take Course Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Simulated UPI Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="auth-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>UPI Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        
                        <div style={{ background: 'var(--glass)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Amount to Pay</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{course.price || 15000}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', marginTop: '0.25rem', fontWeight: '500' }}>UPI ID: pay.mindova@upi</div>
                        </div>

                        {/* Custom Mock QR Code */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                            <svg width="140" height="140" viewBox="0 0 100 100" style={{ background: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                <path d="M5,5 L95,5 L95,95 L5,95 Z" fill="none" stroke="#111827" strokeWidth="2" />
                                
                                <rect x="10" y="10" width="20" height="20" fill="#111827" />
                                <rect x="14" y="14" width="12" height="12" fill="#fff" />
                                <rect x="18" y="18" width="4" height="4" fill="#111827" />

                                <rect x="70" y="10" width="20" height="20" fill="#111827" />
                                <rect x="74" y="14" width="12" height="12" fill="#fff" />
                                <rect x="78" y="18" width="4" height="4" fill="#111827" />

                                <rect x="10" y="70" width="20" height="20" fill="#111827" />
                                <rect x="14" y="74" width="12" height="12" fill="#fff" />
                                <rect x="18" y="78" width="4" height="4" fill="#111827" />

                                <rect x="40" y="15" width="8" height="8" fill="#111827" />
                                <rect x="52" y="12" width="6" height="6" fill="#111827" />
                                
                                <rect x="15" y="40" width="8" height="8" fill="#111827" />
                                <rect x="25" y="45" width="6" height="12" fill="#111827" />
                                
                                <rect x="40" y="40" width="20" height="20" fill="#111827" />
                                <rect x="45" y="45" width="10" height="10" fill="#fff" />
                                
                                <rect x="70" y="40" width="12" height="6" fill="#111827" />
                                <rect x="80" y="50" width="8" height="8" fill="#111827" />

                                <rect x="42" y="72" width="14" height="6" fill="#111827" />
                                <rect x="48" y="80" width="6" height="10" fill="#111827" />
                                
                                <rect x="72" y="72" width="8" height="8" fill="#111827" />
                                <rect x="82" y="80" width="8" height="8" fill="#111827" />
                                <rect x="75" y="82" width="5" height="5" fill="#111827" />
                            </svg>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.25rem' }}>
                            Scan QR with any UPI app to pay, then submit receipt/transaction details below for admin approval.
                        </p>

                        <form onSubmit={processPaymentAndEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payee Name (on Receipt)</label>
                                <input 
                                    type="text" 
                                    className="btn" 
                                    style={{ width: '100%', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', padding: '0.8rem' }}
                                    placeholder="e.g. Jane Doe"
                                    required
                                    value={upiName}
                                    onChange={(e) => setUpiName(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>UPI Transaction ID / UTR (12 Digits)</label>
                                <input 
                                    type="text" 
                                    className="btn" 
                                    style={{ width: '100%', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', padding: '0.8rem' }}
                                    placeholder="12-digit number (e.g. 123456789012)"
                                    maxLength="25"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={processingPayment}
                                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', background: '#10b981', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {processingPayment ? 'Submitting...' : `Submit Payment Details`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
