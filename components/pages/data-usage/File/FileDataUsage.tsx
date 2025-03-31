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
            <h2 className="info-title"><b>File Data Usage</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    When scanning files, attachments are sent to third-party security services.
                    No personal data content is shared or saved. Click the service for details:
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('metadefender')}
                    >
                        MetaDefender {openSection === 'metadefender' ? '▲' : '▼'}
                    </button>
                    {openSection === 'metadefender' && (
                        <div className="dropdown-content">
                            <p>Files are submitted to MetaDefender Cloud for multi-scanning malware detection.
                            Results may be stored in their database for improved threat intelligence.</p>
                            <a style={{color:"white"}} href="https://www.opswat.com/docs/mdcloud/compliance/confidentiality" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    By using this feature, you consent to file sharing for security verification.
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