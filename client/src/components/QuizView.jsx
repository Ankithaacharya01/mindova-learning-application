import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const QuizView = ({ quiz: initialQuiz, quizId: propQuizId, courseId: propCourseId, onComplete }) => { 
   
    const [quiz, setQuiz] = useState(initialQuiz);
    const [loading, setLoading] = useState(!initialQuiz);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialQuiz) {
            setQuiz(initialQuiz);
            setLoading(false);
            return;
        }

        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const targetQuizId = propQuizId;
                if (!targetQuizId) {
                    throw new Error("No quiz ID provided");
                }
                const res = await fetch(`https://mindova-learning-application-1.onrender.com/api/quizzes/${targetQuizId}`);
                if (!res.ok) {
                    throw new Error('Quiz not found');
                }
                const data = await res.json();
                setQuiz(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (propQuizId) {
            fetchQuiz();
        } else {
            setError('No quiz ID or quiz data provided');
            setLoading(false);
        }
    }, [initialQuiz, propQuizId]);

    const handleOptionSelect = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!quiz || !quiz.questions) return;
        
        if (Object.keys(answers).length < quiz.questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctOption) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
        
        try {
            const finalCourseId = propCourseId || quiz.courseId;
            const finalQuizId = propQuizId || quiz._id;

            await fetch('https://mindova-learning-application-1.onrender.com/api/enrollments/quiz-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ courseId: finalCourseId, quizId: finalQuizId, score: calculatedScore })
            });
            setScore(calculatedScore);
        } catch (err) {
            console.error("Failed to submit score:", err);
            alert("Error submitting quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Quiz...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>Error: {error}</div>;
    if (!quiz || !quiz.questions) return <div style={{ textAlign: 'center', padding: '5rem' }}>No quiz questions available.</div>;

    if (score !== null) {
        return (
            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                {score >= 70 ? (
                    <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                ) : (
                    <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                )}
                <h2>Quiz Completed!</h2>
                <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Your Score: <strong>{score}%</strong></p>
                <button onClick={onComplete} className="btn btn-primary mt-4">Return</button>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{quiz.title}</h2>
            
            {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: qIdx < quiz.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{qIdx + 1}. {q.questionText}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {q.options.map((opt, oIdx) => (
                            <label key={oIdx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                padding: '1rem', 
                                background: answers[qIdx] === oIdx ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass)', 
                                border: answers[qIdx] === oIdx ? '1px solid var(--primary)' : '1px solid transparent',
                                borderRadius: '0.5rem', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name={`question-${qIdx}`} 
                                    checked={answers[qIdx] === oIdx}
                                    onChange={() => handleOptionSelect(qIdx, oIdx)}
                                    style={{ accentColor: 'var(--primary)', width: '1.2rem', height: '1.2rem' }}
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
                <button onClick={onComplete} className="btn btn-secondary" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default QuizView;
