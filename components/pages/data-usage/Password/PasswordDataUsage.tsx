import "../info.css";
import { useState } from "react";

function InfoPage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };

    const [openSection, setOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="info-page"
            style={{
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            paddingBottom: "30px",
        }}>
            <h2 className="info-title"><b>Password Data Usage</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    When checking password strength, your password is processed locally in your browser.
                    No password data is transmitted or stored. Click the service for details:
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('zxcvbn')}
                    >
                        zxcvbn {openSection === 'zxcvbn' ? '▲' : '▼'}
                    </button>
                    {openSection === 'zxcvbn' && (
                        <div className="dropdown-content">
                            <p>The zxcvbn library runs entirely in your browser to evaluate password strength.
                            Your password is never sent to any server and all processing happens locally on your device.</p>
                            <a style={{color:"white"}} href="https://github.com/dropbox/zxcvbn" target="_blank" rel="noopener noreferrer">Project Page</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    This feature is designed with privacy in mind and keeps your password data secure.
                </p>
                
                <button className="custom-button"
                    onClick={() => window.history.back()}
                >
                    Go back
                </button>
            </div>
        </div>
    );

}

export default InfoPage;