import { useReport } from "../report-page/ReportContext";

function ReportPage() {
    const { report, clearReport } = useReport();

    return (
        <div className="middle-menu">
            <h1>Report Page</h1>

            <div style={{color: "white"}}>
                <p><strong>URL Scans:</strong> {report.UrlScans}</p>
                <p><strong>File Scans:</strong> {report.FileScans}</p>

                <h2>5 Latest Scanned Emails:</h2>
                {report.ScannedEmails.length === 0 ? (
                    <p>No emails have been scanned so far...</p>
                ) : (
                    <ul>
                        {report.ScannedEmails.slice(-5).reverse().map((email, index) => (
                            <li key={index}>{email.email} - <strong>{email.BreachCount}</strong> breaches</li>
                        ))}
                    </ul>
                )}
            </div>

            <button className="menu-button" onClick={clearReport}>
                <p className="menu-name">Clear All Data</p>
            </button>
        </div>
    );
}

export default ReportPage;
