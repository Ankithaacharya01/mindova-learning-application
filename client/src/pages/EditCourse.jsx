import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonContent, setLessonContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [includeQuiz, setIncludeQuiz] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
    
    const [submitting, setSubmitting] = useState(false);

    // Course Quiz states
    const [courseQuizTitle, setCourseQuizTitle] = useState('');
    const [courseQuestions, setCourseQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
    const [submittingCourseQuiz, setSubmittingCourseQuiz] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`https://mindova-learning-application-1.onrender.com/api/courses/${id}`);
            if (!res.ok) throw new Error('Course not found');
            const data = await res.json();
            setCourse(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        if (field === 'questionText') {
            newQuestions[index].questionText = value;
        } else if (field === 'correctOption') {
            newQuestions[index].correctOption = parseInt(value);
        } else {
            // Options change
            newQuestions[index].options[field] = value;
        }
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleCourseQuestionChange = (index, field, value) => {
        const newQuestions = [...courseQuestions];
        if (field === 'questionText') {
            newQuestions[index].questionText = value;
        } else if (field === 'correctOption') {
            newQuestions[index].correctOption = parseInt(value);
        } else {
            newQuestions[index].options[field] = value;
        }
        setCourseQuestions(newQuestions);
    };

    const addCourseQuestion = () => {
        setCourseQuestions([...courseQuestions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const removeCourseQuestion = (index) => {
        const newQuestions = courseQuestions.filter((_, i) => i !== index);
        setCourseQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // 1. Create Lesson
            const lessonRes = await fetch('https://mindova-learning-application-1.onrender.com/api/lessons', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: lessonTitle,
                    content: lessonContent,
                    videoUrl,
                    courseId: id,
                    order: course.lessons ? course.lessons.length : 0
                })
            });
            
            if (!lessonRes.ok) throw new Error('Failed to create lesson');
            const lessonData = await lessonRes.json();

            // 2. Create Quiz if selected
            if (includeQuiz) {
                const quizRes = await fetch('https://mindova-learning-application-1.onrender.com/api/quizzes', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        title: quizTitle || `Quiz: ${lessonTitle}`,
                        lessonId: lessonData._id,
                        questions: questions
                    })
                });

                if (!quizRes.ok) throw new Error('Failed to create quiz');
                const quizData = await quizRes.json();

                // 3. Link Quiz to Lesson
                await fetch(`https://mindova-learning-application-1.onrender.com/api/lessons/${lessonData._id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ quizId: quizData._id })
                });
            }

            alert('Lesson added successfully!');
            // Reset form
            setLessonTitle('');
            setLessonContent('');
            setVideoUrl('');
            setIncludeQuiz(false);
            setQuizTitle('');
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
            
            // Refresh course data
            fetchCourse();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCourseQuizSubmit = async (e) => {
        e.preventDefault();
        setSubmittingCourseQuiz(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mindova-learning-application-1.onrender.com/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: courseQuizTitle || `Final Quiz: ${course.title}`,
                    courseId: id,
                    questions: courseQuestions
                })
            });

            if (!res.ok) throw new Error('Failed to create course quiz');
            alert('Course Quiz added successfully!');
            setCourseQuizTitle('');
            setCourseQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingCourseQuiz(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Course Editor...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>&larr; Back to Dashboard</button>
            
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Editing: {course.title}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{course.description}</p>
                
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Current Lessons ({course.lessons?.length || 0})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {course.lessons && course.lessons.map((lesson, idx) => (
                        <div key={lesson._id} style={{ padding: '1rem', background: 'var(--glass)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span><strong>{idx + 1}.</strong> {lesson.title}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {lesson.quizId ? '✅ Includes Quiz' : '❌ No Quiz'}
                            </span>
                        </div>
                    ))}
                    {(!course.lessons || course.lessons.length === 0) && (
                        <p style={{ color: 'var(--text-muted)' }}>No lessons added yet.</p>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Add New Lesson</h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Lesson Title</label>
                        <input 
                            required
                            className="btn" 
                            style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            placeholder="e.g., Introduction to React"
                        />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Lesson Content / Reading Material</label>
                        <textarea 
                            required
                            className="btn" 
                            style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', minHeight: '120px' }}
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                            placeholder="Write the lesson content here..."
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Video URL (Optional)</label>
                        <input 
                            type="url"
                            className="btn" 
                            style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--primary)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input 
                                type="checkbox" 
                                checked={includeQuiz}
                                onChange={(e) => setIncludeQuiz(e.target.checked)}
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                            />
                            Add a Knowledge Check Quiz to this Lesson
                        </label>
                        
                        {includeQuiz && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label>Quiz Title</label>
                                    <input 
                                        className="btn" 
                                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        placeholder={`Quiz: ${lessonTitle || 'Untitled Lesson'}`}
                                    />
                                </div>

                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} style={{ background: 'var(--glass)', padding: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                        {questions.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeQuestion(qIdx)}
                                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        )}
                                        <h4 style={{ marginBottom: '1rem' }}>Question {qIdx + 1}</h4>
                                        <input 
                                            required
                                            className="btn" 
                                            style={{ background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', width: '100%', marginBottom: '1rem' }}
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                                            placeholder="What is the main topic?"
                                        />
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input 
                                                        type="radio" 
                                                        name={`correct-${qIdx}`}
                                                        checked={q.correctOption === oIdx}
                                                        onChange={() => handleQuestionChange(qIdx, 'correctOption', oIdx)}
                                                        style={{ accentColor: 'var(--primary)', width: '1rem', height: '1rem' }}
                                                        title="Mark as correct answer"
                                                    />
                                                    <input 
                                                        required
                                                        className="btn" 
                                                        style={{ background: 'var(--bg)', color: 'white', border: q.correctOption === oIdx ? '1px solid var(--primary)' : '1px solid var(--border)', textAlign: 'left', flex: 1, padding: '0.5rem' }}
                                                        value={opt}
                                                        onChange={(e) => handleQuestionChange(qIdx, oIdx, e.target.value)}
                                                        placeholder={`Option ${oIdx + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <button type="button" onClick={addQuestion} className="btn btn-outline" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Plus size={16} /> Add Another Question
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {submitting ? 'Saving Lesson...' : 'Save Lesson & Publish'}
                    </button>
                </form>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Add Course-Level Quiz</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This quiz will be tied to the entire course, independent of individual lessons.</p>
                
                <form onSubmit={handleCourseQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Course Quiz Title</label>
                        <input 
                            className="btn" 
                            style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                            value={courseQuizTitle}
                            onChange={(e) => setCourseQuizTitle(e.target.value)}
                            placeholder={`Final Quiz: ${course?.title || ''}`}
                        />
                    </div>

                    {courseQuestions.map((q, qIdx) => (
                        <div key={qIdx} style={{ background: 'var(--glass)', padding: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                            {courseQuestions.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeCourseQuestion(qIdx)}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                    <XCircle size={20} />
                                </button>
                            )}
                            <h4 style={{ marginBottom: '1rem' }}>Question {qIdx + 1}</h4>
                            <input 
                                required
                                className="btn" 
                                style={{ background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', width: '100%', marginBottom: '1rem' }}
                                value={q.questionText}
                                onChange={(e) => handleCourseQuestionChange(qIdx, 'questionText', e.target.value)}
                                placeholder="What is the main topic?"
                            />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input 
                                            type="radio" 
                                            name={`course-correct-${qIdx}`}
                                            checked={q.correctOption === oIdx}
                                            onChange={() => handleCourseQuestionChange(qIdx, 'correctOption', oIdx)}
                                            style={{ accentColor: 'var(--primary)', width: '1rem', height: '1rem' }}
                                            title="Mark as correct answer"
                                        />
                                        <input 
                                            required
                                            className="btn" 
                                            style={{ background: 'var(--bg)', color: 'white', border: q.correctOption === oIdx ? '1px solid var(--primary)' : '1px solid var(--border)', textAlign: 'left', flex: 1, padding: '0.5rem' }}
                                            value={opt}
                                            onChange={(e) => handleCourseQuestionChange(qIdx, oIdx, e.target.value)}
                                            placeholder={`Option ${oIdx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addCourseQuestion} className="btn btn-outline" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Add Another Question
                    </button>

                    <button type="submit" disabled={submittingCourseQuiz} className="btn btn-primary" style={{ marginTop: '1rem', background: '#10b981', color: 'white' }}>
                        {submittingCourseQuiz ? 'Saving Quiz...' : 'Save Course Quiz'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCourse;
