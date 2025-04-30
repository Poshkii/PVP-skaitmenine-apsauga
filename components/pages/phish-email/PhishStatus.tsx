import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {Book, Info} from 'lucide-react';
import {UiMessageId} from "@/entrypoints/content/types/ui-message";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import { JSDOM } from "jsdom";

interface EmailData {
    sender: string;
    senderMail: string;
    date: string;
    subject: string;
    body: string;
    timestamp: number; // When the scan was performed
  }

const SCAN_API_URL = String(useAppConfig().emailScanApiUrl);

function PhishStatus() {
    const { t } = useTranslation('phishEmail');
    const navigate = useNavigate();
    const { sendToModule } = useContentMessaging();
    const [sender, setSender] = useState("");
    const [senderMail, setSenderMail] = useState("");
    const [date, setDate] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [result, setResult] = useState("");
    const [activeTab, setActiveTab] = useState<"checkNow" | "prevScan">("checkNow");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [recentScan, setRecentScan] = useState<EmailData | null>(null);
    const [previousScan, setPreviousScan] = useState<EmailData | null>(null);
    const [showBody, setShowBody] = useState(false);
    const [showPrevBody, setShowPrevBody] = useState(false);

    // Load previous scan when component mounts
    useEffect(() => {
        const loadPreviousScan = async () => {
            try {
                const result = await browser.storage.local.get('lastScan');
                if (result.lastScan) {
                    setPreviousScan(result.lastScan);
                }
            } catch (error) {
                console.error("Error loading previous scan:", error);
            }
        };
        
        loadPreviousScan();
    }, []);

    useEffect(() => {
        const messageListener = (message : any) => {
            if (message.id === UiMessageId.DOMIsRead) {
                console.log("Popup received DOMIsRead message:", message);
                
                // Update state with the received data
                setSender(message.data.sender || "");
                setSenderMail(message.data.senderMail || "");
                setDate(message.data.date || "");
                setSubject(message.data.subject || "");
                setBody(message.data.body || "");
                setResult("Email data successfully retrieved");
                setLoading(false);

                // Save as previous scan
                const scanData = {
                    sender: message.data.sender || "",
                    senderMail: message.data.senderMail || "",
                    date: message.data.date || "",
                    subject: message.data.subject || "",
                    body: message.data.body || "",
                    timestamp: Date.now()
                };
                
                console.log("This is the data:", scanData);
                setRecentScan(scanData);
                saveScan(scanData);
            }
        };

        browser.runtime.onMessage.addListener(messageListener);

        return () => {
            browser.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const saveScan = async (scanData: EmailData) => {
        if (!scanData.sender && !scanData.body) return; // Don't save empty scans
        
        try {
            // Update state
            setPreviousScan(scanData);
            
            // Save to browser storage
            await browser.storage.local.set({ lastScan: scanData });
        } catch (error) {
            console.error("Error saving scan:", error);
        }
    };

    const handleClear = () => {
        setSender("");
        setDate("");
        setBody("");
        setResult("");
        setSenderMail("");
        setSubject("");
    };
    const sendMessage = () => {
        try {
            setLoading(true);
            setError("");
            console.log("Sending ReadDOM message to content script");

            sendToModule(ModuleId.PhishChecker, {
                id: ModuleMessageId.ReadDom
            });
            
            // Set a timeout to handle cases where no response is received
            // FIXME: better to just get a message back if we're not on those pages
            setTimeout(() => {
                if (loading) {
                    setLoading(false);
                    setError("Timeout: No response received from the page. Make sure you're on a Gmail or Outlook page.");
                }
            }, 5000);
            
        } catch (error) {
            console.error("Error sending message:", error);
            setLoading(false);
            setError(`Error: ${error|| "Unknown error occurred"}`);
        }
    };


    const PhishChecker = () => {
        // Reset states
        setResult("");
        setError("");
        
        // Call sendMessage to get new data
        sendMessage();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        
        // Get components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        // Format as YYYY-MM-DD HH:MM
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const extractCleanBody = (html: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
    
        // Get plain text
        const text = doc.body.textContent?.trim() || "";
    
        // Get all links
        const links = Array.from(doc.querySelectorAll("a[href]"))
            .map(a => a.getAttribute("href"))
            .filter(Boolean);
    
        // Get all image sources
        const images = Array.from(doc.querySelectorAll("img[src]"))
            .map(img => img.getAttribute("src"))
            .filter(Boolean);
    
        // Combine result
        let result = text;
        if (links.length > 0) {
            result += "\nURLs: " + links.join(", ");
        }
        if (images.length > 0) {
            result += "\nImages: " + images.join(", ");
        }
    
        return result.trim();
    };

    const checkPhishing = async (scan: EmailData) => {
        console.log("This is before formatting:", scan);
        try {
            const cleanedBody = extractCleanBody(scan.body);
            const payload = JSON.stringify({
                sender_name: scan.sender,
                sender_email: scan.senderMail,
                subject: scan.subject,
                body: cleanedBody
            });

            console.log("This is my payload:", scan, "\n");
    
            const response = await fetch(SCAN_API_URL + "/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: payload
            });
    
            // Error handling
            if (!response.ok) {
                return t('error');
            }
    
            // Process analysis result
            const data = await response.json();
            //console.log("This is response:", data);
            return "";
        } catch (error) {
            console.error("VirusTotal error:", error);
            return t('VirusTotal.errorScan');
        }
    };

    return (
        <>
            <div className="middle-menu" >
                <h1 className="panel-title">{t('pageName')} <span onClick={() => navigate("/phish-data")}><Info className="info-icon"/></span></h1>

                <div className="tab-buttons">
                    <button 
                        onClick={() => { setActiveTab("checkNow");} }
                        className={`btn ${activeTab === "checkNow" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        {t('checkNow')}
                    </button>
                    <button
                        onClick={() => { setActiveTab("prevScan"); }}
                        className={`btn ${activeTab === "prevScan" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        <div className="button-content">
                            <Book size={18} />
                            {t('prevScan')}
                        </div>
                    </button>
                </div>

                <div className="security-check-container glassmorphism" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {loading && <div className="loading-message">{t('reading')}</div>}
                    {error && <div className="error-message">{error}</div>}
                    
                    {activeTab === "checkNow" && (
                        <div>
                            {!sender && !senderMail && !subject && !date && !body ? (
                                // Empty state placeholder
                                <div className="empty-container-placeholder">
                                    <div className="placeholder-icon">
                                        <Info size={40} color="var(--accent-primary)" />
                                    </div>
                                    <div className="placeholder-text">
                                        {t('placeholderText')}
                                    </div>
                                    <div className="placeholder-subtext">
                                        {t('placeholderSubtext')}
                                    </div>
                                </div>
                            ) : (
                            // Email data display
                            <>
                                {sender && (
                                    <div className="status-description">
                                        <strong>{t('sender')}</strong> {sender}
                                    </div>
                                )}

                                {senderMail && (
                                    <div className="status-description">
                                        <strong>{t('email')}</strong> {senderMail}
                                    </div>
                                )}
                                
                                {subject && (
                                    <div className="status-description">
                                        <strong>{t('subject')}</strong> {subject}
                                    </div>
                                )}

                                {date && (
                                    <div className="status-description">
                                        <strong>{t('date')}</strong> {date}
                                    </div>
                                )}
                                
                                {body && (
                                    <div className="status-description">
                                        <strong>{t('body')}</strong>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8rem" }}
                                            onClick={() => setShowBody(!showBody)}
                                        >
                                            {showBody ? t('hide') : t('show')}
                                        </button>
                                        {showBody && (
                                            <div 
                                                className="email-body" 
                                                dangerouslySetInnerHTML={{ __html: body }}
                                                style={{
                                                    maxHeight: "150px", /* Limit the body height */
                                                    overflowY: "auto",  /* Add scrollbar to body specifically */
                                                    padding: "8px",
                                                    border: "1px solid #eee",
                                                    borderRadius: "4px",
                                                    marginTop: "5px"
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                )}
                                {recentScan && (
                                <button 
                                            className="btn btn-secondary" 
                                            style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8rem" }}
                                            onClick={() => checkPhishing(recentScan)}
                                        >
                                            Check for phishing
                                </button>
                                 )}
                            </>
                        )}
                        </div>
                    )}
                    
                    {activeTab === "prevScan" && (
                        <div>
                            {!previousScan ? (
                                <div className="no-scans-message">{t('noPrev')}</div>
                            ) : (
                                <div>
                                    
                                    {previousScan.sender && (
                                        <div className="status-description">
                                            <strong>{t('sender')}</strong> {previousScan.sender}
                                        </div>
                                    )}
                                    
                                    {previousScan.senderMail && (
                                        <div className="status-description">
                                            <strong>{t('email')}</strong> {previousScan.senderMail}
                                        </div>
                                    )}
                                    
                                    {previousScan.subject && (
                                        <div className="status-description">
                                            <strong>{t('subject')}</strong> {previousScan.subject}
                                        </div>
                                    )}
                                    
                                    {previousScan.date && (
                                        <div className="status-description">
                                            <strong>{t('date')}</strong> {previousScan.date}
                                        </div>
                                    )}
                                    
                                    {previousScan.body && (
                                        <div className="status-description">
                                            <strong>{t('body')}</strong>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8rem" }}
                                                onClick={() => setShowPrevBody(!showPrevBody)}
                                            >
                                                {showPrevBody ? t('hide') : t('show')}
                                            </button>
                                            {showPrevBody && (
                                                <div 
                                                    className="email-body" 
                                                    dangerouslySetInnerHTML={{ __html: previousScan.body }}
                                                    style={{
                                                        maxHeight: "150px",
                                                        overflowY: "auto",
                                                        padding: "8px",
                                                        border: "1px solid #eee",
                                                        borderRadius: "4px",
                                                        marginTop: "5px"
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                    )}

                                    <div className="status-description">
                                        <strong>{t('time')}</strong> ({formatDate(previousScan.timestamp)})
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    {activeTab === "checkNow" && (
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleClear}
                        disabled={loading}>
                        {t('clear')}
                    </button>
                    )}
                    {activeTab === "checkNow" && (
                        <button 
                            className="btn btn-primary" 
                            onClick={PhishChecker}
                            disabled={loading}>
                            {loading ? t('process') : t('scan')}
                        </button>
                    )}
                    {activeTab === "prevScan" && previousScan && (
                        <button 
                            className="btn btn-danger" 
                            onClick={async () => {
                                await browser.storage.local.remove('lastScan');
                                setPreviousScan(null);
                            }}>
                            {t('clearPrev')}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default PhishStatus;