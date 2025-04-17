import { useState, useRef } from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router";
import { Info, Lock, Book } from 'lucide-react';
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import CookieTips from "./CookieTips";
import CookieData from "./CookieData";

function CookieReader() {
    const [activeTab, setActiveTab] = useState<"reader" | "tips">("reader");

    const navigate = useNavigate();

    const [cookies, setCookies] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const fetchCookies = () => {
        // Send a message to the background script to retrieve cookies
        browser.runtime.sendMessage({ id: BgMessageId.GetCookies })
            .catch((err) => {
                console.error("Error sending message:", err);
                setError(`Error sending message to background: ${err.message}`);
            });
    };

    // Listen for the response from the background script when the component mounts
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.id === UiMessageId.CookiesRetrieved) {
                setCookies(message.data); // Set cookies in state
                setError(null); // Clear any previous error
            } else if (message.id === UiMessageId.CookiesError) {
                setError(message.data.message); // Set the error message
            }
        };
    
        browser.runtime.onMessage.addListener(handleMessage);
    
        // Cleanup the listener when the component unmounts
        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const handleClear = () => {
        setCookies([]);
        return
    };

    return (
        <>
            <div className="middle-menu">
                <h1 className="panel-title">
                    Read Stored Cookies
                </h1>
                
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab("reader")} 
                        className={`btn ${activeTab === "reader" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Lock size={18} />
                            Cookie Reader
                        </div>
                    </button>
                    <button 
                        onClick={() => setActiveTab("tips")} 
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            Cookie Tips
                        </div>
                    </button>
                </div>

                {activeTab === "reader" && (
                    <>
                        <div className="security-check-container glassmorphism">
                            <div className="security-status">
                                <div className="status-icon">
                                    <Lock size={32} />
                                </div>
                                <div className="status-text">
                                    <h3 className="status-title">
                                        Read Stored Data
                                    </h3>
                                    <p className="status-description">
                                        Click to scan your browser for stored information in the form of cookies
                                    </p>
                                </div>
                            </div>    

                            <div className="action-buttons">                            
                             
                                <button                               
                                    className="btn btn-primary"
                                    style={{
                                        width: "200px"
                                    }}
                                    onClick={fetchCookies}
                                    type="button"
                                    >
                                    Read
                                </button>
                            
                                <button
                                    disabled={cookies.length === 0}
                                    className={`btn btn-secondary`}
                                    style={{ 
                                    width: "200px",
                                    }}
                                    onClick={handleClear}
                                    type="button"
                                    >
                                    Clear
                                </button>  
                            </div>                        
                        </div>        
                        {cookies && <CookieData cookieData = {cookies}/>}           
                    </>
                )}
                {activeTab === "tips" && <CookieTips />}
            </div>
        </>
    );
}

export default CookieReader;