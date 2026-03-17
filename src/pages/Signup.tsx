import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Signup attempt', { name, email, password });
    };

    return (
        <div className="page-container">
            <div className="auth-container glass-panel animate-fade-in">
                <h2 className="auth-title">Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                        />
                    </div>
                    <button type="submit" className="go-button" style={{ width: '100%', marginTop: '1rem' }}>Sign Up</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#ccc' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
