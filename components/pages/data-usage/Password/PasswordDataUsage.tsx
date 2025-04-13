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
            <h2 className="info-title"><b>{t('pswd.title')}</b></h2>

            <div style={{width: "90%", margin: "0 auto", textAlign: "left"}}>
                <p>
                    {t('pswd.infoBanner')}
                </p>

                <div className="dropdown-section">
                    <button 
                        className="dropdown-button"
                        onClick={() => toggleSection('zxcvbn')}
                    >
                        {t('pswd.serviceName')}{openSection === 'zxcvbn' ? '▲' : '▼'}
                    </button>
                    {openSection === 'zxcvbn' && (
                        <div className="dropdown-content">
                            <p>{t('pswd.content')}</p>
                            <a style={{color:"white"}} href="https://github.com/dropbox/zxcvbn" target="_blank" rel="noopener noreferrer">{t('pswd.page')}</a>
                        </div>
                    )}
                </div>
                
                <p className="consent-notice">
                    {t('pswd.notice')}
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