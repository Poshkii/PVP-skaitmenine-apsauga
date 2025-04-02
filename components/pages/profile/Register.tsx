import React, {useState} from 'react';
import {useNavigate} from 'react-router';

const API_URL = useAppConfig().privacyApiUrl;

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_URL + '/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('User already exists');
                }
                throw new Error('Registration failed');
            }

            // Successful registration, redirect to login
            navigate('/login');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="panel-title">Register</h1>
            <div className="security-check-container">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            className='input-box'
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className='input-box'
                            style={{marginTop: '15px'}}
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className='input-box'
                            style={{marginTop: '15px'}}
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            style={{width: '100%'}}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{width: '100%'}}
                            onClick={() => navigate("/login")}>
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Register;