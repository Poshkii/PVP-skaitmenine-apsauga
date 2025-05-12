import React from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import { DeleteIcon } from "lucide-react"; 

const API_URL = useAppConfig().privacyApiUrl;

function DeleteAccount() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation('login');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Token not set");
            }

            const response = await fetch(API_URL + '/users/delete', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({password}),
            });

            if (!response.ok) {
                const msg = await response.json();

                if (msg.error) {
                    throw new Error(msg.error);
                }

                throw new Error("Failed to delete user");
            }

            localStorage.removeItem("token");
            navigate('/login');
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
                <form onSubmit={handleSubmit}>
                    <div className="security-status" style={{}}>
                        <div className="status-icon">
                            <DeleteIcon size={30} />
                        </div>
                        <div className="status-text">
                            <h3 className="status-title">
                                {t('deleteTitle')}
                            </h3>
                            <h4 className="status-description">{t('deleteDesc')}</h4>
                        </div>
                    </div>
                    <div style={{marginTop:"16px"}}>
                        <input
                            className='input-box'
                            type="password"
                            id="confirmPassword"
                            placeholder={t('confirm')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="action-buttons">
                        <button
                            className="btn btn-danger"
                            style={{width: '100%'}}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? t('loading') : t('delete')}
                        </button>
                    </div>
                </form>
            </div>
        </>

    )

}


export default DeleteAccount;