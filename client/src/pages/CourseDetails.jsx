import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://https://mindova-learning-application.onrender.com/api/courses/${id}`)
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
    }, [id]);

    const enroll = async () => {
        if (!user) return alert('Please login to enroll');
        try {
            const res = await fetch(`http://https://mindova-learning-application.onrender.com/api/courses/${id}/enroll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                alert('Enrollment requested successfully! Waiting for admin approval.');
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading course details...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
    if (!course) return null;

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
                            <button onClick={enroll} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
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
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
