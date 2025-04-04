import { useState, useRef } from "react";
import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import PasswordBreaches from "@/components/pages/password-checker/PasswordBreaches.tsx";
import {useParams} from "react-router";
import {useNavigate} from "react-router";
import { Info, Lock, Book } from 'lucide-react';

function PasswordChecker() {
    const { password: urlPassword } = useParams();
    const [activeTab, setActiveTab] = useState<"checker" | "tips">("checker");
    const [password, setPassword] = useState(urlPassword || '');

    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
    };

    const navigate = useNavigate();

    return (
        <>
            <div className="middle-menu">
                <h1 className="panel-title">
                    Check Password Strength <span onClick={() => navigate("/password-data")}><Info className="info-icon"/></span>
                </h1>
                
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab("checker")} 
                        className={`btn ${activeTab === "checker" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Lock size={18} />
                            Password Checker
                        </div>
                    </button>
                    <button 
                        onClick={() => setActiveTab("tips")} 
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            Security Tips
                        </div>
                    </button>
                </div>

                {activeTab === "checker" && (
                    <>
                        <div className="security-check-container glassmorphism">
                            <div className="security-status">
                                <div className="status-icon">
                                    <Lock size={32} />
                                </div>
                                <div className="status-text">
                                    <h3 className="status-title">
                                        Check Password Security
                                    </h3>
                                    <p className="status-description">
                                        Enter your password to check its strength and if it has appeared in data breaches
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{marginTop: "16px"}}>
                                <input
                                    type="password"
                                    placeholder="Enter password to check"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className="input-box"
                                />
                            </div>

                            
                            {password && <PasswordStrength inputPassword={password} />}
                        </div>
                        
                        {password && <PasswordBreaches inputPassword={password} />}
                    </>
                )}

                {activeTab === "tips" && <PasswordTips />}
            </div>
        </>
    );
}

export default PasswordChecker;