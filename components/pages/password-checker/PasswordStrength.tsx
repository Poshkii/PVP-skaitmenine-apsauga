
import { useState } from 'react';
import zxcvbn from 'zxcvbn';

export function PasswordStrength() {
    const [password, setPassword] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string[]>([]);

    // biblioteka apskaiciuoja stipruma
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setPassword(newPassword);
        const result = zxcvbn(newPassword);
        setScore(result.score);
        setFeedback(result.feedback.suggestions);
    };

    // gauna stiprumo reiksme
    const getLabel = (score: number) => {
        switch (score) {
            case 0:
              return "Labai silpnas";
            case 1:
              return "Silpnas";
            case 2:
              return "Vidutinis";
            case 3:
              return "Stiprus";
            case 4:
              return "Labai stiprus";
            default:
              return "";
        }
    };

    // UI atvaizduoti stipruma
    return (
        <>
        <div style={{ marginTop: "1em" }}>
            <h2>Slaptažodžio stiprumas</h2>
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={handleChange}
                style={{ padding: "0.5rem", width: "90%" }}
            />
            <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                Stiprumas: {getLabel(score)}
            </div>
            {feedback.length > 0 && (
                <ul style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "red" }}>
                {feedback.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
                </ul>
            )}
        </div>
        <br></br>
        <div style={{border: '1px solid white', width: '100%'}}></div>
        </>
    );
}