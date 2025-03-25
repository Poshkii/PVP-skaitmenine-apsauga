import React, { useState, useEffect } from 'react';

function PasswordBreachChecker({ inputPassword } : {inputPassword: string }) {
    interface Result {
        breached: boolean;
        count: number;
        message: string;
        error?: boolean;
    }

    const [result, setResult] = useState<Result | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        setResult(null);
    }, [inputPassword]);

    const checkPasswordBreach = async () => {
        if (!inputPassword) return;
        
        setIsChecking(true);
        setResult(null);
        
        try {
            const sha1Password = await calculateSHA1(inputPassword);
            const prefix = sha1Password.substring(0, 5);
            const suffix = sha1Password.substring(5);
            
            // HIBP API 
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            
            if (!response.ok) {
                throw new Error('Failed to check password');
            }
            
            const data = await response.text();
            const breachData = data.split('\n');
            let breachCount = 0;
            
            for (const line of breachData) {
                const [hashSuffix, count] = line.split(':');
                if (hashSuffix.trim() === suffix) {
                breachCount = parseInt(count.trim());
                break;
                }
            }
            
            if (breachCount > 0) {
                setResult({
                    breached: true,
                    count: breachCount,
                    message: `This password has been found in ${breachCount.toLocaleString()} data breaches.`
                });
            } 
            else {
                setResult({
                    breached: false,
                    count: 0,
                    message: 'This password has not been found in any known data breaches.'
                });
            }
        } 
        catch (error) {
            console.error('Error checking password:', error);
            setResult({
                breached: false,
                count: 0,
                error: true,
                message: 'Unable to check if password has been breached. Please try again later.'
            });
        } 
        finally {
            setIsChecking(false);
        }
    }

    async function calculateSHA1(text: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        
        return hashHex.toUpperCase();
    }

    return (
        <>
            <div style={{ color: "white" }}>
                <div className="password-breach-checker">
                    <div className="input-group">
                        <button
                            onClick={checkPasswordBreach}
                            disabled={!inputPassword || isChecking}
                            style={{
                                width: "70%",
                                height: "40px",
                                margin: "1rem auto",
                                backgroundColor: !inputPassword || isChecking ? "#6b7280" : "#4b5563",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                outline: "none",
                                cursor: !inputPassword || isChecking ? "not-allowed" : "pointer"
                            }}
                        >
                            <div>
                                {isChecking ? "Checking..." : "Check password status"}
                            </div>
                        </button>
                    </div>
                    
                    {result && (
                        <div style={{ width: '80%', margin: '0 auto' }} className={`result ${result.breached ? 'breached' : 'safe'}`}>
                        <p>{result.message}</p>
                            {result.breached}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PasswordBreachChecker;