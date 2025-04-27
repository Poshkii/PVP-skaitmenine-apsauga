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
            <h1 className="panel-title">{t('phish.title')}</h1>
            <div className="security-check-container glassmorphism">
                <p>
                    {t('phish.infoBanner')}
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
                        {t('phish.serviceName')}{openSection === 'virustotal' ? <ChevronUp/> : <ChevronDown/>}
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
                        <p>{t('phish.content')}</p>
                        <a style={{color:"white"}} href="https://huggingface.co/docs/transformers/en/model_doc/roberta" target="_blank" rel="noopener noreferrer">{t('phish.page')}</a>
                    </div>
                </div>
            
                <p style={{fontStyle: "italic"}}>
                    {t('phish.notice')}
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