import {useState, useEffect, useRef } from 'react';
import zxcvbn from 'zxcvbn';

function PasswordStrength({ inputPassword } : {inputPassword: string }) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string[]>([]);
    const initialized = useRef(false);

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
                return "Very weak";
            case 1:
                return "Weak";
            case 2:
                return "Average";
            case 3:
                return "Strong";
            case 4:
                return "Very strong";
            default:
                return "";
        }
    }

    // UI atvaizduoti stipruma
    return (
        <>
            <div style={{marginTop: "1em"}}>
                {inputPassword.length > 0 && (
                    <>
                        <div style={{ fontWeight: "bold", color: "white" }}>
                            Strength: {getLabel(score)}
                        </div>
                        {feedback.length > 0 && (
                            <ul style={{marginTop: "0.5rem", fontSize: "0.9rem", color: "red", marginBottom: '0'}}>
                                {feedback.map((msg, index) => (
                                    <li key={index}>{msg}</li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default PasswordStrength;