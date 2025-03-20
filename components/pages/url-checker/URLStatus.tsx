import {FormEvent, useState} from "react";
import URLScam from "./URLScam";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);

    const API_KEY = String(useAppConfig().safeBrowsingApiKey);
    const API_KEY_HYBRID = String(useAppConfig().hybridAnalysisApiKey);
    const API_URL = "https://www.virustotal.com/api/v3/urls";
    
    // Updated to use the Hybrid Analysis sandbox URL submission endpoint
    const HYBRID_API_URL = "https://www.hybrid-analysis.com/api/v2/submit/url";
    const HYBRID_API_REPORT_URL = "https://www.hybrid-analysis.com/api/v2/report";

    const normalizeURL = (str: string) => {
        if (!/^https?:\/\//i.test(str)) {
            return "https://" + str;
        }
        return str;
    };

    const isValidURL = (str: string) => {
        try {
            new URL(str);
            return str.includes(".");
        } catch (_) {
            return false;
        }
    };

    const UrlChecker = async (e: FormEvent) => {
        e.preventDefault();
        setShowURLScam(false);
        setLoading(true);
        setResult("🔍 Tikrinama...");
        
        /* URL formatavimas
        let formattedUrl = normalizeURL(url);
        if (!isValidURL(formattedUrl)) {
            setLoading(false);
            setResult("❌ Įveskite tinkamą nuorodą.");
            return;
        }
        */

        try {
            // Run both API checks in parallel
            const [virusTotalResult, hybridAnalysisResult] = await Promise.allSettled([
                checkVirusTotal(url),
                checkHybridAnalysis(url)
            ]);

            // Process combined results
            let finalResult = "";
            
            // Process VirusTotal result
            if (virusTotalResult.status === 'fulfilled' && virusTotalResult.value) {
                finalResult += virusTotalResult.value;
            } else {
                finalResult += "⚠️ VirusTotal patikrinimas nepavyko. ";
            }
            
            // Process Hybrid Analysis result
            if (hybridAnalysisResult.status === 'fulfilled' && hybridAnalysisResult.value) {
                finalResult += "\n\n" + hybridAnalysisResult.value;
            } else {
                finalResult += "\n\n⚠️ Hybrid Analysis patikrinimas nepavyko.";
            }
            
            setResult(finalResult);
        } catch (error) {
            console.error("Klaida tikrinant URL:", error);
            setResult("❌ Klaida tikrinant URL.");
        } finally {
            setLoading(false);
            setSubmittedUrl(url);
            setShowURLScam(true);
        }
    };

    const checkVirusTotal = async (urlToCheck: string) => {
        try {
            // REQUEST for analysis
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "x-apikey": API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `url=${encodeURIComponent(urlToCheck)}`
            });
            
            // Klaidu apdorojimas
            if (!response.ok) {
                // Handle HTTP errors
                const errorCode = response.status; // Get the HTTP error code
    
                let errorMessage = "❌ VirusTotal: Klaida tikrinant URL.";
                switch (errorCode) {
                    case 400:
                        errorMessage = "❌ VirusTotal: Neteisinga užklausa.";
                        break;
                    case 401:
                        errorMessage = "❌ VirusTotal: Netinkamas API raktas.";
                        break;
                    case 403:
                        errorMessage = "❌ VirusTotal: Nepakanka leidimų.";
                        break;
                    case 429:
                        errorMessage = "❌ VirusTotal: API kvotų limitas viršytas.";
                        break;
                    case 500:
                        errorMessage = "❌ VirusTotal: Serverio klaida. Bandykite vėliau.";
                        break;
                }
                return errorMessage;
            }
            
            // Jei viskas gerai, bandom gauti analize
            const data = await response.json();
            return await pollVirusTotalResults(data.data.id);
            
        } catch (error) {
            console.error("VirusTotal klaida:", error);
            return "❌ VirusTotal: Klaida tikrinant URL.";
        }
    };

    const checkHybridAnalysis = async (urlToCheck: string) => {
        try {
            // Create form data for the sandbox submission
            const formData = new FormData();
            formData.append("url", urlToCheck);
            formData.append("environment_id", "100"); // Windows 7 32-bit environment
            formData.append("no_share_third_party", "false");
            formData.append("allow_community_access", "false");
            formData.append("comment", "URL safety check");

            // Submit the URL for sandbox analysis
            const response = await fetch(HYBRID_API_URL, {
                method: "POST",
                headers: {
                    "api-key": API_KEY_HYBRID,
                    "User-Agent": "Hybrid Analysis API Client"
                },
                body: formData
            });

            if (!response.ok) {
                const errorCode = response.status;
                let errorMessage = "❌ Hybrid Analysis: Klaida tikrinant URL.";
                
                switch (errorCode) {
                    case 400:
                        errorMessage = "❌ Hybrid Analysis: Neteisinga užklausa.";
                        break;
                    case 401:
                        errorMessage = "❌ Hybrid Analysis: Netinkamas API raktas.";
                        break;
                    case 403:
                        errorMessage = "❌ Hybrid Analysis: Nepakanka leidimų.";
                        break;
                    case 429:
                        errorMessage = "❌ Hybrid Analysis: API kvotų limitas viršytas.";
                        break;
                    case 500:
                        errorMessage = "❌ Hybrid Analysis: Serverio klaida. Bandykite vėliau.";
                        break;
                }

                // Add more detailed error message if available
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage += ` (${errorData.message})`;
                    }
                } catch (e) {
                    // Ignore error parsing failure
                }
                
                return errorMessage;
            }

            const submissionData = await response.json();
            
            // Check if the submission was successful
            if (submissionData && submissionData.submission_id) {
                // Log submission ID for debugging
                setDebug(prev => prev + `\nHybrid Analysis Submission ID: ${submissionData.submission_id}`);
                
                // Now poll for the analysis results
                return await pollHybridAnalysisResults(submissionData.submission_id);
            } else {
                return "⚠️ Hybrid Analysis: Nepavyko pateikti URL analizei.";
            }
            
        } catch (error) {
            console.error("Hybrid Analysis klaida:", error);
            return "❌ Hybrid Analysis: Klaida tikrinant URL.";
        }
    };

    const pollHybridAnalysisResults = async (submissionId: string) => {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            try {
                // Get analysis report
                const reportResponse = await fetch(`${HYBRID_API_REPORT_URL}/${submissionId}`, {
                    method: "GET",
                    headers: {
                        "api-key": API_KEY_HYBRID,
                        "User-Agent": "Hybrid Analysis API Client",
                        "Accept": "application/json"
                    }
                });

                if (reportResponse.ok) {
                    const reportData = await reportResponse.json();
                    
                    // If analysis is complete
                    if (reportData.state === "SUCCESS" || reportData.state === "REPORTED") {
                        return processHybridAnalysisReportResponse(reportData);
                    }
                    
                    // If still in progress, log the current state
                    setDebug(prev => prev + `\nHybrid Analysis State: ${reportData.state}`);
                }
            } catch (error) {
                console.error("Hybrid Analysis rezultatų gavimo klaida:", error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 8000)); // Polls every 8 seconds
        }
        
        // If we've reached the maximum attempts
        return "⚠️ Hybrid Analysis: URL analizė vis dar vykdoma. Rezultatas gali užtrukti iki kelių minučių.";
    };

    const pollVirusTotalResults = async (dataId: string) => {
        let attempts = 0;
        const maxAttempts = 10;

        const resultUrl = `https://www.virustotal.com/api/v3/analyses/${dataId}`;

        while (attempts < maxAttempts) {
            try {
                // GET analysis
                const resultResponse = await fetch(resultUrl, {
                    method: "GET",
                    headers: {
                        "x-apikey": API_KEY
                    }
                });

                if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    return processVirusTotalResponse(resultData);
                }
            } catch (error) {
                console.error("VirusTotal rezultatų gavimo klaida:", error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 6000));
        }
        
        return "⚠️ VirusTotal: Patikrinimas užtruko per ilgai. Bandykite vėliau.";
    };

    const processVirusTotalResponse = (resultData: any) => {
        const stats = resultData.data.attributes.stats;
        const totalDetections = stats.malicious + stats.suspicious;
        const totalVendors = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;

        if (totalVendors === 0) {
            return "⚠️ VirusTotal: URL dar nebuvo analizuotas. Bandykite vėliau.";
        }
            
        if (totalDetections > 0) {
            if (stats.malicious >= 5)
                return `🚨 VirusTotal: Svetainė yra kenksminga! Aptikta ${totalDetections} grėsmingų įrašų iš ${totalVendors} tiekėjų.`;
            else
                return `⚠️ VirusTotal: Pavojinga svetainė! Aptikta ${totalDetections} grėsmingų įrašų iš ${totalVendors} tiekėjų.`;
        } else {
            return `✅ VirusTotal: Svetainė saugi. Neaptikta jokių grėsmių iš ${totalVendors} tiekėjo/-ų.`;
        }
    };

    const processHybridAnalysisReportResponse = (reportData: any) => {
        if (!reportData) {
            return "⚠️ Hybrid Analysis: Nepateikta jokių rezultatų šiam URL.";
        }

        let threatScore = reportData.threat_score || 0;
        let verdict = reportData.verdict || "unknown";
        
        if (verdict === "malicious" || threatScore >= 80) {
            return `🚨 Hybrid Analysis: Svetainė yra kenksminga! Grėsmės įvertinimas: ${threatScore}/100.`;
        } else if (verdict === "suspicious" || threatScore >= 40) {
            return `⚠️ Hybrid Analysis: Pavojinga svetainė! Grėsmės įvertinimas: ${threatScore}/100.`;
        } else {
            return `✅ Hybrid Analysis: Svetainė saugi. Grėsmės įvertinimas: ${threatScore}/100.`;
        }
    };

    return (
        <>
            <div style={{ 
                marginTop: "1em", 
                height: "calc(100vh - 100px)",
                display: "flex", 
                flexDirection: "column" 
}           }>
            <h2 style={{ color: "white" }}>Patikrinkite svetainės saugumą</h2>

            <form onSubmit={UrlChecker}>
                <input
                    type="text"
                    placeholder="Įveskite svetainės nuorodą..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ padding: "0.5rem", width: "90%" }}
                />
                <button
                    disabled={!url || loading}
                    type="submit"
                    style={{ 
                        width: "200px", 
                        height: "40px", 
                        backgroundColor: "#4b5563", 
                        color: "white", 
                        border: "none",
                        borderRadius: "8px", 
                        outline: "none", 
                        transition: "background-color 0.2s ease-in-out",
                        marginTop: "0.5rem", 
                        cursor: !url || loading ? "not-allowed" : "pointer" 
                    }}
                >
                    Tikrinti
                </button>
            </form>

            <div style={{ 
                flexGrow: 1,
                overflowY: "auto", 
                marginTop: "0.5rem", 
                padding: "5px", 
                border: "1px solid #666", 
                borderRadius: "5px",
                maxHeight: "250px",
            }}>              
                <div style={{ fontWeight: "bold", color: "white", whiteSpace: "pre-line" }}>
                    {result}
                </div>

                <div style={{ paddingTop: "0.8rem"}}>
                    {loading && <div className="loader"></div>}
                </div>

                <div style={{ marginTop: "0.5rem", color: "#aaa", fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                    {debug}
                </div>

                <div>
                    {showURLScam && <URLScam scamURL={submittedUrl} />}
                </div>
            </div> 
        </div>

        </>
    );
}

export default URLStatus;