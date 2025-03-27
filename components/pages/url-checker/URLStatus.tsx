import {FormEvent, useEffect, useState} from "react";
import URLScam from "./URLScam";
import {useReport} from "../report-page/ReportContext";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [result, setResult] = useState("");
    const [VTResult, setVTResult] = useState("");
    const [urlScanResult, setUrlScanResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);
    const { report, updateReport } = useReport();
    const { sendToModule } = useModuleMessaging();

    const API_KEY = String(useAppConfig().safeBrowsingApiKey);
    const API_KEY_URLScanIO = String(useAppConfig().urlscanioApiKey);
    const API_URL = "https://www.virustotal.com/api/v3/urls";


    useEffect(() => {
        const onMessage = (message: UiMessage) => {
            switch (message.id) {
                case UiMessageId.VirusTotalScanFinished: {
                    const result = processVirusTotalResponse(message.data);
                    setVTResult(result);
                    break;
                }
                case UiMessageId.UrlScanFinished: {
                    const result = processURLScanResponse(message.data);
                    setUrlScanResult(result);
                    break;
                }
            }
        };

        browser.runtime.onMessage.addListener(onMessage);

        return () => {
            browser.runtime.onMessage.removeListener(onMessage);
        };
    }, []);

    const checkPreviousScan = async () => {
        const prevVTUrl = await browser.storage.local.get(["prevVTUrl"]);
        const vtUrl = prevVTUrl["prevVTUrl"];

        if (vtUrl){
            getVirustotalResult(vtUrl).then((data) => {
                    if (data) {
                        const result = processVirusTotalResponse(data);
                        setVTResult(result);
                    }
                }
            );
        }

        const prevUrlScanUrl = await browser.storage.local.get(["prevUrlScanUrl"]);
        const url = prevUrlScanUrl["prevUrlScanUrl"];
        if (url){
            getUrlScanResult(url).then((data) => {
                if (data) {
                    const result = processURLScanResponse(data);
                    setUrlScanResult(result);
                }
            });
        }
    }

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
            checkVirusTotal(url).then((result) => setVTResult(result));
            checkURLScanIO(url).then((result) => setUrlScanResult(result));
        } catch (error) {
            console.error("Error while scanning URL:", error);
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
            const pollUrl = `https://www.virustotal.com/api/v3/analyses/${data.data.id}`
            await browser.storage.local.set({ ["prevVTUrl"] : pollUrl });
            sendToModule(ModuleId.UrlChecker, {id: ModuleMessageId.PollVirusTotalScan, data: {url: pollUrl}});
            return "⚠️ Virustotal: Scanning in progress.";
        } catch (error) {
            console.error("VirusTotal error:", error);
            return "❌ VirusTotal: Error while scanning URL.";
        }
    };

    const getVirustotalResult = async(url: string) => {
        try {
            // GET analysis
            const resultResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "x-apikey": API_KEY
                }
            });

            if (resultResponse.ok) {
                return await resultResponse.json();
            }
        } catch (error) {
            console.error("VirusTotal result retrieving error:", error);
        }
        return null;
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
            await browser.storage.local.set({["prevUrlScanUrl"] : resultUrl});
            // Poll for results with improved parameters
            sendToModule(ModuleId.UrlChecker, {id: ModuleMessageId.PollUrlScan, data: {uuid: uuid, url: resultUrl}});
            return "⚠️ URLScan.io: Scanning in progress.";
        } catch (error) {
            console.error("URLScan.io error:", error);
            return "❌ URLScan.io: Error while scanning URL.";
        }
    };

    const getUrlScanResult = async (url: string) => {
        try {
            const resultResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "API-Key": API_KEY_URLScanIO,
                }
            });

            if (resultResponse.ok) {
                return await resultResponse.json();
            }
        } catch (error) {
            console.error("URLScan.io result retrieving error:", error);
        }
        return null;
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


    const processVirusTotalResponse = (resultData: any) => {
        const stats = resultData.data.attributes.stats;
        const totalDetections = stats.malicious + stats.suspicious;
        const totalVendors = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;

        if (totalVendors === 0) {
            return "⚠️ VirusTotal: URL dar nebuvo analizuotas. Bandykite vėliau.";
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
            <h2 style={{ color: "white" }}>Patikrinkite svetainės saugumą</h2>

                <form onSubmit={UrlChecker}>
                    <input
                        type="text"
                        placeholder="Įveskite svetainės nuorodą..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{ padding: "0.5rem", width: "90%" }}
                    />
                    <div style={{ display: "flex", gap: "5px", marginTop: "0.5rem" }}>
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
                                cursor: !url || loading ? "not-allowed" : "pointer"
                            }}
                        >
                            Tikrinti
                        </button>
                        <button
                            type="button"
                            style={{
                                width: "200px",
                                height: "40px",
                                backgroundColor: "#6366f1",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                outline: "none",
                                transition: "background-color 0.2s ease-in-out",
                                cursor: "pointer"
                            }}
                            onClick={checkPreviousScan}
                        >
                            Previous Scan
                        </button>
                    </div>
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
                <div style={{ fontWeight: "bold", color: "white" }}>
                    <p>{VTResult}</p>
                </div>

                <div
                    style={{ fontWeight: "bold", color: "white" }}
                    dangerouslySetInnerHTML={{ __html: urlScanResult }}
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