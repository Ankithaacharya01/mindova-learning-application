import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://mindova-learning-application-1.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/dashboard');
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="auth-card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="btn" 
                        style={{ background: 'var(--glass)', color: 'white', border: '1px solid var(--border)', textAlign: 'left' }}
                        onChange={e => setCredentials({...credentials, password: e.target.value})}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Sign In</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
