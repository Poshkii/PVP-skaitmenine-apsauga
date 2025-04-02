import { useReport } from "../report-page/ReportContext";

function ReportPage() {
    const { report, clearReport } = useReport();

    return (
        <div className="middle-menu">
            <h1 className="panel-title">Overview</h1>

            <div>
                <div className="security-check-container">
                    <h3 className="recent-list-title">Safety check statistics</h3>
                    <div className="security-status">
                        <p className="recent-item recent-item-alt"><strong className="recent-item-text">URL<br></br>Scans:</strong> <span className="status-icon">{report.UrlScans}</span></p>
                        <p className="recent-item recent-item-alt"><strong className="recent-item-text">File<br></br> Scans:</strong> <span className="status-icon">{report.FileScans}</span></p>
                    </div>
                </div>
                
                <div className="security-check-container">
                    <h3 className="recent-list-title">5 Last Scanned Emails:</h3>
                    {report.ScannedEmails.length === 0 ? (
                        <p>No emails have been scanned so far...</p>
                    ) : (
                        <ul className="recent-items" style={{paddingLeft: "0"}}>
                            {report.ScannedEmails.slice(-5).reverse().map((email, index) => (
                                <li className="recent-item" 
                                    key={index}><span className="overflow-text">{email.email}</span> 
                                    <span><strong>{email.BreachCount}</strong> breaches</span>
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
