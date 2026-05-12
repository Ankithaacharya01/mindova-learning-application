import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Lock, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuizView from '../components/QuizView';

const LessonView = () => {
    const { user } = useAuth();
    const { courseId, lessonId } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch course details
                const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`);
                const courseData = await courseRes.json();
                setCourse(courseData);
                
                if (lessonId) {
                    setActiveLesson(courseData.lessons.find(l => l._id === lessonId));
                } else {
                    setActiveLesson(courseData.lessons[0]);
                }

                // Fetch enrollment status if student
                if (user && user.role === 'student') {
                    const enrollRes = await fetch(`http://localhost:5000/api/enrollments/course/${courseId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (enrollRes.ok) {
                        const enrollData = await enrollRes.json();
                        setEnrollment(enrollData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, lessonId, user]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="loader">Loading course content...</div>
        </div>
    );

    const isApproved = user?.role === 'admin' || user?.role === 'instructor' || enrollment?.status === 'approved';

    if (!isApproved) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--glass)', borderRadius: '1rem', marginTop: '2rem' }}>
                <Clock size={60} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Waiting for Approval</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    Your enrollment request for <strong>{course?.title}</strong> is currently pending administrator approval. 
                    You will be able to access the lessons once your request is accepted.
                </p>
                <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
            </div>
        );
    }

    if (!course || !activeLesson) return <div>Lesson not found.</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div>
                {quizStarted && activeLesson.quizId ? (
                    <QuizView 
                        quizId={activeLesson.quizId} 
                        courseId={courseId} 
                        onComplete={() => setQuizStarted(false)} 
                    />
                ) : (
                    <>
                        <div style={{ background: '#000', aspectRatio: '16/9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <PlayCircle size={80} color="white" />
                            <p style={{ color: 'white', marginLeft: '1rem' }}>Video Player Placeholder for {activeLesson.title}</p>
                        </div>
                        <h2>{activeLesson.title} {enrollment?.status === 'pending' && '(Pending)'}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{activeLesson.content || 'No description available.'}</p>
                        
                        {activeLesson.quizId && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--glass)', borderRadius: '1rem' }}>
                                <h3>Ready for a Knowledge Check?</h3>
                                <button onClick={() => setQuizStarted(true)} className="btn btn-primary mt-4">Take Quiz</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Course Content</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {course.lessons.map((lesson, index) => (
                        <div 
                            key={lesson._id} 
                            onClick={() => {
                                setActiveLesson(lesson);
                                setQuizStarted(false);
                            }}
                            style={{ 
                                padding: '1rem', 
                                borderRadius: '0.5rem', 
                                background: activeLesson._id === lesson._id ? 'var(--primary)' : 'var(--glass)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{index + 1}</span>
                            <span style={{ flex: 1 }}>{lesson.title}</span>
                            {activeLesson._id === lesson._id && <CheckCircle size={16} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LessonView;
