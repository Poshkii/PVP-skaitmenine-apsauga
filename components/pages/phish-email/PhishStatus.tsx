import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {Book, Info} from 'lucide-react';
import {UiMessageId} from "@/entrypoints/content/types/ui-message";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";

function PhishStatus() {
    const { t } = useTranslation('phishEmail');
    const navigate = useNavigate();
    const { sendToModule } = useContentMessaging();
    const [sender, setSender] = useState("");
    const [senderMail, setSenderMail] = useState("");
    const [date, setDate] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [email, setEmail] = useState("");
    const [result, setResult] = useState("");
    const [activeTab, setActiveTab] = useState<"checkNow" | "prevScan">("checkNow");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            }
        };

        browser.runtime.onMessage.addListener(messageListener);

        return () => {
            browser.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const handleClear = () => {
        setSender("");
        setBody("");
        setEmail("");
        setResult("");
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
            }, 20);
            
        } catch (error) {
            console.error("Error sending message:", error);
            setLoading(false);
            setError(`Error: ${error|| "Unknown error occurred"}`);
        }
    };

    const PhishChecker = async () => {
        // Reset states
        setResult("");
        setError("");
        
        // Call sendMessage again to refresh the data
        sendMessage();
        
        // Phishing detection logic will be handled after we receive the response
    };

    return (
        <>
            <div className="middle-menu" >
                <h1 className="panel-title">{t('pageName')} <span onClick={() => navigate("/phish-data")}><Info className="info-icon"/></span></h1>

                <div className="tab-buttons">
                    <button 
                        onClick={() => { setActiveTab("checkNow"); sendMessage();} }
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
                    {loading && <div className="loading-message">Reading email data...</div>}
                    {error && <div className="error-message">{error}</div>}
                    
                    {activeTab === "checkNow" && (
                        <div className="email-data">
                            {sender && (
                                <div className="status-description">
                                    <strong>Sender:</strong> {sender}
                                </div>
                            )}

                            {senderMail && (
                                <div className="status-description">
                                    <strong>Sender email:</strong> {senderMail}
                                </div>
                            )}
                            
                            {subject && (
                                <div className="status-description">
                                    <strong>Subject:</strong> {subject}
                                </div>
                            )}

                            {date && (
                                <div className="status-description">
                                    <strong>Sender:</strong> {date}
                                </div>
                            )}
                            
                            {body && (
                                <div className="status-description">
                                    <strong>Body:</strong>
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
                                </div>
                            )}
                            
                        </div>
                    )}
                    
                    {activeTab === "prevScan" && (
                        <div className="previous-scans">
                            {/* Display previous scan history here */}
                            <p>No previous scans found.</p>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleClear}
                        disabled={loading}>
                        {t('clear')}
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={PhishChecker}
                        disabled={loading}>
                        {loading ? "Processing..." : t('scanAgain')}
                    </button>
                </div>
            </div>
        </>
    );
}

export default PhishStatus;