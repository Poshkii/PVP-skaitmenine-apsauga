import { Upload, Info, Shield, AlertTriangle, Check } from "lucide-react"; 
import { useReport } from "../report-page/ReportContext";
import React, {useEffect, useState} from "react";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {useNavigate} from "react-router";
import { useTranslation } from "react-i18next";
import {getAuthHeader} from "@/utils/client.ts";

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
            reject(new Error("Failed to read file"));
        };

        reader.readAsArrayBuffer(file);
    });
}

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
                method: "GET",
                headers: {
                    ...await getAuthHeader()
                }
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
                'Content-Type': 'application/json',
                ...await getAuthHeader()
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
    const { t } = useTranslation('files');
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
    const [showResults, setShowResults] = useState(false);

    const [scanType, setScanType] = useState("");

    const { sendToModule } = useModuleMessaging();

    const { addScannedFile } = useReport();

    const resetFileUpload = () => {
        setSelectedFile(null);
        setFileName(inputFile || "");
        setShowResults(false);
        setSafety("unknown");
        setResult("");
        setParams({
            name: "",
            time: 0,
            scan_results_all: "",
        });
        setAvThreats({});
    };

    const viewPreviousScan = async () => {
        const prevResult = await browser.storage.local.get(["previousFileScanUrl"]);
        const url = prevResult["previousFileScanUrl"];

        if (!url) {
            setPrevResult(t('noPrevScan'));
            setPrevSafety("unknown");
            return;
        }

        const data = await getScanResult(url);

        if (!data) {
            setPrevResult(t('notCompleted'));
            setPrevSafety("unknown");
            return;
        }

        processPreviousApiResponse(data);
    }

    const viewCurrentScan = async () => {
        const result = await browser.storage.local.get(["previousFileScanUrl"]);
        const url = result["previousFileScanUrl"];

        if (!url) {
            setResult(t('noPrevScan'));
            setSafety("unknown");
            return;
        }

        const data = await getScanResult(url);

        if (!data) {
            setResult(t('notCompleted'));
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
            body: formData,
            headers: {
                ...await getAuthHeader()
            }
        });

        // bando gaut rezultatus jei sekmingai ikelia
        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            const pollUrl = API_URL + FILE_ENDPOINT + '/' + uploadData.data_id;
            pollForResults(pollUrl);
        } else {
            const errorData = await uploadResponse.json();
            setResult(t('errorCheck'));
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
                else {
                    setIsChecking(false);
                    setShowResults(true);
                }
            } else {
                FileUpload(selectedFile);
            }
        } catch (error) {
            setResult(t('errorCheck'));
            setSafety("unknown");
            setIsChecking(false);
        }
    };

    const pollForResults = (url: string) => {
        browser.storage.local.set({["previousFileScanUrl"] : url});
        sendToModule(ModuleId.FileChecker, {id: ModuleMessageId.PollFileScan, data: {url: url}});
    }

    const processApiResponse = (data: any) => {
        const scanResults = data?.scan_results;
        const scanDetails = data?.scan_results?.scan_details;
        
        if (scanResults) {
            updateReport("FileScans", report.FileScans + 1);
            // nzn ar cia reikia, bet atnaujina paskutinio skenavimo reiksme jei ir pagal hash'a tikrina
            const pollUrl = API_URL + FILE_ENDPOINT + '/' + data.data_id;
            browser.storage.local.set({["previousFileScanUrl"] : pollUrl});
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data?.file_info) {
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
                    setResult(t('threats', {detected: detectedCount, total: totalEngines}));
                    addScannedFile(fileName, "unsafe");
                } else {
                    setSafety("safe");
                    setResult(t('noThreats', {total: totalEngines}));
                    addScannedFile(fileName, "safe");
                }
                setShowResults(true);
            }
        } else {
            setSafety("unknown");
            setResult(t('failSafety'));
        }
    };

    const processPreviousApiResponse = (data: any) => {
        const scanResults = data?.scan_results;
        const scanDetails = data?.scan_results?.scan_details;

        if (scanResults) {
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data?.file_info) {
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
                setPrevResult(t('threats', {detected: detectedCount, total: totalEngines}));
            } else {
                setPrevSafety("safe");
                setPrevResult(t('noThreats', {total: totalEngines}));
            }
        } else {
            setPrevSafety("unknown");
            setPrevResult(t('failSafety'));
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
                {t('pageName')} <span onClick={() => navigate("/file-data")}><Info className="info-icon"/></span>
            </h1>
            
            <div>
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab("file")} 
                        className={`btn ${activeTab === "file" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        {t('newScan')}
                    </button>
                    <button
                        onClick={() => { viewPreviousScan(); setActiveTab("history"); }}
                        className={`btn ${activeTab === "history" ? "btn-primary" : "btn-secondary"} tab-button`}>
                        {t('prevScan')}
                    </button>
                </div>
        
            {activeTab === "file" && (
                <>
                {!showResults ? (
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
                            {t('select')}
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
                                    {t('analyzing')}
                                </div>
                            ) : (
                                <div className="button-content">
                                <Shield size={20} />
                                    {t('scan')}
                                </div>
                            )}
                        </button>
                    </div>
                    </>
                ) : (
                    <div className="security-check-container glassmorphism">
                        <h3 className="recent-list-title">{t('newChecked')}</h3>
                        <div>
                            <div className="status-text overflow-text" style={{maxWidth:"95%"}}>
                                {t('fileName')} <span ><strong>{params.name.split(/[/\\]/).pop()}</strong></span>
                            </div>
                        </div>
                        <div className="security-status" style={{marginTop: "24px"}}>
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
                                    ? t('safe')
                                    : safety === "unsafe" 
                                        ? t('detected')
                                        : t('results')}
                                </h3>
                                <p className="status-description">{result}</p>
                                {params.time > 0 && (
                                    <p className="status-description">
                                    {t('completedTime', {seconds: (params.time / 1000).toFixed(2)})}
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
                        
                        <div className="action-buttons" style={{marginTop: "24px"}}>
                            <button
                                style={{margin: "0 auto"}}
                                onClick={resetFileUpload}
                                className="btn btn-primary">
                                <div className="button-content">
                                    <Upload size={20} />
                                    {t('newScan')}
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                </>
            )}
        
            {activeTab === "history" && (
                <div className="security-check-container glassmorphism">
                    <h3 className="recent-list-title">{t('lastChecked')}</h3>
            
                    {prevResult ? (
                        <>
                        {prevParams.name && (
                            <div>
                                <div className="status-text overflow-text" style={{maxWidth:"95%"}}>
                                    {t('fileName')} <span ><strong>{prevParams.name.split(/[/\\]/).pop()}</strong></span>
                                </div>
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
                                    ? t('safe')
                                    : prevSafety === "unsafe" 
                                        ? t('detected')
                                        : t('results')}
                                </h3>
                                <p className="status-description">{prevResult}</p>
                                {prevParams.time > 0 && (
                                    <p className="status-description">
                                    {t('completedTime', {seconds: (prevParams.time / 1000).toFixed(2)})}
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
                            {t('noScans')}
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
      );
}

export default FileStatus;