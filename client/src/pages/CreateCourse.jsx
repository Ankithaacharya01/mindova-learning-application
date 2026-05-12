import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
    const [course, setCourse] = useState({ title: '', description: '', price: 15000, thumbnail: '', videoUrl: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://https://mindova-learning-application.onrender.com/api/courses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(course)
            });
            if (res.ok) {
                navigate('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>Create New Course</h2>
            <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Course Title</label>
                    <input 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setCourse({...course, title: e.target.value})}
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Description</label>
                    <textarea 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left', minHeight: '100px' }}
                        onChange={e => setCourse({...course, description: e.target.value})}
                        required
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Price (₹)</label>
                        <input 
                            type="number"
                            className="btn" 
                            style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                            onChange={e => setCourse({...course, price: e.target.value})}
                            required
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Direct Video Link (Optional)</label>
                    <input 
                        type="url"
                        placeholder="https://..."
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setCourse({...course, videoUrl: e.target.value})}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Publish Course</button>
            </form>
        </div>
    );
};

export default CreateCourse;
