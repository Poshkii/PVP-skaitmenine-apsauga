import {Upload, Link} from "lucide-react";
import { useReport } from "../report-page/ReportContext";
import React, {useEffect, useState} from "react";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {useNavigate} from "react-router";
import { Info } from 'lucide-react';

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
        const result = await browser.storage.local.get(["previousFileScanUrl"]);
        const url = result["previousFileScanUrl"];

        if (!url) {
            setPrevResult("Error: No file was scanned previously");
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

    const FileChecker = async () => {
        if (!selectedFile) return;
        setIsChecking(true);
        

        try {
            const results = await checkFileByHash(selectedFile);

            if (results) {
                setScanType("hash");
                processApiResponse(results);
                setIsChecking(false);
            } else {
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
            if (scanDetails) {
                const threats = extractAVThreats(data);
                setAvThreats(threats);
            }

            if (detectedCount > 0) {
                setSafety("unsafe");
                setResult(`Threats found: ${detectedCount} out of ${totalEngines} antivirus engines.`);
            } else {
                setSafety("safe");
                setResult(`Checked with ${totalEngines} antivirus engines. No threats were found.`);
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
                setResult(`Detected threats: ${detectedCount} from ${totalEngines} anti-virus engines.`);
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
        <>
            <div style={{
                maxHeight: "calc(100vh - 70px)",
                overflowY: "auto"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    marginTop: '1rem', 
                    marginBottom: "1rem",
                }}>
                    <h2 style={{ color: "white", margin: '0' }}>Check File Safety</h2>
                    
                    <div onClick={() => navigate("/file-data")} className="data-info"><Info/></div>
                </div>
                
                {/* Tab'ai testinei aplinkai */}
                <div style={{
                    display: "flex", 
                    justifyContent: "center", 
                    margin: "1rem auto",
                    width: "90%"
                }}>
                    <button 
                        onClick={() => setActiveTab("file")} 
                        style={{
                            backgroundColor: activeTab === "file" ? "#4b5563" : "#374151",
                            color: "white",
                            border: "none",
                            borderRadius: "8px 0 0 8px",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            width: "50%"
                        }}
                    >
                        New Scan
                    </button>
                    <button
                        onClick={() => {
                            viewPreviousScan();
                            setActiveTab("history");
                        }}
                        style={{
                            backgroundColor: activeTab === "history" ? "#4b5563" : "#374151",
                            color: "white",
                            border: "none",
                            borderRadius: "0 8px 8px 0",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            width: "50%"
                        }}
                    >
                        Last Auto Scan
                    </button>
                </div>
                

                {activeTab === "file" && (
                    <>
                        <div style={{margin: "1rem auto", width: "90%"}}>
                            <label
                                htmlFor="file-upload"
                                style={{
                                    display: "block",
                                    backgroundColor: "#374151",
                                    color: "white",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border: "2px dashed #6b7280"
                                }}
                                onDragOver={preventDefaults}
                                onDragEnter={preventDefaults}
                                onDragLeave={preventDefaults}
                                onDrop={dropZoneUpload}
                            >
                                <Upload/>
                                <div>Select or drag & drop file here</div>
                                {fileName && (
                                    <div style={{
                                        maxWidth: "90%",
                                        marginTop: "0.5rem",
                                        fontSize: "1rem",
                                        fontWeight: 'bold',
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        display: "inline-block"
                                    }}
                                        title={fileName}>

                                        Selected: <br></br> {fileName}
                                    </div>
                                )}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                onChange={fileUpload}
                                style={{display: "none"}}
                            />
                        </div>

                        <button
                            onClick={FileChecker}
                            disabled={!selectedFile || isChecking}
                            style={{
                                width: "60%",
                                height: "40px",
                                margin: "auto",
                                backgroundColor: !selectedFile || isChecking ? "#6b7280" : "#4b5563",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                outline: "none",
                                cursor: !selectedFile || isChecking ? "not-allowed" : "pointer"
                            }}
                        >
                            <div>
                                {isChecking ? "Checking..." : "Scan file"}
                                <br></br>
                            </div>
                        </button>
                        <br></br>
                        <div>
                            {isChecking && <div className="loader" style={{marginTop:'2rem'}}></div>}
                        </div>

                        {!isChecking && result && (
                            <div style={{margin: "1rem auto", width: "90%"}}>
                                <div style={{
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    backgroundColor: safety === "safe" ? "#065f46" : safety === "unsafe" ? "#7f1d1d" : "#374151",
                                    color: "white",
                                    marginBottom: "1rem"
                                }}>
                                    <div style={{fontWeight: "bold", marginBottom: "0.5rem"}}>Results: {
                                        safety === "safe" ? "File is safe" :
                                            safety === "unsafe" ? "File is unsafe" :
                                                ""
                                    }</div>
                                    <div>{result}</div>
                                    { params.time > 0 && (
                                        <div>Scan duration: { params.time / 1000 + ' s'}</div>
                                    )}
                                </div>

                                {(params.scan_results_all && Object.entries(avThreats).length > 0) && (
                                    <div style={{
                                        backgroundColor: "#374151",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        color: "white"
                                    }}>
                                        <h3 style={{marginBottom: "0.5rem", fontSize: "1rem", fontWeight: "bold"}}>Additional info:</h3>
                                        <div style={{display: "grid", gap: "0.5rem", textAlign: 'left'}}>
                                            {params.scan_results_all && (
                                                <div style={{padding: '1rem 0'}}>
                                                    <span style={{fontWeight: 'bold'}}>Overall AV verdict: </span>
                                                    <span>{params.scan_results_all}</span>
                                                </div>
                                            )}
                                            {Object.entries(avThreats).map(([key, value], index, array) => (
                                                <div key={key}>
                                                    <strong>{key}:</strong>
                                                    <br />
                                                    {typeof value === "string" ? value : JSON.stringify(value)}
                                                    {index < array.length - 1 && <hr style={{ border: "1px solidrgb(123, 127, 135)", margin: "0.5rem 0" }} />}
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
                    <>
                        <div style={{
                                        maxWidth: "90%",
                                        fontSize: "1rem",
                                        fontWeight: 'bold',
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        display: "inline-block",
                                        color:'white'
                                    }}
                        >
                            <h4 >Last checked file:</h4>
                            {prevParams.name.split(/[/\\]/).pop()}
                        </div>
                        {prevResult && (
                            <div style={{margin: "1rem auto", width: "90%"}}>
                                <div style={{
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    backgroundColor: prevSafety === "safe" ? "#065f46" : prevSafety === "unsafe" ? "#7f1d1d" : "#374151",
                                    color: "white",
                                    marginBottom: "1rem"
                                }}>
                                    <div style={{fontWeight: "bold", marginBottom: "0.5rem"}}>Results: {
                                        prevSafety === "safe" ? "File is safe" :
                                        prevSafety === "unsafe" ? "File is unsafe" :
                                                ""
                                    }</div>
                                    <div>{prevResult}</div>
                                    { prevParams.time > 0 && (
                                        <div>Scan duration: { prevParams.time / 1000 + ' s'}</div>
                                    )}
                                </div>

                                {(prevParams.scan_results_all && Object.entries(prevAvThreats).length > 0) && (
                                    <div style={{
                                        backgroundColor: "#374151",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        color: "white"
                                    }}>
                                        <h3 style={{marginBottom: "0.5rem", fontSize: "1rem", fontWeight: "bold"}}>Additional info:</h3>
                                        <div style={{display: "grid", gap: "0.5rem", textAlign: 'left'}}>
                                            {prevParams.scan_results_all && (
                                                <div style={{padding: '1rem 0'}}>
                                                    <span style={{fontWeight: 'bold'}}>Overall AV verdict: </span>
                                                    <span>{prevParams.scan_results_all}</span>
                                                </div>
                                            )}
                                            {Object.entries(prevAvThreats).map(([key, value], index, array) => (
                                                <div key={key}>
                                                    <strong>{key}:</strong>
                                                    <br />
                                                    {typeof value === "string" ? value : JSON.stringify(value)}
                                                    {index < array.length - 1 && <hr style={{ border: "1px solidrgb(123, 127, 135)", margin: "0.5rem 0" }} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                <br/>
            </div>
        </>
    );
}

export default FileStatus;