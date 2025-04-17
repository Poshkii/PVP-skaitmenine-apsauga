import { useReport } from "../report-page/ReportContext";
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';
import { useState } from 'react';

function ReportPage() {
    const { report, clearReport } = useReport();
    const { t } = useTranslation('report');
    const [activeTab, setActiveTab] = useState('emails');

    const securityScore = Math.min(100, Math.max(0, 100 - (report.ScannedEmails.reduce((sum, email) => sum + email.BreachCount, 0) * 5)));

    const vulnerableItems = [
        ...report.ScannedEmails
            .filter(email => email.BreachCount > 0)
            .map(email => ({
                type: 'email',
                name: email.email,
                status: t('breaches', {count: email.BreachCount})
            })),
        ...report.ScannedUrls
            .filter(url => url.Result !== "Safe")
            .map(url => ({
                type: 'url',
                name: url.url,
                status: url.Result
            })),
        ...report.ScannedFiles
            .filter(file => file.Result === "unsafe")
            .map(file => ({
                type: 'file',
                name: file.name,
                status: file.Result
            }))
    ];
    const recentVulnerableItems = vulnerableItems.slice(-5).reverse();

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
                        {t('recentVulns')}
                    </h3>
                    {recentVulnerableItems.length === 0 ? (
                        <p>{t('nothing')}</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {recentVulnerableItems.map((item, index) => (
                                <li className="recent-item" key={index}>
                                    <div>
                                        <span className="item-url overflow-text">
                                            <span style={{marginRight: "8px", opacity: 0.7}}>
                                                {item.type === 'email' ? '✉️' : 
                                                 item.type === 'url' ? '🔗' : '📄'}
                                            </span>
                                            {item.name}
                                        </span>
                                        <p className="status-description">{t('date', {date: format(new Date(), 'yyyy-MM-dd')})}</p>
                                    </div>
                                    <span className="status-badge suspicious">
                                        {item.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="security-check-container glassmorphism" style={{padding: "5px 0"}}>
                    <div className="tab-buttons">
                        <div className="tab-button">
                            <button
                                style={{width:"100%"}} 
                                className={`tab-button btn ${activeTab === 'emails' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('emails')}
                            >
                                {t('tabEmails')}
                            </button>
                        </div>
                        <div className="tab-button">
                            <button
                                style={{width:"100%"}} 
                                className={`tab-button btn ${activeTab === 'urls' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('urls')}
                            >
                                {t('tabUrls')}
                            </button>
                        </div>
                        <div className="tab-button">
                            <button
                                style={{width:"100%"}}
                                className={`tab-button btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('files')}
                            >
                                {t('tabFiles')}
                            </button>
                        </div>
                    </div>

                    <div style={{padding: "0 24px 0 24px", margin: "0 auto"}}>
                        {/* Emails Tab */}
                        {activeTab === 'emails' && (
                            <>
                                <h3 className="recent-list-title">{t('recentEmail')}</h3>
                                {report.ScannedEmails.length === 0 ? (
                                    <p>{t('noEmails')}</p>
                                ) : (
                                    <ul className="recent-items" style={{paddingLeft: "0"}}>
                                        {report.ScannedEmails.slice(-10).reverse().map((email, index) => (
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
                            </>
                        )}

                        {/* URLs Tab */}
                        {activeTab === 'urls' && (
                            <>
                                <h3 className="recent-list-title">{t('recentUrls')}</h3>
                                {report.ScannedUrls.length === 0 ? (
                                    <p>{t('noUrls')}</p>
                                ) : (
                                    <ul className="recent-items" style={{paddingLeft: "0"}}>
                                        {report.ScannedUrls.slice(-10).reverse().map((url, index) => (
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
                            </>
                        )}

                        {/* Files Tab */}
                        {activeTab === 'files' && (
                            <>
                                <h3 className="recent-list-title">{t('recentFiles')}</h3>
                                {report.ScannedFiles.length === 0 ? (
                                    <p>{t('noFiles')}</p>
                                ) : (
                                    <ul className="recent-items" style={{paddingLeft: "0"}}>
                                        {report.ScannedFiles.slice(-10).reverse().map((name, index) => (
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button className="btn btn-secondary" onClick={clearReport}>
                {t('clear')}
            </button>
        </div>
    );
}

export default ReportPage;
