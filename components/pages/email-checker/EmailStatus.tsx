import EmailBreachDetails from "@/components/pages/email-checker/EmailBreachData.tsx";
import EmailBreachData from "@/components/pages/email-checker/EmailBreachData.tsx";
import { FormEvent } from "react";
import { data } from "react-router";
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useReport } from "../report-page/ReportContext";
import {useNavigate} from "react-router";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { useTranslation } from "react-i18next";
import { Info, Mail, Book, ChevronDown, ChevronUp} from 'lucide-react';
import EmailLeakTips from "@/components/pages/email-checker/EmailLeakTips.tsx";

function EmailStatus({ inputEmail }: { inputEmail: string; }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [breachData, setBreachData] = useState<any | null>(null); // Stores full API response
    const [responseData, setResponse] = useState<any | null>(null); // Stores API response
    const { addScannedEmail } = useReport();
    const [safeEmail, setSafe] = useState(false);
    const [warningEmail, setWarning] = useState(false);
    const [dangerEmail, setDanger] = useState(false);
    const [unknownEmail, setUnknownEmail] = useState(false);
    const [unknownRisk, setUnknownRisk] = useState(false);
    const [lowRisk, setLowRisk] = useState(false);
    const [mediumRisk, setMediumRisk] = useState(false);
    const [highRisk, setHighRisk] = useState(false);
    const [risk, setRisk] = useState("");
    const [breachesFound, setBreachesFound] = useState(false);
    const [scanDone, setScanDone] = useState(false);
    const [isStored, setStored] = useState(false);
    const { t } = useTranslation('emails');
    const [openSection, setOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [skipConfirmation, setSkipConfirmation] = useState(
        localStorage.getItem("skipClearConfirmation") === "true"
    );

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    useEffect(() => {
        const listener = (message: any) => {
          if (message.id === UiMessageId.ScanEmail) {
            console.log("Message received in the frontend, scanning email...");
            // Process the data similar to how EmailCheck would handle it
            const email = message.data;
            setEmail(email);            
            // Process the rest of your state updates based on the data
            // This would be similar to the logic in your EmailCheck function
            const syntheticEvent = { preventDefault: () => {} } as FormEvent;
            EmailCheck(syntheticEvent);
            
            setLoading(false);
          }
        };
        
        browser.runtime.onMessage.addListener(listener);
        
        return () => {
          browser.runtime.onMessage.removeListener(listener);
        };
      }, []);

      useEffect(() => {
        // Tell background script we're ready
        console.log("Popup ready!");
        browser.runtime.sendMessage({ id: UiMessageId.PopupReady });
      }, []);

    const EmailCheck = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.match(emailPattern)) {
            setResult(t('wrongFormat'));
            return;
        }

        setResult(t('searching'));
        setLoading(true);
        
        handleClear();
        
        var isStored = true;

        try {
            // First check if data is stored, then proceed with appropriate action
            browser.runtime.sendMessage({id: BgMessageId.GetEmailData, data: {email: email}}, async (response) => {
                if (response) {                    
                    // Data exists in storage, use it
                    console.log("Breach info:", response);
                    setBreachData(response);
                    setStored(true);
                    setScanDone(true);
                    
                    // Process the stored data
                    processBreachData(response, email);
                }
                else {
                    // No stored data, fetch from API
                    console.log("No stored breach data for this email, starting scan...");
                    setStored(false);
                    
                    // Fetch new data from API
                    try {
                        const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`);
                        const data = await response.json();
                   
                        console.log("API response: ", response);
                        console.log("API data: ", data);
                        
                        if (response.status === 200) {
                            // Save data
                            chrome.runtime.sendMessage({
                                id: BgMessageId.StoreEmailData,
                                data: {
                                    email: email,
                                    breachData: data
                                }                                    
                            });

                            // Process the fetched data
                            processBreachData(data, email);
                            setScanDone(true);
                        }
                        // Email not found
                        else {
                            setResult(t('notVerified'));  
                            setScanDone(true);
                            setUnknownEmail(true);          
                        }
                    } catch (fetchError) {
                        console.error("API fetch error:", fetchError);
                        setResult(t('error'));
                    }
                }
            });
        } catch (error) {
            console.error("Runtime error:", error);
            setResult(t('error'));
        }
        
        function processBreachData(data: any, email: string) {

            console.log("DATA:", data);
            // Was breached
            if (data.ExposedBreaches) {
                //setResult(`Found ${data.ExposedBreaches.breaches_details.length} breaches`);
                setResult(t('found', {count: data.ExposedBreaches.breaches_details.length}));
                data.ExposedBreaches.breaches_details.length < 10 ? setWarning(true) : setDanger(true);
                
                // Get risk level
                const riskLabel = data.BreachMetrics.risk[0]?.risk_label ?? 'unknown';

                // Map the English label to a code
                const riskCode = 
                riskLabel.toLowerCase() === 'high' ? 'high' :
                riskLabel.toLowerCase() === 'medium' ? 'medium' :
                riskLabel.toLowerCase() === 'low' ? 'low' : 'unknown';

                // Set state based on the code
                riskCode === 'high' ? setHighRisk(true) : 
                riskCode === 'medium' ? setMediumRisk(true) : 
                riskCode === 'low' ? setLowRisk(true) : 
                setUnknownRisk(true);

                // Store the translated label for display
                const translatedRisk = t(riskCode);
                
                setRisk(translatedRisk);
                setBreachesFound(true);
                setBreachData(data);                
                addScannedEmail(email, data.ExposedBreaches.breaches_details.length);
            }
            // Wasn't breached
            else {
                setSafe(true);
                addScannedEmail(email, 0);                
            }
        }
        setLoading(false);
    };

    const navigate = useNavigate();

    const handleClear = () => {
        setBreachData(null); // Clear previous data before a new search
        setSafe(false);
        setUnknownEmail(false);        
        setDanger(false);
        setWarning(false);
        setHighRisk(false);
        setMediumRisk(false);
        setLowRisk(false);
        setUnknownRisk(false);
        setBreachesFound(false);
        setScanDone(false);
        setStored(false);
        setRisk("");           
    };

    const clearData = () => {
        if (skipConfirmation) {
            handleClear();            
        } else {
            setShowConfirmModal(true);
        }       
    };

    const [activeTab, setActiveTab] = useState<"scan" | "tips">("scan");

    return (
        <>
            <div style={{paddingBottom:0}}className="middle-menu">
                <h1 className="panel-title">{t('pageName')}<span onClick={() => navigate("/email-data")}><Info className="info-icon"/></span></h1>

                <div className="tab-buttons">
                    <button 
                        style={ {marginRight: "8px"} }
                        onClick={() => setActiveTab("scan")} 
                        className={`btn ${activeTab === "scan" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Mail size={18} />
                            {t('emailCheck')}
                        </div>
                    </button>
                    <button 
                        style={ {marginRight: "8px"} }
                        onClick={() => setActiveTab("tips")} 
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            {t('tips')}
                        </div>
                    </button>
                </div>

                {activeTab === "scan" && ( 
                    <>
                        <div className="security-check-container">
                            <form onSubmit={EmailCheck}>
                                <input
                                    type="text"
                                    placeholder={t('enter')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-box"
                                />

                                <div className="action-buttons">
                                    <button
                                        disabled={!email || loading || !email.match(emailPattern)}
                                        type="submit"
                                        className={`btn ${!email || loading || !email.match(emailPattern) ? "" : "btn-primary"}`}
                                        style={{ 
                                        width: "200px",
                                        opacity: !email || loading || !email.match(emailPattern) ? "0.6" : "1",
                                        cursor: !email || loading || !email.match(emailPattern) ? "not-allowed" : "pointer",
                                        }}
                                        >
                                        {t('check')}
                                    </button>                            
                                    <button
                                        className="btn btn-secondary"
                                        style={{ 
                                        width: "200px"
                                        }}
                                        onClick={() => setEmail('')}
                                        type="button"
                                        >
                                        {t('clear')}
                                    </button>
                                </div>                        
                            </form>
                        </div>
                        
                        {scanDone && (
                            <div className="security-check-container" style={{ maxHeight: "300px", minHeight: "110px", overflowY: "auto", paddingTop: 0}}> 

                                {!loading && (
                                <>
                                    {/* Display result status */}                   
                                    <div className="security-status" style={{ marginTop: "24px" }}>
                                        {dangerEmail && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                                        {safeEmail && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                                        {(warningEmail || unknownEmail) && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                                        <div className="status-text">
                                            {(dangerEmail || warningEmail) && <h3 className="status-title">{t('leaked')}</h3> }
                                            {safeEmail && <h3 className="status-title">{t('safe')}</h3> }
                                            {unknownEmail && <h3 className="status-title">{t('badEmail')}</h3> }                        
                                            <p className="status-description">
                                                {(unknownEmail || dangerEmail || warningEmail) && result}
                                            </p>
                                        </div>
                                    </div> 

                                    <div className="security-status" style={{ marginTop: "24px" }}>
                                        {highRisk && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                                        {lowRisk && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                                        {(mediumRisk || unknownRisk) && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                                        <div className="status-text">
                                            {breachesFound && <h3 className="status-title">{t('risk')}{risk}</h3>}
                                            <p className="status-description">
                                                {lowRisk && t('riskMessages.low')}
                                                {mediumRisk && t('riskMessages.medium')}
                                                {highRisk && t('riskMessages.high')}
                                                {unknownRisk && t('riskMessages.unknown')}
                                            </p>
                                        </div>
                                    </div>                             
                                </>
                                )}   

                                {loading &&
                                <div style={{ paddingTop: "16px", display: "flex", justifyContent: "center" }}>
                                    <div className="loading-spinner"></div>
                                </div>  
                                }

                                {/* Show EmailBreachDetails if breaches are found */}
                            </div>
                        )}

                        {scanDone && (
                            <div> 
                                {!loading && (
                                    <>
                                        <div>
                                            <button
                                                className="dropdown-button btn btn-secondary security-check-container glassmorphism"
                                                style={{
                                                    borderBottomLeftRadius: openSection === 'open' ? '0' : '12px',
                                                    borderBottomRightRadius: openSection === 'open' ? '0' : '12px',
                                                    marginBottom: 0
                                                }}
                                                onClick={() => toggleSection('open')}
                                            >
                                                <h3 className="status-title" style={{margin:0}}>{t('breaches')}</h3>{openSection === 'open' ? <ChevronUp/> : <ChevronDown/>}
                                            </button>
                                            <div 
                                                className="data-content"
                                                style={{
                                                    maxHeight: openSection === 'open' ? '100%' : '0',
                                                    opacity: openSection === 'open' ? 1 : 0,
                                                    padding: openSection === 'open' ? '16px 20px' : '0 20px',
                                                    visibility: openSection === 'open' ? 'visible' : 'hidden'
                                                }}
                                            >
                                                {breachData && breachesFound && <EmailBreachDetails data={breachData} />}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "tips" && <EmailLeakTips />}

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
                    <h2 className="panel-title" style={{ marginBottom: "20px" }}>
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
                            handleClear();
                            setShowConfirmModal(false);
                        }}
                        className="btn btn-danger"
                        style={{ width: "120px" }}
                        >
                        {t('clear')}
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

            </div>
        </>
    );
}

export default EmailStatus;
