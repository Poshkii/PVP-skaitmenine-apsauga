import {useState, useEffect, useRef } from 'react';
import zxcvbn from 'zxcvbn';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

function PasswordStrength({ inputPassword } : {inputPassword: string }) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string[]>([]);
    const initialized = useRef(false);
    const { t } = useTranslation('passwords');

    useEffect(() => {
        if (inputPassword) {
            initialized.current = true;
            const result = zxcvbn(inputPassword);
            setScore(result.score);
            setFeedback(result.feedback.suggestions);
        }
    }, [inputPassword]);

    // gauna stiprumo reiksme
    const getLabel = (score: number) => {
        switch (score) {
            case 0:
                return t('veryWeak');
            case 1:
                return t('weak');
            case 2:
                return t('average');
            case 3:
                return t('strong');
            case 4:
                return t('veryStrong');
            default:
                return "";
        }
    }

    const getColor = (score: number) => {
        switch (score) {
            case 0:
            case 1:
                return "var(--error)";
            case 2:
                return "var(--warning)";
            case 3:
            case 4:
                return "var(--success)";
            default:
                return "var(--text-primary)";
        }
    }

    // UI atvaizduoti stipruma
    return (
        <>
            {inputPassword.length > 0 && (
                <div style={{marginTop:"24px"}}>
                    <div className="security-status">
                        <div className="status-icon" style={{ background: getColor(score) }}>
                            {score >= 3 ? (
                                <span><CheckCircle/></span>
                            ) : (
                                <span><AlertTriangle/></span>
                            )}
                        </div>
                        <div className="status-text">
                            <h3 className="status-title">
                                {t('pswdStrength')}<br></br>
                                {getLabel(score)}
                            </h3>
                            {feedback.length > 0 && (
                                <ul className="status-description" style={{marginTop: "0.5rem", listStylePosition: "inside", paddingLeft: 0}}>
                                    {feedback.map((msg, index) => (
                                        <li key={index}>{msg}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PasswordStrength;