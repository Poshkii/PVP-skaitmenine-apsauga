import {FormEvent, useState, useEffect } from "react";
import URLScam from "./URLScam";
import { useReport } from "../report-page/ReportContext";
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import {useNavigate} from "react-router";
import { Info } from 'lucide-react';
import { useTranslation } from "react-i18next";

const VT_API_URL = String(useAppConfig().virusTotalApiUrl);
const US_API_URL = String(useAppConfig().urlScanApiUrl);

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [resultVT, setResultVT] = useState("");
    const [resultUIO, setResultUIO] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);
    const { report, updateReport } = useReport();
    const [safeVT, setSafeVT] = useState(false);
    const [unknownVT, setUnknownVT] = useState(false);
    const [unsafeVT, setUnsafeVT] = useState(false);
    const [suspiciousVT, setSuspiciousVT] = useState(false);
    const [safeUIO, setSafeUIO] = useState(false);
    const [unknownUIO, setUnknownUIO] = useState(false);
    const [unsafeUIO, setUnsafeUIO] = useState(false);
    const [suspiciousUIO, setSuspiciousUIO] = useState(false);
    const [inprogressUIO, setInprogressUIO] = useState(false);
    const [inprogressVT, setInprogressVT] = useState(false);
    const [doCheck, setDoCheck] = useState(false);
    const { t } = useTranslation('urls');
    
    useEffect(() => {
        if (url && doCheck) {
          const syntheticEvent = { preventDefault: () => {} } as FormEvent;
          UrlChecker(syntheticEvent);
          setDoCheck(false)
        }
      }, [url]); // Runs when 'url' changes
      
      const handleUseCurrentURL = async () => {
          if (chrome?.tabs) {
              chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                  if (tabs.length > 0 && tabs[0].url) {
                      var strippedURL = handleStripURL(tabs[0].url);
                      setDoCheck(true);
                      if (strippedURL) {
                          try {
                            
                              setUrl(strippedURL); // React will update state asynchronously
                          } catch (error) {
                              console.error("URL check failed:", error);
                          }
                      } else {
                          console.error("Unable to strip URL");
                      }
                  }
              });
          } else {
              console.error("Chrome API not available. Are you running this inside a Chrome extension?");
          }
      };

    function handleStripURL(url: string): string | null {
        try {
            let hostname = new URL(url).hostname;
            let parts = hostname.split('.');

            if (parts.length > 2) {
                return parts.slice(-2).join('.');
            }
            return hostname;
        } catch (e) {
            console.error("Invalid URL:", e);
            return null;
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
    const handleClear = () => {
        setResultVT('');
        setResultUIO('');
        setUnsafeVT(false);
        setSafeVT(false);
        setSuspiciousVT(false);
        setUnknownVT(false);
        setInprogressVT(false);

        setUnsafeUIO(false);
        setSafeUIO(false);
        setSuspiciousUIO(false);
        setUnknownUIO(false);
        setInprogressUIO(false);
        setResultUIO("");

        setShowURLScam(false);
        setDebug("");  // Clear debug messages if needed
    };

    const UrlChecker = async (e: FormEvent) => {
        handleClear();
        e.preventDefault();
        setShowURLScam(false);
        setLoading(true);
        //setResult("🔍 Checking...");
        
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
            const [virusTotalResult, urlScanIoResult] = await Promise.allSettled([
                checkVirusTotal(url),
                checkURLScanIO(url)
            ]);

            // Process combined results
            let finalResult = "";
            
            // Process VirusTotal result
            if (virusTotalResult.status === 'fulfilled' && virusTotalResult.value) {
                setResultVT(virusTotalResult.value);
            } else {
                setResultVT(t('VirusTotal.failed'));
                setUnknownVT(true);
            }
            
            // Process UrlScanIo Analysis result
            if (urlScanIoResult.status === 'fulfilled' && urlScanIoResult.value) {
                setResultUIO(urlScanIoResult.value);
            } else {
                setResultUIO(t('ScanIO.failed'));
                setUnknownUIO(true);
            }

        } catch (error) {
            console.error("Error while scanning URLL:", error);
            setResultUIO(t('errorScan'));
            setResultVT(t('errorScan'));
            setUnknownUIO(true);
            setUnknownVT(true);
        } finally {
            updateReport("UrlScans", report.UrlScans + 1);
            setLoading(false);
            setSubmittedUrl(url);
            setShowURLScam(true);
        }
    };

    const checkVirusTotal = async (urlToCheck: string) => {
        try {
            const normalizedUrl = normalizeURL(urlToCheck);
            const response = await fetch(VT_API_URL + "/urls", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `url=${encodeURIComponent(normalizedUrl)}`
            });
            
            // Klaidu apdorojimas
            if (!response.ok) {
                // Handle HTTP errors
                const errorCode = response.status; // Get the HTTP error code
    
                let errorMessage = t('VirusTotal.errorScan');
                switch (errorCode) {
                    case 400:
                        errorMessage = t('VirusTotal.400');
                        break;
                    case 401:
                        errorMessage = t('VirusTotal.401');
                        break;
                    case 403:
                        errorMessage = t('VirusTotal.403');
                        break;
                    case 429:
                        errorMessage = t('VirusTotal.429');
                        break;
                    case 500:
                        errorMessage = t('VirusTotal.500');
                        break;
                }
                setUnknownVT(true);
                return errorMessage;
            }
            
            // Jei viskas gerai, bandom gauti analize
            const data = await response.json();
            return await pollVirusTotalResults(data.data.id);
            
        } catch (error) {
            console.error("VirusTotal error:", error);
            setUnknownVT(true);
            return t('VirusTotal.errorScan');
        }
    };

    const checkURLScanIO = async (urlToCheck: string) => {
        try {
            const normalizedUrl = normalizeURL(urlToCheck);
            
            // First, check if the URL has already been scanned recently
            const searchResponse = await fetch(`${US_API_URL}/search/?q=page.url:"${encodeURIComponent(normalizedUrl)}"&size=1`, {
                method: "GET"
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
            const scanResponse = await fetch(US_API_URL + "/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: normalizedUrl,
                    visibility: "public"
                })
            });
            
            if (!scanResponse.ok) {
                const errorCode = scanResponse.status;
                let errorMessage = t('ScanIO.errorScan');
                
                switch (errorCode) {
                    case 400:
                        errorMessage = t('ScanIO.400');
                        break;
                    case 401:
                        errorMessage = t('ScanIO.401');
                        break;
                    case 429:
                        errorMessage = t('ScanIO.429');
                        break;
                    case 500:
                        errorMessage = t('ScanIO.500');
                        break;
                }
                setUnknownUIO(true);
                return errorMessage;
            }
            
            const scanData = await scanResponse.json();
            const uuid = scanData.uuid;
            const resultUrl = scanData.api;
            
            // Poll for results with improved parameters
            return await pollURLScanResults(uuid, resultUrl);
            
        } catch (error) {
            console.error("URLScan.io error:", error);
            setUnknownUIO(true);
            return t('ScanIO.errorScan');
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
                    method: "GET"
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
            const directResultUrl = `${US_API_URL}/result/${uuid}/`;
            const finalAttempt = await fetch(directResultUrl);
            
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
        setInprogressUIO(true);
        //return `URLScan.io: Scanning in progress. View results at: https://urlscan.io/result/${uuid} in a few minutes.`;
        return t('ScanIO.inProgess', { 
            uuid: uuid,
            url: `https://urlscan.io/result/${uuid}`
          });
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
                setUnsafeUIO(true);
                //result = `URLScan.io: Website is malicious! Risk score: ${score}/100\n`;
                result = t('ScanIO.malicious', {score: score}) + '\n';
                if (categories.length > 0) {
                    //result += `Categories: ${categories.join(", ")}\n`;
                    result += t('ScanIO.categories') + `${categories.join(", ")}\n`;
                }
            } else if (score > 0) {
                setSuspiciousUIO(true);
                //result = `URLScan.io: Website might be suspicious. Risk score: ${score}/100\n`;
                result = t('ScanIO.suspicious', {score: score}) + '\n';
            } else {
                setSafeUIO(true);
                //result = `URLScan.io: Website appears safe. Risk score: ${score}/100\n`;
                result = t('ScanIO.safe', {score: score}) + '\n';
            }
            
            /*
            //Add additional details
            result += `Page title: ${pageTitle}\n`;
            result += `Server: ${server}\n`;
            result += `IP Address: ${ipAddress}\n`;
            */
            //result += `Full report - <a href="${reportUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">here</a>`;
            result += t('ScanIO.fullReport', {reportUrl: reportUrl,});
            
            return result;
            
        } catch (error) {
            console.error("Error processing URLScan.io response:", error);
            if (resultData && resultData.task && resultData.task.uuid) {
                setUnknownUIO(true);
                //return `URLScan.io: Results available but failed to process. View full results at: https://urlscan.io/result/${resultData.task.uuid}`;
                return t('ScanIO.processingFailed', { 
                    uuid: resultData.task.uuid,
                    url: `https://urlscan.io/result/${resultData.task.uuid}`
                  });
            } else {
                setUnknownUIO(true);
                //return "URLScan.io: Results available but failed to process.";
                return t('ScanIO.processingFailedNoScan')
            }
        }
    };
    

    const pollVirusTotalResults = async (dataId: string) => {
        let attempts = 0;
        const maxAttempts = 10;

        const resultUrl = `${VT_API_URL}/analyses/${dataId}`;

        while (attempts < maxAttempts) {
            try {
                // GET analysis
                const resultResponse = await fetch(resultUrl, {
                    method: "GET"
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
        setUnknownVT(true);
        //return "VirusTotal: Scanning took too long. Try again later.";
        return t('VirusTotal.timeout');
    };

    const processVirusTotalResponse = (resultData: any) => {
        const stats = resultData.data.attributes.stats;
        const totalDetections = stats.malicious + stats.suspicious;
        const totalVendors = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;

        if (totalVendors === 0) {
            setInprogressVT(true);
            //return "VirusTotal: URL still hasn't been analysed. Try again later.";
            return t('VirusTotal.noResult');
        }
            
        if (totalDetections > 0) {
            if (stats.malicious >= 5)
            {
                setUnsafeVT(true);
                //return `VirusTotal: Website is malicious! Found ${totalDetections} threats out of ${totalVendors} vendors.`;
                return t('VirusTotal.malicious', {total: totalDetections, vendors: totalVendors});
            }
            else
            {
                setSuspiciousVT(true);
                //return `VirusTotal: Website could be dangerous! Found ${totalDetections} threats out of ${totalVendors} vendors.`;
                return t('VirusTotal.dangerous', {total: totalDetections, vendors: totalVendors});
            }
        } else {
            setSafeVT(true);
            //return `VirusTotal: Website is safe. No threats found out of ${totalVendors} vendors.`;
            return t('VirusTotal.safe', {vendors: totalVendors});
        }
    };

    const navigate = useNavigate();

    return (
        <>
            <div className="middle-menu" >
                <h1 className="panel-title">{t('pageName')} <span onClick={() => navigate("/url-data")}><Info className="info-icon"/></span></h1>

                <div className="security-check-container">
                    <form onSubmit={UrlChecker}>
                            <input
                                type="text"
                                placeholder= {t('enter')}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="input-box"
                            />

                        <div className="action-buttons">                            
                            {!url ? 
                                <button                               
                                    className="btn btn-primary"
                                    style={{
                                        width: "200px"
                                    }}
                                    onClick={handleUseCurrentURL}
                                    type="button"
                                    >
                                    {t('checkCurrent')}
                                </button>
                            :
                                <button
                                    disabled={!url || loading}
                                    type="submit"
                                    className={`btn ${!url || loading ? "" : "btn-primary"}`}
                                    style={{ 
                                    width: "200px",
                                    opacity: !url || loading ? "0.6" : "1",
                                    cursor: !url || loading ? "not-allowed" : "pointer",
                                    }}
                                    >
                                    {t('check')}
                                </button>                            
                            }                            
                            
                            <button
                                className="btn btn-secondary"
                                style={{ 
                                width: "200px"
                                }}
                                onClick={() => setUrl('')}
                                type="button"
                                >
                                {t('clear')}
                            </button>
                        </div>

                    </form>
                </div>

                <div className="security-check-container" style={{ maxHeight: "300px", overflowY: "auto" }}>

                    {!loading && (
                    <>

                        <div className="security-status" style={{ marginTop: "24px" }}>
                            {unsafeVT && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                            {safeVT && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                            {(suspiciousVT || unknownVT || inprogressVT) && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                                <div className="status-text">
                                {unsafeVT && <h3 className="status-title">{t('harmful')}</h3> }
                                {safeVT && <h3 className="status-title">{t('safe')}</h3> }
                                {suspiciousVT && <h3 className="status-title">{t('risky')}</h3> }
                                {unknownVT && <h3 className="status-title">{t('error')}</h3> }
                                {inprogressVT && <h3 className="status-title">{t('inProgress')}</h3> }
                                <p className="status-description">
                                    {resultVT}
                                </p>
                                </div>

                        </div>

                        <div className="security-status" style={{ marginTop: "24px" }}>
                            {unsafeUIO && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertCircle color="red" size={30} /></div> }
                            {safeUIO && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><CheckCircle color="green" size={30} /></div> }
                            {(suspiciousUIO || unknownUIO || inprogressUIO) && <div className="status-icon" style={{ backgroundColor: "var(--error)" }}><AlertTriangle color="#FF5F15" size={30} /></div> }
                                <div className="status-text">
                                {unsafeUIO && <h3 className="status-title">{t('harmful')}</h3> }
                                {safeUIO && <h3 className="status-title">{t('safe')}</h3> }
                                {suspiciousUIO && <h3 className="status-title">{t('risky')}</h3> }
                                {unknownUIO && <h3 className="status-title">{t('error')}</h3> }
                                {inprogressUIO && <h3 className="status-title">{t('inProgress')}</h3> }
                                <p className="status-description" dangerouslySetInnerHTML={{ __html: resultUIO }}></p>
                                </div>

                        </div>
                    </>
                    )}


                    <div style={{ paddingTop: "16px", display: "flex", justifyContent: "center" }}>
                        {loading && <div className="loading-spinner"></div>}
                    </div>

                    <div style={{ marginTop: "0.5rem", color: "#aaa", fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                        {debug}
                    </div>

                    <div>
                        {showURLScam && <URLScam scamURL={submittedUrl} />}
                    </div>

                </div>

                <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={handleClear}>
                    {t('clear')}
                    </button>
                    <button className="btn btn-primary" onClick={UrlChecker} disabled={!url || loading}>
                    {t('scanAgain')}
                    </button>
                </div>
            </div>
        </>
    );
}

export default URLStatus;
