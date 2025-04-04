import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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

    const getColor = (result:boolean) => {
        switch (result) {
            case true:
                return "var(--error)";
            default:
                return "var(--success)";
        }
    }

    return (
        <>
            <div className="">
                <button
                    onClick={checkPasswordBreach}
                    disabled={!inputPassword || isChecking}
                    className={`btn btn-primary ${(!inputPassword || isChecking) ? 'disabled-button' : ''}`}
                >
                    <div className="button-content">
                        {isChecking ? (
                            <>
                                <div className="loading-spinner"></div>
                                Checking...
                            </>
                        ) : (
                            <>
                                Check for Breaches
                            </>
                        )}
                    </div>
                </button>
            </div>
            {result && (
                <div className="security-check-container" style={{marginTop: "16px"}}>
                    <div className="security-status" style={{marginTop: "16px"}}>
                        <div className="status-icon" style={{ background: getColor(result.breached)}}>
                            {result.breached ? (
                                <span><AlertTriangle/></span>
                            ) : (
                                <span><CheckCircle/></span>
                            )}
                        </div>
                        <div className="status-text">
                            <h3 className="status-title">
                                {result.breached ? 'Password Compromised' : 'Password Not Found in Breaches'}
                            </h3>
                            <p className="status-description">{result.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PasswordBreachChecker;