import "/entrypoints/popup/style.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function InfoPage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };

    const [openSection, setOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };
    const { t } = useTranslation('dataUsage');

    return (
        <div className="middle-menu">
            <h1 className="panel-title">{t('file.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('file.infoBanner')}
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
                        {t('file.serviceName')}{openSection === 'metadefender' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('file.content')}</p>
                        <a style={{color:"white"}} href="https://www.opswat.com/docs/mdcloud/compliance/confidentiality" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    {t('file.notice')}
                </p>
            
                <button className="btn btn-secondary"
                    onClick={() => window.history.back()}
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );

}

export default InfoPage;