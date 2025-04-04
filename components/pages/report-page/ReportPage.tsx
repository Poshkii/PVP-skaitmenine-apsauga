import { useReport } from "../report-page/ReportContext";

function ReportPage() {
    const { report, clearReport } = useReport();

    const securityScore = Math.min(100, Math.max(0, 100 - (report.ScannedEmails.reduce((sum, email) => sum + email.BreachCount, 0) * 5)));

    return (
        <div className="middle-menu">
            <h1 className="panel-title">Overview</h1>

            <div>
                <div className="security-check-container glassmorphism">
                    <div className="security-status">
                        <div className="status-text">
                            <h3 className="recent-list-title">Security Score</h3>
                            <p className="status-description">
                                {securityScore > 75 ? 'Excellent protection level' : 
                                securityScore > 50 ? 'Good protection, some areas need attention' : 
                                securityScore > 25 ? 'Poor protection, many areas need attention' :
                                'Your security needs immediate attention'}
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
                    <h3 className="recent-list-title">Activity Summary</h3>
                    <div className="security-status" style={{gap:"0"}}>
                        <div style={{width:"34%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.ScannedEmails.length}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>Email Checks</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.UrlScans}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>URL Scans</strong></p>
                        </div>
                        <div style={{width:"33%"}}>
                            <p className="status-icon" style={{marginLeft: "auto", marginRight: "auto"}}>{report.FileScans}</p>
                            <p style={{marginBottom: "0", textAlign: "center"}}><strong>File Scans</strong></p>
                        </div>
                    </div>
                </div>

                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">
                        Recent Detected Vulnerabilities: 
                    </h3>
                    {report.ScannedEmails.length === 0 ? (
                        <p>No threats have been found yet...</p>
                    ) : (
                        <>
                            {report.ScannedEmails.filter(email => email.BreachCount > 0).length === 0 ? (
                                <p>No threats have been found yet...</p>
                            ) : (
                                <ul className="recent-items" style={{paddingLeft: "0"}}>
                                    {report.ScannedEmails.slice(-5).reverse()
                                        .filter(email => email.BreachCount > 0)
                                        .map((email, index) => (
                                            <li className="recent-item" key={index}>
                                                <div>
                                                    <span className="item-url overflow-text">{email.email}</span>
                                                    <p className="status-description">Scanned on {new Date().toLocaleDateString()}</p>
                                                </div>
                                                <span className={`status-badge ${email.BreachCount > 0 ? 'suspicious' : 'safe'}`}>
                                                    {email.BreachCount > 0 ? `${email.BreachCount} Breaches` : 'Secure'}
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
                    <h3 className="recent-list-title">Recent Email Checks:</h3>
                    {report.ScannedEmails.length === 0 ? (
                        <p>No emails have been scanned so far...</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {report.ScannedEmails.slice(-5).reverse().map((email, index) => (
                                <li className="recent-item" key={index}>
                                    <div>
                                        <span className="item-url overflow-text">{email.email}</span>
                                        <p className="status-description">Scanned on {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <span className={`status-badge ${email.BreachCount > 0 ? 'suspicious' : 'safe'}`}>
                                        {email.BreachCount > 0 ? `${email.BreachCount} Breaches` : 'Secure'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <button className="btn btn-secondary" onClick={clearReport}>
                Clear All Data
            </button>
        </div>
    );
}

export default ReportPage;
