import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from "react-i18next";
import DeleteAccount from "@/components/pages/profile/DeleteAccount.tsx";
import VerifyEmail from "@/components/pages/profile/VerifyEmail.tsx";
import {useUserSession} from "@/components/providers/UserSessionProvider.tsx";

function Profile() {
    const navigate = useNavigate();
    const { user, logoutSession } = useUserSession();
    const {t} = useTranslation('login');

    const logout = async () => {
        await logoutSession();
        navigate("/login");
    }

    useEffect(() => {
        if (!user){
            navigate('/login');
        }
    }, [navigate]);

    return (
        <>
            <h1 className="panel-title">{t('profile')}</h1>
            {!user?.verified && <VerifyEmail/>}
            <div className="security-check-container glassmorphism">
                {user ? (
                    <div>
                        <h4>{t('welcome', {user: user.email})}</h4>
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