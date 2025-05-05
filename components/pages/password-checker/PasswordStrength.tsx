import {useState, useEffect, useRef } from 'react';
import zxcvbn from 'zxcvbn';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

function customPasswordAnalysis(password: string): string[] {
    const suggestions: string[] = [];

    // Emphasize length
    if (password.length < 8) {
        suggestions.push("Use at least 8 characters. Longer passwords are much stronger.");
    } else if (password.length < 12) {
        suggestions.push("Consider using 12 or more characters for better security.");
    }

    // Optional: flag common weak patterns (even though zxcvbn catches many)
    if (/^[a-z]{1,}$/i.test(password)) {
        suggestions.push("Avoid simple dictionary words alone. Try a longer passphrase.");
    }

    // Optional: warn about very repetitive characters
    if (/([a-zA-Z0-9])\1{3,}/.test(password)) {
        suggestions.push("Avoid repeating the same character multiple times.");
    }

    // Optional: warn if it's all one character type
    if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
        suggestions.push("Mixing character types can help avoid guessable patterns.");
    }

    return suggestions;
}


const getStrengthPercentage = (score: number) => {
    return ((score + 1) / 5) * 100; // score is 0–4
};

function PasswordStrength({ inputPassword } : {inputPassword: string }) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string[]>([]);
    const initialized = useRef(false);
    const { t } = useTranslation('passwords');

    useEffect(() => {
        if (inputPassword) {
            initialized.current = true;
            const result = zxcvbn(inputPassword);
            const customSuggestions = customPasswordAnalysis(inputPassword);
            const combinedFeedback = [...result.feedback.suggestions, ...customSuggestions];
            setScore(result.score);
            setFeedback(customSuggestions);
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
                    <div className="security-status" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div className="status-icon" style={{
                            background: getColor(score),
                            borderRadius: '50%',
                            padding: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            minHeight: '32px',
                            marginTop: '4px' // optional fine-tuning
                        }}>
                            {score >= 3 ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertTriangle size={20} />
                            )}
                        </div>

                        <div className="status-text" style={{ flexGrow: 1 }}>
                            <h3 className="status-title" style={{ margin: 0 }}>
                                {t('pswdStrength')}
                                {getLabel(score)}
                            </h3>

                            <div className="strength-meter" style={{
                                height: '8px',
                                width: '100%',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                marginTop: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${getStrengthPercentage(score)}%`,
                                    backgroundColor: getColor(score),
                                    transition: 'width 0.3s ease-in-out'
                                }} />
                            </div>

                            {feedback.length > 0 && (
                                <ul className="status-description" style={{
                                    marginTop: "0.5rem",
                                    listStylePosition: "inside",
                                    paddingLeft: 0
                                }}>
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