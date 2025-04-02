import { useReport } from "../report-page/ReportContext";
import { useState } from 'react';

function ReportPage() {
    const { report, clearReport } = useReport();
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    // Calculate security score based on report data
    const securityScore = Math.min(100, Math.max(0, 100 - (report.ScannedEmails.reduce((sum, email) => sum + email.BreachCount, 0) * 5)));
    
    return (
        <div className="middle-meniu">
            <div className="panel-header">
                <h1 className="panel-title">Security Report</h1>
                <p className="status-description">Your comprehensive security overview and activity summary</p>
            </div>

            {/* Security Score Card */}
            <div className="security-check-container glassmorphism">
                <div className="security-status">
                    <div className="status-icon" style={{
                        background: `conic-gradient(var(--accent-primary) ${securityScore}%, var(--bg-tertiary) 0%)`,
                        position: 'relative'
                    }}>
                        <span style={{position: 'absolute'}}>{securityScore}%</span>
                    </div>
                    <div className="status-text">
                        <h3 className="status-title">Security Score</h3>
                        <p className="status-description">
                            {securityScore > 80 ? 'Excellent protection level' : 
                             securityScore > 60 ? 'Good protection, some areas need attention' : 
                             'Your security needs immediate attention'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="security-check-container glassmorphism">
                <h3 className="recent-list-title">Activity Summary</h3>
                <div className="security-status" style={{justifyContent: 'space-around', marginTop: '20px'}}>
                    <div className="stat-card">
                        <div className="status-icon">{report.UrlScans}</div>
                        <p className="stat-label">URL Scans</p>
                    </div>
                    <div className="stat-card">
                        <div className="status-icon">{report.FileScans}</div>
                        <p className="stat-label">File Scans</p>
                    </div>
                    <div className="stat-card">
                        <div className="status-icon">{report.ScannedEmails.length}</div>
                        <p className="stat-label">Email Checks</p>
                    </div>
                </div>
            </div>
            
            {/* Email Breach Results */}
            <div className="security-check-container glassmorphism">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 className="recent-list-title">Recent Email Security Checks</h3>
                    <span className="status-badge safe">
                        {report.ScannedEmails.length} Total
                    </span>
                </div>
                
                {report.ScannedEmails.length === 0 ? (
                    <div className="empty-state">
                        <div className="status-icon" style={{margin: '20px auto'}}>0</div>
                        <p>No emails have been scanned yet</p>
                        <p className="status-description">Run your first email security check to see results here</p>
                    </div>
                ) : (
                    <ul className="recent-items" style={{paddingLeft: "0"}}>
                        {report.ScannedEmails.slice(-5).reverse().map((email, index) => (
                            <li className="recent-item" key={index}>
                                <div>
                                    <span className="item-url">{email.email}</span>
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
            
            {/* Data Management */}
            <div className="action-buttons">
                {!showConfirmClear ? (
                    <button className="btn btn-secondary" onClick={() => setShowConfirmClear(true)}>
                        Clear All Data
                    </button>
                ) : (
                    <>
                        <button className="btn btn-primary" onClick={() => setShowConfirmClear(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            clearReport();
                            setShowConfirmClear(false);
                        }}>
                            Confirm Clear
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportPage;