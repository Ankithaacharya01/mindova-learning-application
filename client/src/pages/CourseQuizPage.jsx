import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuizView from '../components/QuizView';

const CourseQuizPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courseQuiz, setCourseQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`https://mindova-learning-application-1.onrender.com/api/quizzes/${courseId}`);
                if (!res.ok) {
                    throw new Error('Course quiz not found or not created yet.');
                }
                const data = await res.json();
                setCourseQuiz(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchQuiz();
        } else {
            navigate('/login');
        }
    }, [courseId, user, navigate]);

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Quiz...</div>;
    
    if (error) return (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '1rem', marginTop: '2rem' }}>
            <h2 style={{ color: '#ef4444' }}>Oops!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ marginTop: '2rem' }}>Return to Dashboard</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>&larr; Back to Dashboard</button>
            <QuizView 
    quiz={courseQuiz}
    onComplete={() => navigate('/dashboard')}
/>
        </div>
    );
};

export default CourseQuizPage;
