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
            <h1 className="panel-title">Email Data Usage</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    When scanning for data breaches, your email address is checked against known breach databases.
                    Click the service for details:
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'xposedornot' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'xposedornot' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('xposedornot')}
                    >
                        XposedOrNot {openSection === 'xposedornot' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'xposedornot' ? '100vh' : '0',
                            opacity: openSection === 'xposedornot' ? 1 : 0,
                            padding: openSection === 'xposedornot' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'xposedornot' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>Your email address is sent to XposedOrNot to check against their database of
                        known data breaches. The service does not store your email for purposes
                        beyond the immediate check.</p>
                        <a style={{color:"white"}} href="https://xposedornot.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
               
                <p style={{fontStyle: "italic"}}>
                    By using this feature, you consent to your email address being shared for breach verification.
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