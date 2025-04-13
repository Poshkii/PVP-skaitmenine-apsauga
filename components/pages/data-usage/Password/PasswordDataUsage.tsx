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
            <h1 className="panel-title">{t('pswd.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('pswd.infoBanner')}
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
                        {t('pswd.serviceName')}{openSection === 'zxcvbn' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('pswd.content')}</p>
						<a style={{color:"white"}} href="https://github.com/dropbox/zxcvbn" target="_blank" rel="noopener noreferrer">{t('pswd.page')}</a>
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
                        {t('pswd.serviceName1')}{openSection === 'zxcvbn' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('pswd.content1')}</p>
						<a style={{color:"white"}} href="https://haveibeenpwned.com/Privacy" target="_blank" rel="noopener noreferrer">{t('policy')}</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    {t('pswd.notice')}
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