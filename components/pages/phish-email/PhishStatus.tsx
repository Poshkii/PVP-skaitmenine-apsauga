import { useTranslation } from "react-i18next";
import {useNavigate} from "react-router";
import { Info, Book } from 'lucide-react';

function PhishStatus() {
    const { t } = useTranslation('phishEmail');
    const navigate = useNavigate();
    const [sender, setSender] = useState("");
    const [body, setBody] = useState("");
    const [email, setEmail] = useState("");
    const [result, setResult] = useState("");
    const [activeTab, setActiveTab] = useState<"checkNow" | "prevScan">("checkNow");

    const handleClear = () => {
        setSender("");
        setBody("");
        setEmail("");
        setResult("");
    };

    const PhishChecker = async () => {

    }

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


                </div>

                <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={handleClear}>
                    {t('clear')}
                    </button>
                    <button className="btn btn-primary" onClick={PhishChecker}>
                    {t('scanAgain')}
                    </button>
                </div>
            </div>
        </>
    );
}

export default PhishStatus;