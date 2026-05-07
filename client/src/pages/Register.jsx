import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                navigate('/login');
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="auth-card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setForm({...form, name: e.target.value})}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setForm({...form, email: e.target.value})}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setForm({...form, password: e.target.value})}
                        required
                    />
                    <select 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', appearance: 'none' }}
                        onChange={e => setForm({...form, role: e.target.value})}
                        value={form.role}
                    >
                        <option value="student" style={{ color: 'black' }}>Student</option>
                        <option value="instructor" style={{ color: 'black' }}>Instructor</option>
                        <option value="admin" style={{ color: 'black' }}>Admin</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
