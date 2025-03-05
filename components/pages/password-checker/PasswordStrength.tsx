import {useState} from 'react';
import zxcvbn from 'zxcvbn';

function PasswordStrength({ inputPassword } : {inputPassword: string }) {
    const [password, setPassword] = useState(inputPassword);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string[]>([]);
    const initialized = useRef(false);

    // biblioteka apskaiciuoja stipruma
    const handleChange = (newPassword: string) => {
        initialized.current = true;
        setPassword(newPassword);
        const result = zxcvbn(newPassword);
        setScore(result.score);
        setFeedback(result.feedback.suggestions);
    };

    // if input password is not empty, it should be initialized to display the results immediately
    if (!initialized.current && inputPassword){
        handleChange(inputPassword);
    }

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
            <div style={{marginTop: "1em"}}>
                <h2 style={{color: "white"}}>Slaptažodžio stiprumas</h2>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => handleChange(e.target.value)}
                    style={{padding: "0.5rem", width: "90%"}}
                />
                <div style={{marginTop: "0.5rem", fontWeight: "bold", color: "white"}}>
                    Stiprumas: {getLabel(score)}
                </div>
                {feedback.length > 0 && (
                    <ul style={{marginTop: "0.5rem", fontSize: "0.9rem", color: "red"}}>
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

export default PasswordStrength;