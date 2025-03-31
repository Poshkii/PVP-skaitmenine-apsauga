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
            <h2 className="info-title"><b>Email Data Usage</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    When scanning for data breaches, your email address is checked against known breach databases.
                    Click the service for details:
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('xposedornot')}
                    >
                        XposedOrNot {openSection === 'xposedornot' ? '▲' : '▼'}
                    </button>
                    {openSection === 'xposedornot' && (
                        <div className="dropdown-content">
                            <p>Your email address is sent to XposedOrNot to check against their database of 
                            known data breaches. The service does not store your email for purposes 
                            beyond the immediate check.</p>
                            <a style={{color:"white"}} href="https://xposedornot.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    By using this feature, you consent to your email address being shared for breach verification.
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