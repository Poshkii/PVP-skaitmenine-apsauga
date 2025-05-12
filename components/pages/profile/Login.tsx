import React, {useState} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from "react-i18next";
import {useUserSession} from "@/components/providers/UserSessionProvider.tsx";

const API_URL = useAppConfig().privacyApiUrl;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {t} = useTranslation('login');
    const { refreshSession } = useUserSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(API_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password})
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            await browser.storage.local.set({ token : data.token });

            await refreshSession();

            // Successful login
            navigate('/profile');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="panel-title">{t('login')}</h1>
            <div className="security-check-container glassmorphism">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            className='input-box'
                            type="email"
                            id="email"
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className='input-box'
                            style={{marginTop: '15px'}}
                            type="password"
                            id="password"
                            placeholder={t('pswd')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            {loading ? t('loading') : t('login')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{width: '100%'}}
                            onClick={() => navigate("/register")}>
                            {t('register')}
                        </button>
                    </div>
                </form>
            </div>

        </>
    );
};

export default Login;