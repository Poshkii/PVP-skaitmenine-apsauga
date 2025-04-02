import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

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
        return <div>Loading...</div>;
    }

    return (
        <>
            <h1 className="panel-title">Profile</h1>
            <div className="security-check-container">
                {user ? (
                    <div>
                        <h4>Welcome, {user.username}!</h4>
                        <h5>Paid user: {user.isPaid ? "Yes" : "No"}</h5>
                    </div>
                ) : (
                    <p>Unable to load profile information.</p>
                )}
                <div className="action-buttons">
                    <button
                        className="btn btn-primary"
                        onClick={logout}>Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Profile;