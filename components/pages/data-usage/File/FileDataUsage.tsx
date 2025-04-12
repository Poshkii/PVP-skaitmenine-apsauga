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
            <h1 className="panel-title">File Data Usage</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    When scanning files, attachments are sent to third-party security services.
                    No personal data content is shared or saved. Click the service for details:
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'metadefender' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'metadefender' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('metadefender')}
                    >
                        MetaDefender {openSection === 'metadefender' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'metadefender' ? '100vh' : '0',
                            opacity: openSection === 'metadefender' ? 1 : 0,
                            padding: openSection === 'metadefender' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'metadefender' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>Files are submitted to MetaDefender Cloud for multi-scanning malware detection.
                        Results may be stored in their database for improved threat intelligence.</p>
                        <a style={{color:"white"}} href="https://www.opswat.com/docs/mdcloud/compliance/confidentiality" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    By using this feature, you consent to file sharing for security verification.
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