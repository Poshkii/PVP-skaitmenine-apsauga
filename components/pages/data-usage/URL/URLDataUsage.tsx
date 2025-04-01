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
            <h2 className="info-title"><b>URL Data Usage</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    When scanning URLs, suspicious links are sent to third-party security services. 
                    No personal data content is shared or saved. Click each service for details:
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('virustotal')}
                    >
                        VirusTotal {openSection === 'virustotal' ? '▲' : '▼'}
                    </button>
                    {openSection === 'virustotal' && (
                        <div className="dropdown-content">
                            <p>URLs are submitted to VirusTotal's database and become part of their public repository.</p>
                            <a style={{color:"white"}} href="https://cloud.google.com/terms/secops/privacy-notice" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </div>
                    )}
                </div>
                
                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('google')}
                    >
                        Google Safe Browsing {openSection === 'google' ? '▲' : '▼'}
                    </button>
                    {openSection === 'google' && (
                        <div className="dropdown-content">
                            <p>URLs are checked against Google's database of known malicious websites. 
                            Limited data is shared with Google for verification purposes only.</p>
                            <a style={{color:"white"}} href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </div>
                    )}
                </div>
                
                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('urlscan')}
                    >
                        URLscan.io {openSection === 'urlscan' ? '▲' : '▼'}
                    </button>
                    {openSection === 'urlscan' && (
                        <div className="dropdown-content">
                            <p>URLs are analyzed and screenshots of the websites may be captured. 
                            Results may be publicly accessible in their database.</p>
                            <a style={{color:"white"}} href="https://urlscan.io/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    By using this feature, you consent to URL sharing for security verification.
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