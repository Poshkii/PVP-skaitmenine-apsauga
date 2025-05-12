import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Info, Lock, Book, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from "react-i18next";

import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import PasswordBreaches from "@/components/pages/password-checker/PasswordBreaches.tsx";
import PasswordGenerator from "@/components/pages/password-checker/PasswordGenerator.tsx";

function PasswordChecker() {
    const { password: urlPassword } = useParams();
    const [activeTab, setActiveTab] = useState<"checker" | "tips" | "generator">("checker");
    const [password, setPassword] = useState(urlPassword || '');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation('passwords');

    const navigate = useNavigate();

    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
    };

    return (
        <div className="middle-menu">
            <h1 className="panel-title">
                {t('pageName')}
                <span onClick={() => navigate("/password-data")}>
                    <Info className="info-icon" />
                </span>
            </h1>

            <div className="tab-buttons">
                <button 
                    style={ {marginRight: "8px"} }
                    onClick={() => setActiveTab("checker")} 
                    className={`btn ${activeTab === "checker" ? "btn-primary" : "btn-secondary"} tab-button`}
                >
                    <div className="button-content">
                        <Lock size={18} />
                        {t('pswdCheck')}
                    </div>
                </button>
                <button 
                    style={ {marginRight: "8px"} }
                    onClick={() => setActiveTab("generator")} 
                    className={`btn ${activeTab === "generator" ? "btn-primary" : "btn-secondary"} tab-button`}
                >
                    <div className="button-content">
                        <Sparkles size={18} />
                        {t('generator')}
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
                                <h3 className="status-title">{t('statusTitle')}</h3>
                                <p className="status-description">{t('desc')}</p>
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
                                {showPassword ? <EyeOff size={24} color="white" /> : <Eye size={24} color="white" />}
                            </button>
                        </div>

                        {password && <PasswordStrength inputPassword={password} />}
                    </div>

                    {password && <PasswordBreaches inputPassword={password} />}
                </>
            )}
            {activeTab === "generator" && <PasswordGenerator />}
            {activeTab === "tips" && <PasswordTips />}
        </div>
    );
}

export default PasswordChecker;
