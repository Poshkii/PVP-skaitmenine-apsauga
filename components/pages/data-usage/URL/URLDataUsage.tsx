import "/entrypoints/popup/style.css";
import { ChevronDown, ChevronUp } from "lucide-react";
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
        <div className="middle-menu">
            <h1 className="panel-title">URL Data Usage</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    When scanning URLs, suspicious links are sent to third-party security services. 
                    No personal data content is shared or saved. Click each service for details:
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'virustotal' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'virustotal' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('virustotal')}
                    >
                        VirusTotal {openSection === 'virustotal' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'virustotal' ? '100vh' : '0',
                            opacity: openSection === 'virustotal' ? 1 : 0,
                            padding: openSection === 'virustotal' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'virustotal' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>URLs are submitted to VirusTotal's database and become part of their public repository.</p>
                        <a style={{color:"white"}} href="https://cloud.google.com/terms/secops/privacy-notice" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
                
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'google' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'google' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('google')}
                    >
                        Google Safe Browsing {openSection === 'google' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'google' ? '100vh' : '0',
                            opacity: openSection === 'google' ? 1 : 0,
                            padding: openSection === 'google' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'google' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>URLs are checked against Google's database of known malicious websites. 
                        Limited data is shared with Google for verification purposes only.</p>
                        <a style={{color:"white"}} href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    By using this feature, you consent to URL sharing for security verification.
                </p>
            
                <button className="btn btn-secondary"
                    onClick={() => window.history.back()}
                >
                    Go back
                </button>
            </div>
        </div>
    );

}

export default InfoPage;