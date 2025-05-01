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
            <h1 className="panel-title">{t('url.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('url.infoBanner')}
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
                        {t('url.serviceName')}{openSection === 'virustotal' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('url.content')}</p>
                        <a style={{color:"white"}} href="https://cloud.google.com/terms/secops/privacy-notice" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                    </div>
                </div>
                
                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'cryptoscam' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'cryptoscam' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('cryptoscam')}
                    >
                        {t('url.serviceName1')}{openSection === 'cryptoscam' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'cryptoscam' ? '100vh' : '0',
                            opacity: openSection === 'cryptoscam' ? 1 : 0,
                            padding: openSection === 'cryptoscam' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'cryptoscam' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>{t('url.content1')}</p>
                        <a style={{color:"white"}} href="https://dfpi.ca.gov/consumers/crypto/crypto-scam-tracker/" target="_blank" rel="noopener noreferrer">{t('url.page')}</a>
                    </div>
                </div>

                <div style={{marginBottom: "14px"}}>
                    <button
                        className="dropdown-button btn btn-primary"
                        style={{
                            borderBottomLeftRadius: openSection === 'urlscan' ? '0' : '12px',
                            borderBottomRightRadius: openSection === 'urlscan' ? '0' : '12px'
                        }}
                        onClick={() => toggleSection('urlscan')}
                    >
                        {t('url.serviceName2')}{openSection === 'urlscan' ? <ChevronUp/> : <ChevronDown/>}
                    </button>
                    <div 
                        className="data-content"
                        style={{
                            maxHeight: openSection === 'urlscan' ? '100vh' : '0',
                            opacity: openSection === 'urlscan' ? 1 : 0,
                            padding: openSection === 'urlscan' ? '16px 20px' : '0 20px',
                            visibility: openSection === 'urlscan' ? 'visible' : 'hidden'
                        }}
                    >
                        <p>{t('url.content2')}</p>
                        <a style={{color:"white"}} href="https://urlscan.io/privacy/" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    {t('url.notice')}
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