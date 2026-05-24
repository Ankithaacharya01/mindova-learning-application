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
    
    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

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
        
        // Simulate payment gateway delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const res = await fetch(`https://mindova-learning-application-1.onrender.com/api/courses/${id}/enroll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ paymentSuccess: true })
            });
            if (res.ok) {
                alert('Payment successful! You are now enrolled and approved.');
                setShowPaymentModal(false);
                navigate('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error);
                setShowPaymentModal(false);
            }
        } catch (err) {
            console.error(err);
            alert('Payment failed. Please try again.');
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

            {/* Simulated Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="auth-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Secure Checkout</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        
                        <div style={{ background: 'var(--glass)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{course.price || 15000}</div>
                        </div>

                        <form onSubmit={processPaymentAndEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Card Number</label>
                                <input 
                                    type="text" 
                                    className="btn" 
                                    style={{ width: '100%', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', padding: '0.8rem' }}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                    required
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Expiry</label>
                                    <input 
                                        type="text" 
                                        className="btn" 
                                        style={{ width: '100%', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', padding: '0.8rem' }}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        required
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CVV</label>
                                    <input 
                                        type="text" 
                                        className="btn" 
                                        style={{ width: '100%', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', padding: '0.8rem' }}
                                        placeholder="123"
                                        maxLength="3"
                                        required
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={processingPayment}
                                style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: '#10b981', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {processingPayment ? 'Processing...' : `Pay ₹${course.price || 15000}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
