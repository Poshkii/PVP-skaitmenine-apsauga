import EmailBreachDetails from "@/components/pages/email-checker/EmailBreachData.tsx";
import EmailBreachData from "@/components/pages/email-checker/EmailBreachData.tsx";
import { FormEvent } from "react";
import { data } from "react-router";
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useReport } from "../report-page/ReportContext";
import {useNavigate} from "react-router";
import { Info } from 'lucide-react';

function EmailStatus({ inputEmail, switchPage }: { inputEmail: string; switchPage: () => void }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [breachData, setBreachData] = useState<any | null>(null); // Stores full API response
    const { addScannedEmail } = useReport();
    const [safeEmail, setSafe] = useState(false);
    const [warningEmail, setWarning] = useState(false);
    const [dangerEmail, setDanger] = useState(false);
    const [unknownRisk, setUnknownRisk] = useState(false);
    const [lowRisk, setLowRisk] = useState(false);
    const [mediumRisk, setMediumRisk] = useState(false);
    const [highRisk, setHighRisk] = useState(false);
    const [risk, setRisk] = useState("");
    const [breachesFound, setBreachesFound] = useState(false)   

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const EmailCheck = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.match(emailPattern)) {
            setResult("Wrong email format");
            return;
        }

        setResult("Searching...");
        setLoading(true);
        handleClear();

        try {
            const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`);
            const data = await response.json();

            console.log("API response: ", response)
            console.log("API data: ", data)

            if (response.status === 200 && data.BreachesSummary.site) {
                setResult(`Found ${data.ExposedBreaches.breaches_details.length} breaches`);
                data.ExposedBreaches.breaches_details.length < 1 ? setSafe(true) : data.ExposedBreaches.breaches_details.length < 10 ? setWarning(true) : setDanger(true)
                // Get risk level
                const risk = data.BreachMetrics.risk[0]?.risk_label ?? "Unknown";
                risk === "High" ? setHighRisk(true) : risk === "Medium" ? setMediumRisk(true) : risk === "Low" ? setLowRisk(true) : setUnknownRisk(true);
                setRisk(risk);
                setBreachesFound(true)
                setBreachData(data);                
                addScannedEmail(email, data.ExposedBreaches.breaches_details.length);
            } else {
                setResult("Email is safe!");                
                addScannedEmail(email, 0);
            }
        } catch (error) {
            console.error("API error:", error);
            setResult("Error");
        }

        setLoading(false);
    };

    const navigate = useNavigate();

    const handleClear = () => {
        setBreachData(null); // Clear previous data before a new search
        setSafe(false);
        setDanger(false);
        setWarning(false);
        setHighRisk(false);
        setMediumRisk(false);
        setLowRisk(false);
        setUnknownRisk(false);
        setBreachesFound(false);
        setRisk("");
    };

    return (
        <>
            <div style={{

            }}>
                <h1 className="panel-title">Check Email Safety<span onClick={() => navigate("/email-data")}><Info className="info-icon"/></span></h1>

                {/* <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    marginTop: '1rem', 
                    marginBottom: "1rem",
                }}>
                    <h2 style={{ color: "white", margin: '0' }}>Check Email Safety</h2>
                
                    <div onClick={() => navigate("/email-data")} className="data-info"><Info/></div>
                </div> */}
                
                <div className="security-check-container">
                    <form onSubmit={EmailCheck}>
                        <input
                            type="text"
                            placeholder="Enter email address..."
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
                                Check
                            </button>                            
                            <button
                                className="btn btn-secondary"
                                style={{ 
                                width: "200px"
                                }}
                                onClick={() => setEmail('')}
                                type="button"
                                >
                                Clear
                            </button>
                        </div>                        
                    </form>
                </div>

                <div className="security-check-container" style={{ maxHeight: "300px", minHeight: "110px", overflowY: "auto" }}> 

                    {!loading && (
                    <>
                        {/* Display result status */}                   
                        <div className="security-status" style={{ marginTop: "24px" }}>
                            {dangerEmail && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                            {safeEmail && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                            {warningEmail && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                            <div className="status-text">
                                {(dangerEmail || warningEmail) && <h3 className="status-title">Your email has been leaked!</h3> }
                                {safeEmail && <h3 className="status-title">Your email is safe</h3> }                        
                                <p className="status-description">
                                    {(dangerEmail || warningEmail) && result}
                                </p>
                            </div>
                        </div> 

                        <div className="security-status" style={{ marginTop: "24px" }}>
                            {highRisk && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                            {lowRisk && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                            {(mediumRisk || unknownRisk) && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                            <div className="status-text">
                                {breachesFound && <h3 className="status-title">Risk level is {risk}</h3>}
                                <p className="status-description">
                                    {lowRisk && "\"Prevention is better than cure.\" - Use strong passwords to keep threats at bay."}
                                    {mediumRisk && "\"Better safe than sorry.\" - Don't let your guard down, use extra security measures to protect your information."}
                                    {highRisk && "\"Forewarned is forearmed.\" - Take immediate action to secure your accounts and review for suspicious activity."}
                                    {unknownRisk && "\"You never know what’s around the corner.\" - Take precautionary measures, even if the risk isn’t clear yet."}
                                </p>
                            </div>
                        </div>                             
                    </>
                    )}   

                    <div style={{ paddingTop: "16px", display: "flex", justifyContent: "center" }}>
                        {loading && <div className="loading-spinner"></div>}
                    </div>  

                    {/* Show EmailBreachDetails if breaches are found */}
                    {breachData && <EmailBreachDetails data={breachData} />}

                </div>               

                {/*Clear & Tips buttons*/}
                <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={handleClear}>
                    Clear
                    </button>
                    <button className="btn btn-primary" onClick={switchPage}>
                    Tips
                    </button>
                </div>
            </div>
        </>
    );
}

export default EmailStatus;
