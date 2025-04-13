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
            <h1 className="panel-title">{t('email.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('email.infoBanner')}
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
                        {t('email.serviceName')}{openSection === 'xposedornot' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('email.content')}</p>
                        <a style={{color:"white"}} href="https://xposedornot.com/privacy" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                    </div>
                </div>
               
                <p style={{fontStyle: "italic"}}>
                    {t('email.notice')}
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