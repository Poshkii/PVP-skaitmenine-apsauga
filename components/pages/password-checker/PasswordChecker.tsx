import { useState, useRef } from "react";
import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import PasswordBreaches from "@/components/pages/password-checker/PasswordBreaches.tsx";
import {useParams} from "react-router";
import {useNavigate} from "react-router";
import { Info, Lock, Book, Eye, EyeOff} from 'lucide-react';
import { useTranslation } from "react-i18next";

function PasswordChecker() {
    const { password: urlPassword } = useParams();
    const [activeTab, setActiveTab] = useState<"checker" | "tips">("checker");
    const [password, setPassword] = useState(urlPassword || '');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation('passwords');

    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
    };

    const navigate = useNavigate();

    return (
        <>
            <div className="middle-menu">
                <h1 className="panel-title">
                    {t('pageName')}<span onClick={() => navigate("/password-data")}><Info className="info-icon"/></span>
                </h1>
                
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab("checker")} 
                        className={`btn ${activeTab === "checker" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Lock size={18} />
                            {t('pswdCheck')}
                        </div>
                    </button>
                    <button 
                        onClick={() => setActiveTab("tips")} 
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            {t('secTips')}
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
                                        {t('statusTitle')}
                                    </h3>
                                    <p className="status-description">
                                        {t('desc')}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: "16px", position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('enter')}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className="input-box"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    {showPassword ? <EyeOff size={24} color="white"/> : <Eye size={24} color="white"/>}
                                </button>
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