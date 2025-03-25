import { useState, useRef } from "react";
import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import PasswordBreaches from "@/components/pages/password-checker/PasswordBreaches.tsx";
import {useParams} from "react-router";

function PasswordChecker() {
    const { password: urlPassword } = useParams();
    const [activeTab, setActiveTab] = useState<"checker" | "tips">("checker");
    const [password, setPassword] = useState(urlPassword || '');

    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
    };

    return (
        <>
        <div style={{
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto"
        }}>
            <h2 style={{color: "white", marginTop: '1rem' }}>Password checker</h2>
            <div style={{
                display: "flex", 
                justifyContent: "center", 
                margin: "0 auto 1rem auto",
                width: "90%"
            }}>
                <button 
                    onClick={() => setActiveTab("checker")} 
                    style={{
                        backgroundColor: activeTab === "checker" ? "#4b5563" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "8px 0 0 8px",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        width: "50%"
                    }}
                >
                    Check
                </button>
                <button 
                    onClick={() => setActiveTab("tips")} 
                    style={{
                        backgroundColor: activeTab === "tips" ? "#4b5563" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "0 8px 8px 0",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        width: "50%"
                    }}
                >
                    Tips
                </button>
            </div>

            {activeTab === "checker" && (
                <>
                    <div>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            style={{padding: "0.5rem", width: "90%", margin: "0 auto"}}
                        />
                    </div>
                    
                    <PasswordStrength inputPassword={password} />
                    <PasswordBreaches inputPassword={password} />
                </>
            )}

            {activeTab === "tips" && (
                <>
                    <PasswordTips/>
                </>
            )}
        </div>
        </>
    );
}

export default PasswordChecker;