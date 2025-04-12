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
            <h1 className="panel-title">Password Data Usage</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    When checking password strength and breaches, your password is processed locally in your browser.
                    No password data is stored. Click the service for details:
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'zxcvbn' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'zxcvbn' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('zxcvbn')}
                    >
                        zxcvbn {openSection === 'zxcvbn' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'zxcvbn' ? '100vh' : '0',
                            opacity: openSection === 'zxcvbn' ? 1 : 0,
                            padding: openSection === 'zxcvbn' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'zxcvbn' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>The zxcvbn library runs entirely in your browser to evaluate password strength.
						Your password is never sent to any server and all processing happens locally on your device.</p>
						<a style={{color:"white"}} href="https://github.com/dropbox/zxcvbn" target="_blank" rel="noopener noreferrer">Project Page</a>
                    </div>
                </div>

                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'hibp' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'hibp' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('hibp')}
                    >
                        Have I Been Pwned {openSection === 'zxcvbn' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'hibp' ? '100vh' : '0',
                            opacity: openSection === 'hibp' ? 1 : 0,
                            padding: openSection === 'hibp' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'hibp' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>A secure hash of your password is used to query the 
                        Have I Been Pwned API using a method called k-Anonymity . This means your full password is never sent, 
                        and your privacy is preserved.</p>
						<a style={{color:"white"}} href="https://haveibeenpwned.com/Privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    This feature is designed with privacy in mind and keeps your password data secure.
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