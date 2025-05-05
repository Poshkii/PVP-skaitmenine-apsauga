import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from "react-i18next";
import DeleteAccount from "@/components/pages/profile/DeleteAccount.tsx";

interface User {
    userId: number;
    username: string;
    createdAt: string;
    lastLogin: string;
    isPaid: boolean;
}

const API_URL = useAppConfig().privacyApiUrl;

function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {t} = useTranslation('login');

    const logout = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Token not set");
            }

            await fetch(API_URL + '/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            });

        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            localStorage.removeItem("token");
            navigate('/login');
        }
    }


    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Token not set");
                }

                const response = await fetch(API_URL + '/users/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Unauthorized, redirect to login
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to fetch user profile');
                }

                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching profile:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (loading) {
        return <div>{t('Loading')}</div>;
    }

    return (
        <>
            <h1 className="panel-title">{t('profile')}</h1>
            <div className="security-check-container glassmorphism">
                {user ? (
                    <div>
                        <h4>{t('welcome', {user: user.username})}</h4>
                        <h5>{t('paid')}{user.isPaid ? t('yes') : t('no')}</h5>
                    </div>
                ) : (
                    <p>{t('cannotLoad')}</p>
                )}
                <div className="action-buttons">
                    <button
                        className="btn btn-primary"
                        onClick={logout}>{t('logout')}
                    </button>
                </div>
            </div>
            <DeleteAccount/>
        </>
    );
};

export default Profile;