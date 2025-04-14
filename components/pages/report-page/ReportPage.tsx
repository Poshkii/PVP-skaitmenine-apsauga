import { useReport } from "../report-page/ReportContext";
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';

function ReportPage() {
    const { report, clearReport } = useReport();
    const { t } = useTranslation('report');

    const securityScore = Math.min(100, Math.max(0, 100 - (report.ScannedEmails.reduce((sum, email) => sum + email.BreachCount, 0) * 5)));

    return (
        <div className="middle-menu">
            <h1 className="panel-title">{t('overview')}</h1>

            <div>
                <div className="security-check-container glassmorphism">
                    <div className="security-status">
                        <div className="status-text">
                            <h3 className="recent-list-title">{t('score')}</h3>
                            <p className="status-description">
                                {securityScore > 75 ? t('excelent') : 
                                securityScore > 50 ? t('good') : 
                                securityScore > 25 ? t('poor'):
                                t('critical')}
                            </p>
                        </div>
                        <div className="status-icon" style={{
                            background: `conic-gradient(var(--accent-primary) ${securityScore}%, var(--bg-tertiary) 0%)`,
                            position: 'relative'
                        }}>
                            <span style={{position: 'absolute'}}>{securityScore}%</span>
                        </div>
                        
                    </div>
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">{t('summary')}</h3>
                    <div className="security-status" style={{gap:"0"}}>
                        <div style={{width:"34%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.ScannedEmails.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>{t('emails')}</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.ScannedUrls.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>{t('urls')}</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.ScannedFiles.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>{t('files')}</strong></p>
                        </div>
                    </div>
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">
                        {t('recent')}
                    </h3>
                    {report.ScannedEmails.length === 0 ? (
                        <p>{t('nothing')}</p>
                    ) : (
                        <>
                            {report.ScannedEmails.filter(email => email.BreachCount > 0).length === 0 ? (
                                <p>{t('nothing')}</p>
                            ) : (
                                <ul className="recent-items" style={{paddingLeft: "0"}}>
                                    {report.ScannedEmails.slice(-5).reverse()
                                        .filter(email => email.BreachCount > 0)
                                        .map((email, index) => (
                                            <li className="recent-item" key={index}>
                                                <div>
                                                    <span className="item-url overflow-text">{email.email}</span>
                                                    <p className="status-description">{t('date', {date: format(new Date(), 'yyyy-MM-dd')})}</p>
                                                </div>
                                                <span className={`status-badge ${email.BreachCount > 0 ? 'suspicious' : 'safe'}`}>
                                                    {email.BreachCount > 0 ? t('breaches', {count: email.BreachCount}) : t('secure')}
                                                </span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            )}
                        </>
                    )}
                </div>
                
                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">{t('recentEmail')}</h3>
                    {report.ScannedEmails.length === 0 ? (
                        <p>{t('noEmails')}</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {report.ScannedEmails.slice(-5).reverse().map((email, index) => (
                                <li className="recent-item" key={index}>
                                    <div>
                                        <span className="item-url overflow-text">{email.email}</span>
                                        <p className="status-description">{t('date', {date: format(new Date(), 'yyyy-MM-dd')})}</p>
                                    </div>
                                    <span className={`status-badge ${email.BreachCount > 0 ? 'suspicious' : 'safe'}`}>
                                        {email.BreachCount > 0 ? t('breaches', {count: email.BreachCount}) : t('safe')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">Recent URL checks</h3>
                    {report.ScannedUrls.length === 0 ? (
                        <p>{t('noEmails')}</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {report.ScannedUrls.slice(-5).reverse().map((url, index) => (
                                <li className="recent-item" key={index}>
                                    <div>
                                        <span className="item-url overflow-text">{url.url}</span>
                                        <p className="status-description">{t('date', {date: format(new Date(), 'yyyy-MM-dd')})}</p>
                                    </div>
                                    <span className={`status-badge ${url.Result !== "Safe" ? 'suspicious' : 'safe'}`}>
                                        {url.Result !== "Safe" ? url.Result : url.Result}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">Recent File Checks</h3>
                    {report.ScannedFiles.length === 0 ? (
                        <p>{t('noEmails')}</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {report.ScannedFiles.slice(-5).reverse().map((name, index) => (
                                <li className="recent-item" key={index}>
                                    <div>
                                        <span className="item-url overflow-text">{name.name}</span>
                                        <p className="status-description">{t('date', {date: format(new Date(), 'yyyy-MM-dd')})}</p>
                                    </div>
                                    <span className={`status-badge ${name.Result === "unsafe" ? 'suspicious' : 'safe'}`}>
                                        {name.Result === "unsafe" ? name.Result : t('safe')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <button className="btn btn-secondary" onClick={clearReport}>
                {t('clear')}
            </button>
        </div>
    );
}

export default ReportPage;
