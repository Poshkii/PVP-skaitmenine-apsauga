import { Upload, Info, Shield, AlertTriangle, Check } from "lucide-react"; 
import { useReport } from "../report-page/ReportContext";
import React, {useEffect, useState} from "react";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {useNavigate} from "react-router";

const API_URL = String(useAppConfig().metaDefenderApiUrl);
const HASH_ENDPOINT = "/hash";
const FILE_ENDPOINT = "/file";

async function calculateSHA256(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    throw new Error("Failed to read file");
                }

                const arrayBuffer = event.target.result as ArrayBuffer;
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

                // convert the hash to a hex string
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join('');

                resolve(hashHex);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error("Error reading file"));
        };

        reader.readAsArrayBuffer(file);
    });
};

async function checkFileByHash(file: File): Promise<any | null> {
    let sha256Hash: string;

    try {
        sha256Hash = await calculateSHA256(file);
    } catch (error) {
        console.error("Failed to calculate sha256:", error);
        sha256Hash = "";
    }

    if (sha256Hash) {
        try {
            const res = await fetch(`${API_URL}${HASH_ENDPOINT}/${sha256Hash}`, {
                method: "GET"
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (error) {
            console.error("Error while checking SHA-256 hash:", error);
        }
    }

    return null;
}

async function getScanResult(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            if (data.scan_results?.progress_percentage === 100 || data.final_verdict) {
                return data;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

function FileStatus({inputFile }: { inputFile: string }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState(inputFile || "");
    const [result, setResult] = useState("");
    const [prevResult, setPrevResult] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [hashError, setHashError] = useState(false);
    const [params, setParams] = useState({
        name: "",
        time: 0,
        scan_results_all: "",
    });
    const [prevParams, setPrevParams] = useState({
        name: "",
        time: 0,
        scan_results_all: "",
    });
    const [safety, setSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");
    const [prevSafety, setPrevSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");
    const [avThreats, setAvThreats] = useState ({});
    const [prevAvThreats, setPrevAvThreats] = useState ({});
    
    const [activeTab, setActiveTab] = useState<"file" | "history">("file");
    const { report, updateReport } = useReport();

    const [scanType, setScanType] = useState("");

    const { sendToModule } = useModuleMessaging();

    const viewPreviousScan = async () => {
        const prevResult = await browser.storage.local.get(["previousFileScanUrl"]);
        const url = prevResult["previousFileScanUrl"];

        if (!url) {
            setPrevResult("No file was scanned previously");
            setPrevSafety("unknown");
            return;
        }

        const data = await getScanResult(url);

        if (!data) {
            setPrevResult(`Error: Scan has not completed yet`);
            setPrevSafety("unknown");
            return;
        }

        processPreviousApiResponse(data);
    }

    const viewCurrentScan = async () => {
        const result = await browser.storage.local.get(["previousFileScanUrl"]);
        const url = result["previousFileScanUrl"];

        if (!url) {
            setResult("Error: No file was scanned previously");
            setSafety("unknown");
            return;
        }

        const data = await getScanResult(url);

        if (!data) {
            setResult(`Error: Scan has not completed yet`);
            setSafety("unknown");
            return;
        }

        processApiResponse(data);
    }

    useEffect(() => {
        const onMessage = (message: UiMessage) => {
            switch (message.id) {
                case UiMessageId.ScanFinished: {
                    setIsChecking(false);
                    viewCurrentScan();
                    break;
                }
            }
        };

        browser.runtime.onMessage.addListener(onMessage);

        return () => {
            browser.runtime.onMessage.removeListener(onMessage);
        };
    }, []);

    const setFileState = async (file: File) => {
        setSelectedFile(file);
        setFileName(file.name);
        setSafety("unknown");
        setResult("");
        setParams({
            name: "",
            time: 0,
            scan_results_all: "",
        });
        setAvThreats({});
    }

    // default reiksmes ikelus faila
    const fileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setFileState(file);
        }
    };

    // default reiksmes nutempus faila
    const dropZoneUpload = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const file = event.dataTransfer.files?.[0];

        if (file) {
            setFileState(file);
        }
    };

    // Situ reikia, kad tempiant failus nesuveiktu iprasti HTML event'ai
    const preventDefaults = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const FileUpload = async (selectedFile: File) => {
        setScanType("upload");
        // upload if checking by hash failed
        const formData = new FormData();
        formData.append('file', selectedFile);

        // ikelia faila skenavimui
        const uploadResponse = await fetch(API_URL + FILE_ENDPOINT, {
            method: 'POST',
            body: formData
        });

        // bando gaut rezultatus jei sekmingai ikelia
        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            const pollUrl = API_URL + FILE_ENDPOINT + '/' + uploadData.data_id;
            pollForResults(pollUrl);
            //processApiResponse(results);
        } else {
            const errorData = await uploadResponse.json();
            setResult(`Error: ${errorData.error?.messages || 'File check failed'}`);
            setSafety("unknown");
        }
    }

    const FileChecker = async () => {
        if (!selectedFile) return;
        setIsChecking(true);
        

        try {
            const results = await checkFileByHash(selectedFile);

            if (results) {
                setScanType("hash");
                processApiResponse(results);
                if (hashError){
                    FileUpload(selectedFile);
                    setHashError(false);
                }
                else
                    setIsChecking(false);
            } else {
                FileUpload(selectedFile);
            }
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : 'File check failed'}`);
            setSafety("unknown");
        }
    };

    const pollForResults = (url: string) => {
        browser.storage.local.set({["previousFileScanUrl"] : url});
        sendToModule(ModuleId.FileChecker, {id: ModuleMessageId.PollFileScan, data: {url: url}});
    }

    const processApiResponse = (data: any) => {
        const scanResults = data.scan_results;
        const scanDetails = data.scan_results.scan_details;
        
        if (scanResults) {
            updateReport("FileScans", report.FileScans + 1);
            // nzn ar cia reikia, bet atnaujina paskutinio skenavimo reiksme jei ir pagal hash'a tikrina
            const pollUrl = API_URL + FILE_ENDPOINT + '/' + data.data_id;
            browser.storage.local.set({["previousFileScanUrl"] : pollUrl});
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data.file_info) {
                setParams ({
                    name: data.file_info.display_name || "",
                    time: scanResults.total_time || 0,
                    scan_results_all: scanResults.scan_all_result_a || "",
                });
            }
            else {
                setHashError(true);
            }
            if (scanDetails) {
                const threats = extractAVThreats(data);
                setAvThreats(threats);
            }
            else {
                setHashError(true);
            }

            if (!hashError) {
                if (detectedCount > 0) {
                    setSafety("unsafe");
                    setResult(`Threats found: ${detectedCount} out of ${totalEngines} antivirus engines.`);
                } else {
                    setSafety("safe");
                    setResult(`Checked with ${totalEngines} antivirus engines. No threats were found.`);
                }
            }
        } else {
            setSafety("unknown");
            setResult("Failed to determine file safety.");
        }
    };

    const processPreviousApiResponse = (data: any) => {
        const scanResults = data.scan_results;
        const scanDetails = data.scan_results.scan_details;

        if (scanResults) {
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data.file_info) {
                setPrevParams ({
                    name: data.file_info.display_name || "",
                    time: scanResults.total_time || 0,
                    scan_results_all: scanResults.scan_all_result_a || "",
                });
            }
            if (scanDetails) {
                const threats = extractAVThreats(data);
                setPrevAvThreats(threats);
            }

            if (detectedCount > 0) {
                setPrevSafety("unsafe");
                setPrevResult(`Detected threats: ${detectedCount} from ${totalEngines} anti-virus engines.`);
            } else {
                setPrevSafety("safe");
                setPrevResult(`Checked with ${totalEngines} anti-virus engines. No threats found.`);
            }
        } else {
            setPrevSafety("unknown");
            setPrevResult("Couldn't determine file safety.");
        }
    };

    const extractAVThreats = (scanData: any): Record<string, string> => {
        if (!scanData || !scanData.scan_results || !scanData.scan_results.scan_details) {
            return {};
        }

        const scanDetails = scanData.scan_results.scan_details;
        const threats: Record<string, string> = {};

        for (const avName in scanDetails) {
            if (scanDetails[avName].threat_found) {
                threats[avName] = scanDetails[avName].threat_found;
            }
        }

        return threats;
    }

    useEffect(() => {
        if (inputFile) {
            setFileName(inputFile);
        }
    }, [inputFile]);

    const navigate = useNavigate();

    return (
        <div className="middle-menu">
            <h1 className="panel-title">
                File Safety Scanner <span onClick={() => navigate("/file-data")}><Info className="info-icon"/></span>
            </h1>
            
            <div>
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab("file")} 
                        className={`btn ${activeTab === "file" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        New Scan
                    </button>
                    <button
                        onClick={() => { viewPreviousScan(); setActiveTab("history"); }}
                        className={`btn ${activeTab === "history" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        Previous Scan
                    </button>
                </div>
        
            {activeTab === "file" && (
                <>
                <div className="security-check-container glassmorphism">
                    <label
                    className="file-upload-zone"
                    htmlFor="file-upload"
                    onDragOver={preventDefaults}
                    onDragEnter={preventDefaults}
                    onDragLeave={preventDefaults}
                    onDrop={dropZoneUpload}
                    >
                    <Upload size={40} color="var(--accent-primary)" />
                    <div className="status-text">
                        Select or drag & drop file to scan
                    </div>
                    {fileName && (
                        <div className="file-name-display" title={fileName}>
                        {fileName}
                        </div>
                    )}
                    </label>
                    <input
                    id="file-upload"
                    type="file"
                    onChange={fileUpload}
                    className="hidden-input"
                    />
                </div>
        
                <div className="action-buttons">
                    <button
                        style={{margin: "0 auto"}}
                        onClick={FileChecker}
                        disabled={!selectedFile || isChecking}
                        className={`btn btn-primary ${(!selectedFile || isChecking) ? 'disabled-button' : ''}`}>
                        {isChecking ? (
                            <div className="button-content">
                            <div className="loading-spinner"></div>
                            Analyzing file...
                            </div>
                        ) : (
                            <div className="button-content">
                            <Shield size={20} />
                            Scan File
                            </div>
                        )}
                    </button>
                </div>
        
                {!isChecking && result && (
                    <div style={{marginTop:"24px"}} className="security-check-container glassmorphism">
                    <div className="security-status">
                        <div className="status-icon">
                            {safety === "safe" ? (
                                <Check size={32}/>
                            ) : safety === "unsafe" ? (
                                <AlertTriangle size={32} style={{color:"var(--error)"}}/>
                            ) : (
                                <Info size={32} />
                            )}
                        </div>
                        <div className="status-text">
                            <h3 className="status-title">
                                {safety === "safe" 
                                ? "File is Safe" 
                                : safety === "unsafe" 
                                    ? "Threats Detected" 
                                    : "Scan Results"}
                            </h3>
                            <p className="status-description">{result}</p>
                            {params.time > 0 && (
                                <p className="status-description">
                                Scan completed in {(params.time / 1000).toFixed(2)} seconds
                                </p>
                            )}
                        </div>
                    </div>
        
                    {(params.scan_results_all && Object.entries(avThreats).length > 0) && (
                        <div style={{marginTop: "24px"}}>
                        <h3 className="recent-list-title">Threat Details</h3>
                        <div className="recent-items">
                            {Object.entries(avThreats).map(([engine, threat], index) => (
                            <div key={index} className="status-badge suspicious">
                                <div className="recent-item-text">
                                <div className="item-url">{engine}</div>
                                <div className="">
                                    {typeof threat === "string" ? threat : JSON.stringify(threat)}
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    </div>
                )}
                </>
            )}
        
            {activeTab === "history" && (
                <div className="security-check-container glassmorphism">
                <h3 className="recent-list-title">Last Checked File</h3>
        
                {prevResult ? (
                    <>
                    {prevParams.name && (
                        <div className="status-text">
                        File Name: <strong>{prevParams.name.split(/[/\\]/).pop()}</strong>
                        </div>
                    )}

                    <div className="security-status" style={{marginTop: "24px"}}>
                        <div className="status-icon">
                        {prevSafety === "safe" ? (
                            <Check size={32}/>
                        ) : prevSafety === "unsafe" ? (
                            <AlertTriangle size={32} style={{color:"var(--error)"}}/>
                        ) : (
                            <Info size={32} />
                        )}
                        </div>
                        <div className="status-text">
                            <h3 className="status-title">
                                {prevSafety === "safe" 
                                ? "File is Safe" 
                                : prevSafety === "unsafe" 
                                    ? "Threats Detected" 
                                    : "Scan Results"}
                            </h3>
                            <p className="status-description">{prevResult}</p>
                            {prevParams.time > 0 && (
                                <p className="status-description">
                                Scan completed in {(prevParams.time / 1000).toFixed(2)} seconds
                                </p>
                            )}
                        </div>
                    </div>
        
                    {(prevParams.scan_results_all && Object.entries(prevAvThreats).length > 0) && (
                        <div style={{marginTop: "24px"}}>
                            <h3 className="recent-list-title">Threat Details</h3>
                            <div className="recent-items">
                                {Object.entries(prevAvThreats).map(([engine, threat], index) => (
                                <div key={index} className="status-badge suspicious">
                                    <div className="recent-item-text">
                                    <div className="item-url">{engine}</div>
                                    <div className="">
                                        {typeof threat === "string" ? threat : JSON.stringify(threat)}
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </>
                ) : (
                    <div style={{marginTop: "16px", color: "var(--text-muted)"}}>
                        No previous scan records found
                    </div>
                )}
                </div>
            )}
            </div>
        </div>
      );
}

export default FileStatus;