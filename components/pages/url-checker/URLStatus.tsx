import {FormEvent, useState} from "react";
import URLScam from "./URLScam";
import { useReport } from "../report-page/ReportContext";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);
    const { report, updateReport } = useReport();


    const API_KEY = String(useAppConfig().safeBrowsingApiKey);
    const API_KEY_URLScanIO = String(useAppConfig().urlscanioApiKey);
    const API_URL = "https://www.virustotal.com/api/v3/urls";
    


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
        updateReport("UrlScans", report.UrlScans + 1);
        e.preventDefault();
        setShowURLScam(false);
        setLoading(true);
        setResult("🔍 Checking...");
        
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
                checkURLScanIO(url) // Changed to use quick-scan
            ]);

            // Process combined results
            let finalResult = "";
            
            // Process VirusTotal result
            if (virusTotalResult.status === 'fulfilled' && virusTotalResult.value) {
                finalResult += virusTotalResult.value;
            } else {
                finalResult += "⚠️ VirusTotal scanning failed. ";
            }
            
            // Process Hybrid Analysis result
            if (hybridAnalysisResult.status === 'fulfilled' && hybridAnalysisResult.value) {
                finalResult += "\n\n" + hybridAnalysisResult.value;
            } else {
                finalResult += "\n\n⚠️ Hybrid Analysis scanning failed.";
            }
            
            setResult(finalResult);
        } catch (error) {
            console.error("Error while scanning URLL:", error);
            setResult("❌ Error while scanning URL.");
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
    
                let errorMessage = "❌ VirusTotal: Error while scanning URL.";
                switch (errorCode) {
                    case 400:
                        errorMessage = "❌ VirusTotal: Wrong query. Domain does not exist";
                        break;
                    case 401:
                        errorMessage = "❌ VirusTotal: Wrong API key.";
                        break;
                    case 403:
                        errorMessage = "❌ VirusTotal: Not enough permissions.";
                        break;
                    case 429:
                        errorMessage = "❌ VirusTotal: API quota limit reached.";
                        break;
                    case 500:
                        errorMessage = "❌ VirusTotal: Server error. Try to scan later.";
                        break;
                }
                return errorMessage;
            }
            
            // Jei viskas gerai, bandom gauti analize
            const data = await response.json();
            return await pollVirusTotalResults(data.data.id);
            
        } catch (error) {
            console.error("VirusTotal error:", error);
            return "❌ VirusTotal: Error while scanning URL.";
        }
    };

    const checkURLScanIO = async (urlToCheck: string) => {
        try {
            const normalizedUrl = normalizeURL(urlToCheck);
            
            // First, check if the URL has already been scanned recently
            const searchResponse = await fetch(`https://urlscan.io/api/v1/search/?q=page.url:"${encodeURIComponent(normalizedUrl)}"&size=1`, {
                method: "GET",
                headers: {
                    "API-Key": API_KEY_URLScanIO
                }
            });
            
            // If we found a recent scan, use those results instead of creating a new scan
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                if (searchData.results && searchData.results.length > 0) {
                    const recentScan = searchData.results[0];
                    const scanTime = new Date(recentScan.task.time);
                    const currentTime = new Date();
                    const hoursDifference = (currentTime.getTime() - scanTime.getTime()) / (1000 * 60 * 60);
                    
                    // If scan is less than 24 hours old, use it
                    if (hoursDifference < 24) {
                        //setDebug(`Found recent scan from ${scanTime.toLocaleString()}`);
                        return processURLScanResponse(recentScan);
                    }
                }
            }
            
            // If no recent scan found, submit the URL for scanning
            const scanResponse = await fetch("https://urlscan.io/api/v1/scan/", {
                method: "POST",
                headers: {
                    "API-Key": API_KEY_URLScanIO,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: normalizedUrl,
                    visibility: "public"
                })
            });
            
            if (!scanResponse.ok) {
                const errorCode = scanResponse.status;
                let errorMessage = "❌ URLScan.io: Error while submitting scan.";
                
                switch (errorCode) {
                    case 400:
                        errorMessage = "❌ URLScan.io: Invalid request format.";
                        break;
                    case 401:
                        errorMessage = "❌ URLScan.io: Invalid API key.";
                        break;
                    case 429:
                        errorMessage = "❌ URLScan.io: API quota limit reached.";
                        break;
                    case 500:
                        errorMessage = "❌ URLScan.io: Server error. Try to scan later.";
                        break;
                }
                return errorMessage;
            }
            
            const scanData = await scanResponse.json();
            const uuid = scanData.uuid;
            const resultUrl = scanData.api;
            
            // Poll for results with improved parameters
            return await pollURLScanResults(uuid, resultUrl);
            
        } catch (error) {
            console.error("URLScan.io error:", error);
            return "❌ URLScan.io: Error while scanning URL.";
        }
    };
    
    const pollURLScanResults = async (uuid: string, resultUrl: string) => {
        let attempts = 0;
        const maxAttempts = 15;  // Increased from 10 to 15
        const initialDelay = 8000;  // Increased initial delay to 8 seconds
        
        // Return initial message that scan is in progress
        //setDebug(`URLScan.io scan submitted. UUID: ${uuid}. Waiting for results...`);
        
        while (attempts < maxAttempts) {
            try {
                // GET scan results
                const resultResponse = await fetch(resultUrl, {
                    method: "GET",
                    headers: {
                        "API-Key": API_KEY_URLScanIO
                    }
                });
                
                if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    
                    // Check scan status
                    if (resultData.task && resultData.task.status === "complete") {
                        //setDebug(`Scan complete after ${attempts + 1} attempts`);
                        return processURLScanResponse(resultData);
                    }
                    
                    // Provide status updates in debug
                    //setDebug(`Attempt ${attempts + 1}/${maxAttempts}: Scan status: ${resultData.task?.status || "unknown"}`);
                }
            } catch (error) {
                console.error("URLScan.io result retrieving error:", error);
                //setDebug(`Error checking scan status: ${error}`);
            }
            
            attempts++;
            // Use exponential backoff for waiting (start with longer delay, then increase)
            const delay = initialDelay + (attempts * 2000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // If we timeout, check one more time with an alternative method
        try {
            const directResultUrl = `https://urlscan.io/api/v1/result/${uuid}/`;
            const finalAttempt = await fetch(directResultUrl, {
                headers: {
                    "API-Key": API_KEY_URLScanIO
                }
            });
            
            if (finalAttempt.ok) {
                const resultData = await finalAttempt.json();
                if (resultData.task && resultData.task.status === "complete") {
                    //setDebug("Found results on final attempt");
                    return processURLScanResponse(resultData);
                }
            }
        } catch (error) {
            console.error("Final attempt error:", error);
        }
        
        return `⚠️ URLScan.io: Scanning in progress. View results at: https://urlscan.io/result/${uuid} in a few minutes.`;
    };
    
    const processURLScanResponse = (resultData: any) => {
        try {
            // Extract security related information
            const verdicts = resultData.verdicts || {};
            const malicious = verdicts.overall && verdicts.overall.malicious;
            const score = verdicts.overall && verdicts.overall.score || 0;
            const categories = verdicts.overall && verdicts.overall.categories || [];
            
            // Extract page information
            const pageTitle = resultData.page && resultData.page.title || "Unknown";
            const server = resultData.page && resultData.page.server || "Unknown";
            const ipAddress = resultData.page && resultData.page.ip || "Unknown";
            const uuid = resultData.task && resultData.task.uuid;
            const reportUrl = `https://urlscan.io/result/${uuid}`;
            
            // Build the result message
            let result = "";
            
            if (malicious) {
                result = `🚨 URLScan.io: Website is malicious! Risk score: ${score}/100\n`;
                if (categories.length > 0) {
                    result += `Categories: ${categories.join(", ")}\n`;
                }
            } else if (score > 0) {
                result = `⚠️ URLScan.io: Website might be suspicious. Risk score: ${score}/100\n`;
            } else {
                result = `✅ URLScan.io: Website appears safe. Risk score: ${score}/100\n`;
            }
            
            // Add additional details
            //result += `Page title: ${pageTitle}\n`;
            //result += `Server: ${server}\n`;
            //result += `IP Address: ${ipAddress}\n`;
            result += `Full report - <a href="${reportUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">here</a>`;
            
            return result;
            
        } catch (error) {
            console.error("Error processing URLScan.io response:", error);
            if (resultData && resultData.task && resultData.task.uuid) {
                return `⚠️ URLScan.io: Results available but failed to process. View full results at: https://urlscan.io/result/${resultData.task.uuid}`;
            } else {
                return "⚠️ URLScan.io: Results available but failed to process.";
            }
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
                console.error("VirusTotal result retrieving error:", error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 6000));
        }
        
        return "⚠️ VirusTotal: Scanning took too long. Try again later.";
    };

    const processVirusTotalResponse = (resultData: any) => {
        const stats = resultData.data.attributes.stats;
        const totalDetections = stats.malicious + stats.suspicious;
        const totalVendors = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;

        if (totalVendors === 0) {
            return "⚠️ VirusTotal: URL still hasn't been analysed. Try again later.";
        }
            
        if (totalDetections > 0) {
            if (stats.malicious >= 5)
                return `🚨 VirusTotal: Website is malicious! Found ${totalDetections} threats out of ${totalVendors} vendors.`;
            else
                return `⚠️ VirusTotal: Website could be dangerous! Found ${totalDetections} threats out of ${totalVendors} vendors.`;
        } else {
            return `✅ VirusTotal: Website is safe. No threats found out of ${totalVendors} vendors.`;
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
            <h2 style={{ color: "white" }}>Check website safety</h2>

            <form onSubmit={UrlChecker}>
                <input
                    type="text"
                    placeholder="Enter website address..."
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
                    Check
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
                <div 
                    style={{ fontWeight: "bold", color: "white" }}
                    dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }}
                />

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