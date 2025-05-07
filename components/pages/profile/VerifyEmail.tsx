import React from "react";
import {useTranslation} from "react-i18next";

const API_URL = useAppConfig().privacyApiUrl;

function VerifyEmail() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const {t} = useTranslation('login');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Token not set");
            }

            const response = await fetch(API_URL + '/resend-verification', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const msg = await response.json();

                if (msg.error) {
                    throw new Error(msg.error);
                }

                throw new Error("Failed to resend verification");
            }
            setSuccess(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="security-check-container glassmorphism">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{t('sent')}</div>}
                <form onSubmit={handleSubmit}>
                    <h4>{t('unverified')}</h4>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            style={{width: '100%'}}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? t('loading') : t('resend')}
                        </button>
                    </div>
                </form>
            </div>
        </>

    )

}


export default VerifyEmail;