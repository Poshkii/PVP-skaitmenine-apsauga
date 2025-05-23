import { useReport } from "../report-page/ReportContext";
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';
import { useState } from 'react';
import { Mail, Link, File } from "lucide-react";
import { ReportProvider, Toast } from './ReportContext';

function ReportPage() {
    const { report, clearReport } = useReport();
    const { t } = useTranslation('report');
    const [activeTab, setActiveTab] = useState('emails');
    const { toast, hideToast } = useReport();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [skipConfirmation, setSkipConfirmation] = useState(
        localStorage.getItem("skipClearConfirmation") === "true"
    );
    
    const calculateSecurityScore = () => {
        const totalEmails = report.ScannedEmails.length;
        const breachedEmails = report.ScannedEmails.filter(email => email.BreachCount > 0).length;
        
        const totalUrls = report.ScannedUrls.length;
        const unsafeUrls = report.ScannedUrls.filter(url => url.Result !== "Safe" && url.Result !== "Unknown").length;
        
        const totalFiles = report.ScannedFiles.length;
        const unsafeFiles = report.ScannedFiles.filter(file => file.Result === "unsafe").length;
        
        const totalScans = totalEmails + totalUrls + totalFiles;
        
        if (totalScans === 0) return 100;
        
        const EMAIL_WEIGHT = 0.35;
        const URL_WEIGHT = 0.35;
        const FILE_WEIGHT = 0.30;
        
        const emailSafety = totalEmails > 0 ? 100 * (1 - breachedEmails / totalEmails) : 100;
        const urlSafety = totalUrls > 0 ? 100 * (1 - unsafeUrls / totalUrls) : 100;
        const fileSafety = totalFiles > 0 ? 100 * (1 - unsafeFiles / totalFiles) : 100;
        
        let weightSum = 0;
        let scoreSum = 0;
        
        if (totalEmails > 0) {
            scoreSum += emailSafety * EMAIL_WEIGHT;
            weightSum += EMAIL_WEIGHT;
        }
        
        if (totalUrls > 0) {
            scoreSum += urlSafety * URL_WEIGHT;
            weightSum += URL_WEIGHT;
        }
        
        if (totalFiles > 0) {
            scoreSum += fileSafety * FILE_WEIGHT;
            weightSum += FILE_WEIGHT;
        }
        
        const finalScore = weightSum > 0 ? scoreSum / weightSum : 100;
        
        return Math.min(100, Math.max(0, Math.round(finalScore)));
    };
    
    const securityScore = calculateSecurityScore();

    const vulnerableItems = [
        ...report.ScannedEmails
            .filter(email => email.BreachCount > 0)
            .map(email => ({
                type: 'email',
                name: email.email,
                status: t('breaches', {count: email.BreachCount}),
                timestamp: email.timestamp
            })),
        ...report.ScannedUrls
            .filter(url => ["Suspicious", "Malicious"].includes(url.Result))
            .map(url => ({
                type: 'url',
                name: url.url,
                status: url.Result,
                timestamp: url.timestamp
            })),
        ...report.ScannedFiles
            .filter(file => file.Result === "unsafe")
            .map(file => ({
                type: 'file',
                name: file.name,
                status: file.Result,
                timestamp: file.timestamp
            }))
    ];
    const recentVulnerableItems = vulnerableItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    const getColorForScore = (score: number) => {
        if (score > 75) return "var(--success)";
        if (score > 50) return "var(--warning)";
        if (score > 25) return "var(--error)";
        return "var(--error)";
    };

    const clearData = () => {
        if (skipConfirmation) {
            clearReport();            
        } else {
            setShowConfirmModal(true);
        }       
    };

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
                        <div
                            className={"status-icon"}
                            style={{
                                background: `conic-gradient(${getColorForScore(securityScore)} ${securityScore}%, var(--bg-primary) 0%)`,
                                position: "relative",
                            }}
                        >
                            <span
                            className={`score-text-container ${
                                securityScore > 75
                                ? 'score-high'
                                : securityScore > 50
                                ? 'score-medium'
                                : securityScore > 25
                                ? 'score-low'
                                : 'score-critical'
                            }`}
                            style={{ position: 'absolute' }}
                            >
                            {securityScore}
                            </span>
                        </div>
                        
                    </div>
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">{t('summary')}</h3>
                    <div className="security-status" style={{gap:"0"}}>
                        <div style={{width:"34%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto", fontWeight: "600"}}>{report.ScannedEmails.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>{t('emails')}</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto", fontWeight: "600"}}>{report.ScannedUrls.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>{t('urls')}</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto", fontWeight: "600"}}>{report.ScannedFiles.length}</p>
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
                                        <span className="item-url overflow-text" style={{maxWidth:"200px", width:"auto"}}>
                                            <span style={{marginRight: "8px", opacity: 0.7}}>
                                                {item.type === 'email' ? <Mail size={15}/>: 
                                                 item.type === 'url' ? <Link size={15}/> : <File size={15}/>}
                                            </span>
                                            {item.name}
                                        </span>
                                        <p className="status-description">{t('date')}</p>
                                        <p className="status-description">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                    <span className="status-badge suspicious">
                                        {item.type === 'email' ? item.status: t('unsafe')}
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
                                <span><Mail size={15}/> {t('tabEmails')}</span>
                            </button>
                        </div>
                        <div className="tab-button">
                            <button
                                style={{width:"100%"}} 
                                className={`tab-button btn ${activeTab === 'urls' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('urls')}
                            >
                                <span><Link size={15}/> {t('tabUrls')}</span>
                            </button>
                        </div>
                        <div className="tab-button">
                            <button
                                style={{width:"100%"}}
                                className={`tab-button btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('files')}
                            >
                                <span><File size={15}/> {t('tabFiles')}</span>
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
                                                    <span className="item-url overflow-text" style={{maxWidth:"200px", width:"auto"}}>{email.email}</span>
                                                    <p className="status-description">{t('date')}</p>
                                                    <p className="status-description">{new Date(email.timestamp).toLocaleString()}</p>
                                                </div>
                                                <span className={`status-badge ${email.BreachCount > 0 ? 'suspicious' : 'safe'}`}>
                                                    {email.BreachCount > 0 ? t('breaches', {count: email.BreachCount}) : t('secure')}
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
                                                    <span className="item-url overflow-text" style={{width:"200px"}}>{url.url}</span>
                                                    <p className="status-description">{t('date')}</p>
                                                    <p className="status-description">{new Date(url.timestamp).toLocaleString()}</p>
                                                </div>
                                                <span className={`status-badge ${url.Result === "Safe" ? 'safe' : url.Result === "Unknown" ? 'unknown' : 'suspicious'}`}>
                                                    {url.Result === "Safe" ? t('secure') : url.Result === "Unknown" ? t('unknown') : t('unsafe')}
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
                                                    <span className="item-url overflow-text" style={{width:"200px"}}>{name.name}</span>
                                                    <p className="status-description">{t('date')}</p>
                                                    <p className="status-description">{new Date(name.timestamp).toLocaleString()}</p>
                                                </div>
                                                <span className={`status-badge ${name.Result === "unsafe" ? 'suspicious' : 'safe'}`}>
                                                    {name.Result === "unsafe" ? t('unsafe') : t('secure')}
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

            <button className="btn btn-danger" onClick={clearData}>
                {t('clear')}
            </button>

            {showConfirmModal && (
            <div 
                
                style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                justifyContent: "center", alignItems: "center", zIndex: 9999
            }}>
                <div 
                className="security-check-container glassmorphism"
                style={{
                backgroundColor: "var(--bg-primary)", padding: "30px", borderRadius: "8px",
                width: "90%", maxWidth: "400px", textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                }}>
                <h2 className="panel-title" style={{marginBottom: "20px" }}>
                    {t('confirmClear')}
                </h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                    {t('areYouSure')}
                </p>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                    <input
                        type="checkbox"
                        onChange={(e) => {
                        if (e.target.checked) {
                            localStorage.setItem("skipClearConfirmation", "true");
                            setSkipConfirmation(true);
                        } else {
                            localStorage.removeItem("skipClearConfirmation");
                            setSkipConfirmation(false);
                        }
                        }}
                        defaultChecked={skipConfirmation}
                        style={{ marginRight: "8px" }}
                    />
                    {t('dontAsk')}
                    </label>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                    onClick={() => {
                        clearReport();
                        setShowConfirmModal(false);
                    }}
                    className="btn btn-danger"
                    style={{ width: "120px" }}
                    >
                    {t('delete')}
                    </button>
                    <button
                    onClick={() => setShowConfirmModal(false)}
                    className="btn btn-secondary"
                    style={{ width: "120px" }}
                    >
                    {t('cancel')}
                    </button>
                </div>
                </div>
            </div>
            )}

            {toast.show && (
                <Toast 
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

        </div>
    );
}

export default ReportPage;
