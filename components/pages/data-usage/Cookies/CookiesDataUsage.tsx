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
            <h1 className="panel-title">{t('cookies.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('cookies.infoBanner')}
                </p>
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'opencookie' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'opencookie' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('opencookie')}
                    >
                        {t('cookies.serviceName')}{openSection === 'opencookie' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'opencookie' ? '100vh' : '0',
                            opacity: openSection === 'opencookie' ? 1 : 0,
                            padding: openSection === 'opencookie' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'opencookie' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>{t('cookies.content')}</p>
                        <a style={{color:"white"}} href="https://github.com/jkwakman/Open-Cookie-Database?tab=readme-ov-file" target="_blank" rel="noopener noreferrer">{t('url.page')}</a>
                    </div>
                </div>
               
                <p style={{fontStyle: "italic"}}>
                    {t('cookies.notice')}
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