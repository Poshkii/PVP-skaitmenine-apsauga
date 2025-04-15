import { useTranslation } from "react-i18next";
import {useNavigate} from "react-router";
import { Info, Book } from 'lucide-react';
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";

function PhishStatus() {
    const { t } = useTranslation('phishEmail');
    const navigate = useNavigate();
    const [sender, setSender] = useState("");
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
                setSubject(message.data.subject || "");
                setBody(message.data.body || "");
                setResult("Email data successfully retrieved");
                setLoading(false);
            }
        };

        // Add the message listener
        browser.runtime.onMessage.addListener(messageListener);

        // Clean up when component unmounts
        return () => {
            browser.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const handleClear = () => {
        setSender("");
        setBody("");
        setEmail("");
        setResult("");
    };
    const sendMessage = () => {
        try {
            setLoading(true);
            setError("");
            console.log("Sending ReadDOM message to content script");
            
            browser.runtime.sendMessage({
                id: BgMessageId.ReadDOM
            });
            
            // Set a timeout to handle cases where no response is received
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

    const PhishChecker = async () => {
        // Reset states
        setResult("");
        setError("");
        
        // Call sendMessage again to refresh the data
        await sendMessage();
        
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
                                <div className="data-item">
                                    <strong>Sender:</strong> {sender}
                                </div>
                            )}
                            
                            {subject && (
                                <div className="data-item">
                                    <strong>Subject:</strong> {subject}
                                </div>
                            )}
                            
                            {body && (
                                <div className="data-item">
                                    <strong>Body:</strong>
                                    <div className="email-body" dangerouslySetInnerHTML={{ __html: body }}></div>
                                </div>
                            )}
                            
                            {result && (
                                <div className="result-message">{result}</div>
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