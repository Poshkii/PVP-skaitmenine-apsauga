import "./info.css";
import { useTranslation, Trans } from "react-i18next";

function InfoPage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };
    const { t } = useTranslation('info');

    return (
        <>
            <div style={{paddingBottom:0}}className="middle-menu">
                <h1 className="panel-title" style={{marginBottom:0}}>{t('name')}</h1>
                <div className="status-title" style={{marginBottom:"24px"}}>{t('desc')}</div>
                <div className="security-check-container glassmorphism" style={{marginBottom:0}}>
                    <div className="action-buttons" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', marginTop: 0 }}>
                        <button className="btn btn-secondary" onClick={() => handleButtonClick("https://justdeleteme.xyz/")}>
                            Just<span style={{color: "#ef4444", fontWeight: "bold"}}>Delete</span>Me
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleButtonClick("https://tosdr.org/en/")}>
                            <span style={{fontWeight: "bold"}}>Terms of Service </span>- Didn't Read
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleButtonClick("https://www.dns0.eu/")}>
                            {t('the')}&nbsp;<span style={{ color: "#0ea5e9", fontWeight: "bold" }}>{t('eu')}</span>&nbsp;{t('public')}&nbsp;DNS
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleButtonClick("https://whoer.net/")}>
                            Whoer – {t('ip')}
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleButtonClick("https://www.mydataremoval.com/")}>
                            MyDataRemoval – {t('remove')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default InfoPage;