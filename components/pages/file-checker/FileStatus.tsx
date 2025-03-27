import {Upload} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {ModuleMessageId} from "@/entrypoints/content/types/module-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";

const API_KEY = String(useAppConfig().fileCheckerApiKey);
const API_URL = "https://api.metadefender.com/v4";
const HASH_ENDPOINT = "/hash";
const FILE_ENDPOINT = "/file";
const URL_ENDPOINT = "/sandbox";

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
                method: "GET",
                headers: {
                    'apikey': API_KEY,
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

async function sendFileUrlToSandbox(url: string): Promise<string> {
    try {
        const submitResponse = await fetch("https://api.metadefender.com/v4/sandbox", {
            method: "POST",
            headers: {
                "apikey": API_KEY,
                "Content-Type": "application/json"  
            },
            body: JSON.stringify({ url: url }) 
        });
        
        if (!submitResponse.ok) {
            const errorData = await submitResponse.json();
            throw new Error(errorData.error?.messages || 'Failed to submit URL for scanning');
            
        }
        
        const submitData = await submitResponse.json();
        const dataId = submitData.sandbox_id;
        
        // return url for polling
        return API_URL + URL_ENDPOINT + '/' + dataId;
    } catch (error) {
        console.error("Error checking URL:", error);
        throw error;
    }
}

async function getScanResult(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': API_KEY,
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
    const [isChecking, setIsChecking] = useState(false);
    const [params, setParams] = useState({
        time: 0,
        scan_results_all: "",
    });
    const [safety, setSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");
    const [avThreats, setAvThreats] = useState ({});
    
    const [urlToCheck, setUrlToCheck] = useState("");
    const [isCheckingUrl, setIsCheckingUrl] = useState(false);
    const [urlResult, setUrlResult] = useState("");
    const [urlSafety, setUrlSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");
    const [activeTab, setActiveTab] = useState<"file" | "url">("file");

    const { sendToModule } = useModuleMessaging();

    const viewPreviousScan = async () => {
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

        if (url.includes(URL_ENDPOINT)){
            setActiveTab("url");
            processUrlApiResponse(data);
        }
        else if (url.includes(FILE_ENDPOINT)) {
            processApiResponse(data);
        }
    }

    useEffect(() => {
        const onMessage = (message: UiMessage) => {
            switch (message.id) {
                case UiMessageId.ScanFinished: {
                    setIsCheckingUrl(false);
                    setIsChecking(false);
                    viewPreviousScan();
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
                processApiResponse(results);
            } else {
                // upload if checking by hash failed
                const formData = new FormData();
                formData.append('file', selectedFile);

                // ikelia faila skenavimui
                const uploadResponse = await fetch(API_URL + FILE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'apikey': API_KEY
                    },
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
                    setResult(`Klaida: ${errorData.error?.messages || 'Nepavyko patikrinti failo'}`);
                    setSafety("unknown");
                }
            }
        } catch (error) {
            setResult(`Klaida: ${error instanceof Error ? error.message : 'Nepavyko patikrinti failo'}`);
            setSafety("unknown");
        }
    };

    const UrlChecker = async () => {
        if (!urlToCheck) return;
        
        setIsCheckingUrl(true);
        setUrlSafety("unknown");
        setUrlResult("");
        
        try {
            const pollUrl = await sendFileUrlToSandbox(urlToCheck);
            pollForResults(pollUrl);
            //processUrlApiResponse(results);
        } catch (error) {
            setUrlResult(`Klaida: ${error instanceof Error ? error.message : 'Nepavyko patikrinti failo'}`);
            setUrlSafety("unknown");
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
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data.file_info) {
                setParams ({
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
                setResult(`Aptikta grėsmių: ${detectedCount} iš ${totalEngines} saugos variklių.`);
            } else {
                setSafety("safe");
                setResult(`Patikrinta su ${totalEngines} saugos varikliais. Grėsmių nerasta.`);
            }
        } else {
            setSafety("unknown");
            setResult("Nepavyko nustatyti failo saugumo.");
        }
    };

    const processUrlApiResponse = (data: any) => {
        const scanResults = data.final_verdict;
        
        if (scanResults) {
            if (scanResults.threatLevel > 0 && scanResults.verdict === "MALICIOUS") {
                setUrlSafety("unsafe");
                setUrlResult(`Verdiktas: ${scanResults.verdict} \n 
                             Grėsmės lygis: ${scanResults.threatLevel} \n 
                             Pasitikėjimas: ${scanResults.confidence} \n`);
            } else {
                setUrlSafety("safe");
                //setUrlResult(`URL patikrintas. Grėsmių nerasta.`);
                setUrlResult(`Verdiktas: ${scanResults.verdict} \n 
                    Grėsmės lygis: ${scanResults.threatLevel} \n 
                    Pasitikėjimas: ${scanResults.confidence} \n`);
            }
        } else {
            setUrlSafety("unknown");
            setUrlResult("Nepavyko nustatyti failo saugumo.");
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

    return (
        <>
            <div style={{
                maxHeight: "calc(100vh - 70px)",
                overflowY: "auto"
            }}>
                <h2 style={{color: "white", margin: "1rem auto 0 auto"}}>Patikrinkite saugumą</h2>
                
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
                        Failas
                    </button>
                    <button 
                        onClick={() => setActiveTab("url")} 
                        style={{
                            backgroundColor: activeTab === "url" ? "#4b5563" : "#374151",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            width: "50%"
                        }}
                    >
                        Failas <br></br> (be download)
                    </button>
                    <button
                        onClick={viewPreviousScan}
                        style={{
                            backgroundColor: "#374151",
                            color: "white",
                            border: "none",
                            borderRadius: "0 8px 8px 0",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            width: "50%"
                        }}
                    >
                        Previous Scan
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
                                <div>Pasirinkite arba nutempkite failą čia</div>
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

                                        Pasirinktas: <br></br> {fileName}
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
                                {isChecking ? "Tikrinama..." : "Tikrinti failo saugumą"}
                            </div>
                        </button>
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
                                    <div style={{fontWeight: "bold", marginBottom: "0.5rem"}}>Rezultatas: {
                                        safety === "safe" ? "Failas saugus" :
                                            safety === "unsafe" ? "Failas nesaugus" :
                                                ""
                                    }</div>
                                    <div>{result}</div>
                                    { params.time > 0 && (
                                        <div>Skenavimas užtruko { params.time / 1000 + ' s'}</div>
                                    )}
                                </div>

                                {(params.scan_results_all && Object.entries(avThreats).length > 0) && (
                                    <div style={{
                                        backgroundColor: "#374151",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        color: "white"
                                    }}>
                                        <h3 style={{marginBottom: "0.5rem", fontSize: "1rem", fontWeight: "bold"}}>Papildoma informacija:</h3>
                                        <div style={{display: "grid", gap: "0.5rem", textAlign: 'left'}}>
                                            {params.scan_results_all && (
                                                <div style={{padding: '1rem 0'}}>
                                                    <span style={{fontWeight: 'bold'}}>Bendras antivirusinių verdiktas: </span>
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
                

                {activeTab === "url" && (
                    <>
                        <div style={{margin: "1rem auto", width: "90%"}}>
                        <div style={{marginBottom: "1rem", color: "white"}}>Įveskite failo URL adresą patikrinimui</div>
                                <input
                                    type="text"
                                    value={urlToCheck}
                                    onChange={(e) => setUrlToCheck(e.target.value)}
                                    placeholder="https://example.com"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "4px",
                                        border: "1px solid #6b7280",
                                        backgroundColor: "#1f2937",
                                        color: "white",
                                        outline: "none"
                                    }}
                                />
                        </div>
                        
                        <button
                            onClick={UrlChecker}
                            disabled={!urlToCheck || isCheckingUrl}
                            style={{
                                width: "60%",
                                height: "40px",
                                margin: "auto",
                                backgroundColor: !urlToCheck || isCheckingUrl ? "#6b7280" : "#4b5563",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                outline: "none",
                                cursor: !urlToCheck || isCheckingUrl ? "not-allowed" : "pointer"
                            }}
                        >
                            <div>
                                {isCheckingUrl ? "Tikrinama..." : "Tikrinti failo saugumą"}
                            </div>
                        </button>
                        <div>
                            {isCheckingUrl && <div className="loader" style={{marginTop:'2rem'}}></div>}
                        </div>
                        
                        {!isCheckingUrl && urlResult && (
                            <div style={{margin: "1rem auto", width: "90%"}}>
                                <div style={{
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    backgroundColor: urlSafety === "safe" ? "#065f46" : urlSafety === "unsafe" ? "#7f1d1d" : "#374151",
                                    color: "white",
                                    marginBottom: "1rem"
                                }}>
                                    <div style={{fontWeight: "bold", marginBottom: "0.5rem"}}>Rezultatas: {
                                        urlSafety === "safe" ? "Failas saugus" :
                                            urlSafety === "unsafe" ? "Failas nesaugus" :
                                                ""
                                    }</div>
                                    <div>{urlResult}</div>
                                </div>
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