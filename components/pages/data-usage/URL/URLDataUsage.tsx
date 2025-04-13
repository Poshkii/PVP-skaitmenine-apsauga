import "../info.css";
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
        <div className="info-page"
            style={{
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            paddingBottom: "30px",
        }}>
            <h2 className="info-title"><b>{t('url.title')}</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    {t('url.infoBanner')}
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('virustotal')}
                    >
                        {t('url.serviceName')}{openSection === 'virustotal' ? '▲' : '▼'}
                    </button>
                    {openSection === 'virustotal' && (
                        <div className="dropdown-content">
                            <p>{t('url.content')}</p>
                            <a style={{color:"white"}} href="https://cloud.google.com/terms/secops/privacy-notice" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                        </div>
                    )}
                </div>
                
                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('google')}
                    >
                        {t('url.serviceName1')}{openSection === 'google' ? '▲' : '▼'}
                    </button>
                    {openSection === 'google' && (
                        <div className="dropdown-content">
                            <p>{t('url.content1')}</p>
                            <a style={{color:"white"}} href="https://dfpi.ca.gov/consumers/crypto/crypto-scam-tracker/" target="_blank" rel="noopener noreferrer">{t('url.page')}</a>
                        </div>
                    )}
                </div>
                
                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('urlscan')}
                    >
                        {t('url.serviceName2')}{openSection === 'urlscan' ? '▲' : '▼'}
                    </button>
                    {openSection === 'urlscan' && (
                        <div className="dropdown-content">
                            <p>{t('url.content2')}</p>
                            <a style={{color:"white"}} href="https://urlscan.io/privacy/" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    {t('url.notice')}
                </p>
                
                <button className="custom-button"
                    onClick={() => window.history.back()}
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );

}

export default InfoPage;