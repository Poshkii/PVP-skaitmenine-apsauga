import {FormEvent, useState} from "react";
import URLScam from "./URLScam";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);
    const [urlCache, setUrlCache] = useState<{[key: string]: {
        result: string, 
        timestamp: number
      }}>({});

    const API_KEY = String(useAppConfig().safeBrowsingApiKey);
    const API_KEY_HYBRID = String(useAppConfig().hybridAnalysisApiKey);
    const API_URL = "https://www.virustotal.com/api/v3/urls";
    
    // Updated to use quick-scan API endpoint
    const HYBRID_API_QUICK_SCAN_URL = "https://www.hybrid-analysis.com/api/v2/quick-scan/url";

    const normalizeURL = (str: string): string => {
        // Check if it already has a valid scheme (http or https)
        if (/^(https?:\/\/)/i.test(str)) {
            return str;
        }
    
        // Check if it looks like a domain (has at least one dot)
        if (/\./.test(str)) {
            return "https://" + str;
        }
    
        // If it's not a domain, return as is (possibly a relative path or local address)
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
                checkHybridAnalysisQuickScan(url) // Changed to use quick-scan
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
            const normalizedUrl = normalizeURL(urlToCheck);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "x-apikey": API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `url=${encodeURIComponent(normalizedUrl)}`
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

    const checkHybridAnalysisQuickScan = async (urlToCheck: string) => {
        try {
            const normalizedUrl = normalizeURL(urlToCheck);
            const urlObj = new URL(normalizedUrl);
            const domain = urlObj.hostname;
            
            const cacheEntry = urlCache[domain];
            const now = Date.now();
            if (cacheEntry && (now - cacheEntry.timestamp < 3600000)) {
                //setDebug(prev => prev + "\nUsing cached Hybrid Analysis result for " + domain);
                return cacheEntry.result;
            }
            
            // First, try to search for existing reports for this domain
            const searchFormData = new FormData();
            searchFormData.append("domain", domain);
            
            const searchResponse = await fetch("https://www.hybrid-analysis.com/api/v2/search/terms", {
                method: "POST",
                headers: {
                    "api-key": API_KEY_HYBRID,
                    "User-Agent": "Hybrid Analysis API Client"
                },
                body: searchFormData
            });
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                // If we found recent results (less than 3 days old)
                if (searchData && searchData.result && searchData.result.length > 0) {
                    // Sort by timestamp to get the most recent result
                    const sortedResults = searchData.result.sort((a: any, b: any) => 
                        new Date(b.analysis_start_time).getTime() - new Date(a.analysis_start_time).getTime()
                    );
                    
                    const latestResult = sortedResults[0];
                    const resultTime = new Date(latestResult.analysis_start_time).getTime();
                    
                    // jeigu issaugotas scanas ne veliau kaip pries 3 dienas, tada neskanuojam
                    if (now - resultTime < 259200000) { 
                        //setDebug(prev => prev + "\nFound existing Hybrid Analysis report for " + domain);
                        
                        const result = processHybridAnalysisExistingReport(latestResult);
                        
                        setUrlCache(prev => ({
                            ...prev,
                            [domain]: { result, timestamp: now }
                        }));
                        
                        return result;
                    }
                }
            }
            
            //setDebug(prev => prev + "\nSubmitting to Hybrid Analysis quick-scan: " + domain);
            
            // jei nerado egziztuojanciu skanu, tai skanuojam patys
            const formData = new FormData();
            formData.append("url", urlToCheck);
            formData.append("scan_type", "all");
    
            const response = await fetch(HYBRID_API_QUICK_SCAN_URL, {
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
    
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage += ` (${errorData.message})`;
                        
                        if (errorData.message.includes("already submitted")) {
                            return await checkExistingReports(domain);
                        }
                    }
                } catch (e) {
                }
                
                return errorMessage;
            }
    
            const scanData = await response.json();
            const result = processHybridAnalysisQuickScanResponse(scanData);
            
            setUrlCache(prev => ({
                ...prev,
                [domain]: { result, timestamp: now }
            }));
            
            return result;
            
        } catch (error) {
            console.error("Hybrid Analysis klaida:", error);
            return "❌ Hybrid Analysis: Klaida tikrinant URL.";
        }
    };
    
    const checkExistingReports = async (domain: string) => {
        try {
            //setDebug(prev => prev + "\nChecking existing reports for " + domain);
            
            const searchFormData = new FormData();
            searchFormData.append("domain", domain);
            
            const searchResponse = await fetch("https://www.hybrid-analysis.com/api/v2/search/terms", {
                method: "POST",
                headers: {
                    "api-key": API_KEY_HYBRID,
                    "User-Agent": "Hybrid Analysis API Client"
                },
                body: searchFormData
            });
            
            if (!searchResponse.ok) {
                return "⚠️ Hybrid Analysis: API kvotų limitas viršytas, negalima gauti esamų rezultatų.";
            }
            
            const searchData = await searchResponse.json();
            
            if (searchData && searchData.result && searchData.result.length > 0) {
                const sortedResults = searchData.result.sort((a: any, b: any) => 
                    new Date(b.analysis_start_time).getTime() - new Date(a.analysis_start_time).getTime()
                );
                
                const latestResult = sortedResults[0];
                
                return processHybridAnalysisExistingReport(latestResult);
            } else {
                return "⚠️ Hybrid Analysis: API kvotų limitas viršytas, nėra ankstesnių rezultatų.";
            }
        } catch (error) {
            console.error("Error checking existing reports:", error);
            return "⚠️ Hybrid Analysis: API kvotų limitas viršytas, klaida tikrinant esamus rezultatus.";
        }
    };
    
    const processHybridAnalysisExistingReport = (report: any) => {
        if (!report) {
            return "⚠️ Hybrid Analysis: Nepateikta jokių rezultatų šiam URL.";
        }
    
        let threatScore = report.threat_score || 0;
        let verdict = report.verdict || "unknown";
        
        const analysisDate = new Date(report.analysis_start_time);
        const dateStr = analysisDate.toLocaleDateString();
        
        if (verdict === "malicious" || threatScore >= 80) {
            return `🚨 Hybrid Analysis: Svetainė yra kenksminga! Grėsmės įvertinimas: ${threatScore}/100. (${dateStr})`;
        } else if (verdict === "suspicious" || threatScore >= 40) {
            return `⚠️ Hybrid Analysis: Pavojinga svetainė! Grėsmės įvertinimas: ${threatScore}/100. (${dateStr})`;
        } else {
            return `✅ Hybrid Analysis: Svetainė saugi. Grėsmės įvertinimas: ${threatScore}/100. (${dateStr})`;
        }
    };

    const processHybridAnalysisQuickScanResponse = (scanData: any) => {
        if (!scanData || !scanData.scanners) {
            return "⚠️ Hybrid Analysis: Nepateikta jokių rezultatų šiam URL.";
        }
    
        let totalScanners = 0;
        let detectedThreats = 0;
        let highestThreatScore = 0;
        
        for (const scanner of scanData.scanners) {
            totalScanners++;
            
            if (scanner.detected) {
                detectedThreats++;
            }
            
            if (scanner.threat_score && scanner.threat_score > highestThreatScore) {
                highestThreatScore = scanner.threat_score;
            }
        }
        
        const knownSafeDomains = [
            'google.com', 'gmail.com', 'youtube.com', 'microsoft.com', 'apple.com', 
            'amazon.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 
            'netflix.com', 'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 
            'wikipedia.org', 'mozilla.org', 'cloudflare.com', 'paypal.com', 'zoom.us', 
            'dropbox.com', 'adobe.com', 'salesforce.com', 'oracle.com', 'ibm.com', 
            'nvidia.com', 'tesla.com', 'spotify.com', 'tiktok.com', 'whatsapp.com', 
            'twitch.tv', 'reddit.com', 'quora.com', 'yahoo.com', 'duckduckgo.com', 
            'protonmail.com', 'outlook.com', 'live.com', 'bbc.com', 'cnn.com', 
            'nytimes.com', 'theguardian.com', 'wsj.com', 'forbes.com', 'bloomberg.com', 
            'cnbc.com', 'businessinsider.com', 'reuters.com', 'apnews.com', 'weather.com',
            'booking.com', 'expedia.com', 'airbnb.com', 'uber.com', 'lyft.com', 
            'medium.com', 'discord.com', 'slack.com', 'trello.com', 'notion.so', 
            'zoho.com', 'weebly.com', 'wordpress.com', 'wix.com', 'squareup.com', 
            'stripe.com', 'venmo.com', 'telegram.org', 'signal.org'
        ];
        
        let domain = "";
        try {
            const urlObj = new URL(scanData.url);
            domain = urlObj.hostname;
            domain = domain.replace(/^www\./, '');
            
            for (const safeDomain of knownSafeDomains) {
                if (domain === safeDomain || domain.endsWith('.' + safeDomain)) {
                    return `✅ Hybrid Analysis: Svetainė žinoma kaip saugi, nepaisant techninio įvertinimo ${highestThreatScore}/100.`;
                }
            }
        } catch (e) {
            // Ignore URL parsing errors
        }
        
        // Calculate overall verdict based on scanner results
        if (detectedThreats > 0) {
            if (detectedThreats >= 2 || highestThreatScore >= 80) {
                return `🚨 Hybrid Analysis: Svetainė yra kenksminga! Aptikta ${detectedThreats} grėsmių iš ${totalScanners} skenerių. Grėsmės įvertinimas: ${highestThreatScore}/100.`;
            } else {
                return `⚠️ Hybrid Analysis: Pavojinga svetainė! Aptikta ${detectedThreats} grėsmių iš ${totalScanners} skenerių. Grėsmės įvertinimas: ${highestThreatScore}/100.`;
            }
        } else if (highestThreatScore >= 70) {
            return `⚠️ Hybrid Analysis: Svetainė techniškai įtartina, tačiau gali būti klaidingai įvertinta. Grėsmės įvertinimas: ${highestThreatScore}/100.`;
        } else {
            return `✅ Hybrid Analysis: Svetainė saugi. Neaptikta jokių grėsmių iš ${totalScanners} skenerių. Grėsmės įvertinimas: ${highestThreatScore}/100.`;
        }
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