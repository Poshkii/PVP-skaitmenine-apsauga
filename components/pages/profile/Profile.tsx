import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import './Profile.css';

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

            await fetch(API_URL + '/api/logout', {
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

                const response = await fetch(API_URL + '/api/users/me', {
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
        <div style={{padding: '1rem'}}>
            <div>
                <h2>Profile</h2>
            </div>
            <div>
                {user ? (
                    <div>
                        <h3>Welcome, {user.username}!</h3>
                        <h3>Paid user: {user.isPaid ? "Yes" : "No"}</h3>
                    </div>
                ) : (
                    <p>Unable to load profile information.</p>
                )}

                <button
                    className="button"
                    onClick={logout}>Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;