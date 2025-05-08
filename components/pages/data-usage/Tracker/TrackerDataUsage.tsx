import "/entrypoints/popup/style.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

function TrackerDataUsage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };

    const [openSection, setOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };
    const navigate = useNavigate();

    const { t } = useTranslation('dataUsage');

    return (
        <div className="middle-menu">
            <h1 className="panel-title">{t('trackers.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('trackers.infoBanner')}
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'easylist' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'easylist' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('easylist')}
                    >
                        {t('trackers.serviceName1')} {openSection === 'easylist' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'easylist' ? '100vh' : '0',
                            opacity: openSection === 'easylist' ? 1 : 0,
                            padding: openSection === 'easylist' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'easylist' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>
                            {t('trackers.content1')}
                        </p>
                        <a style={{color:"white"}} href="https://easylist.to/pages/privacy.html" target="_blank" rel="noopener noreferrer">EasyList Privacy Policy</a>
                    </div>
                </div>
                
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'fingerprinting' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'fingerprinting' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('fingerprinting')}
                    >
                        {t('trackers.serviceName2')} {openSection === 'fingerprinting' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'fingerprinting' ? '100vh' : '0',
                            opacity: openSection === 'fingerprinting' ? 1 : 0,
                            padding: openSection === 'fingerprinting' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'fingerprinting' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>
                            {t('trackers.content2')}
                        </p>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    {t('trackers.notice')}
                </p>
            
                <button className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );
}

export default TrackerDataUsage;