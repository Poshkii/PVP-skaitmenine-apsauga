import {Upload} from "lucide-react";
import {useEffect, useState} from "react";

const API_KEY = String(useAppConfig().fileCheckerApiKey);
const API_URL = "https://api.metadefender.com/v4";
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
        console.error("Failed to calculate hash:", error);
        return null;
    }

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
        console.error("Error while getting file scan results by hash:", error);
    }

    return null;
}

function FileStatus({inputFile}: { inputFile: string }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState(inputFile || "");
    const [result, setResult] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [hashValues, setHashValues] = useState({
        md5: "",
        sha1: "",
        sha256: ""
    });
    const [safety, setSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");

    const setFileState = async (file: File) => {
        setSelectedFile(file);
        setFileName(file.name);
        setSafety("unknown");
        setResult("");
        setHashValues({
            md5: "",
            sha1: "",
            sha256: ""
        });
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
        setResult("Skaičiuojama...");

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
                    await pollForResults(uploadData.data_id);
                } else {
                    const errorData = await uploadResponse.json();
                    setResult(`Klaida: ${errorData.error?.messages || 'Nepavyko patikrinti failo'}`);
                    setSafety("unknown");
                }
            }
        } catch (error) {
            setResult(`Klaida: ${error instanceof Error ? error.message : 'Nepavyko patikrinti failo'}`);
            setSafety("unknown");
        } finally {
            setIsChecking(false);
        }
    };

    const pollForResults = async (dataId: string) => {
        // 12 bandymu po 5 sekundes => 1 minute gauti skenavimo rezultatui
        let attempts = 0;
        const maxAttempts = 12;

        const DATA_URL = API_URL + FILE_ENDPOINT + '/' + dataId;

        const checkResult = async () => {
            try {
                // tikrina failo skenavimo rezultatus pagal anksciau gauta failo id
                const response = await fetch(DATA_URL, {
                    method: 'GET',
                    headers: {
                        'apikey': API_KEY,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // progress_percantage yra API dokumentacijoj, bet nezinau kaip patikrinti/istestuoti ar grazina kazka kito nei 0 arba 100
                    if (data.scan_results?.progress_percentage === 100) {
                        processApiResponse(data);
                        return true;
                    }

                    setResult(`Tikrinama... ${data.scan_results?.progress_percentage}%`);
                }

                return false;
            } catch (error) {
                return false;
            }
        };

        // Periodiskai siuncia uzklausa patikrinti ar gautas skenavimo rezultatas
        while (attempts < maxAttempts) {
            const isComplete = await checkResult();
            if (isComplete) break;

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // kas 5 sekundes poll'ina
        }

        // Jei daugiau nei 1 min uztrunka (per didele eile API turbut)
        if (attempts >= maxAttempts) {
            setResult("Patikrinimas užtruko per ilgai. Bandykite vėliau.");
            setSafety("unknown");
        }
    }

    const processApiResponse = (data: any) => {
        const scanResults = data.scan_results;

        if (scanResults) {
            // skenavimo "varikliu" kiekis gaunamas
            const detectedCount = scanResults.total_detected_avs || 0;
            const totalEngines = scanResults.total_avs || 1;

            if (data.file_info) {
                setHashValues({
                    md5: data.file_info.md5 || "",
                    sha1: data.file_info.sha1 || "",
                    sha256: data.file_info.sha256 || ""
                });
            }

            // esant poreikiui butu galima prideti arba pakeisti su
            // severity_index, severity, threatLevel ir verdict API parametrais
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

    useEffect(() => {
        if (inputFile) {
            setFileName(inputFile);
        }
    }, [inputFile]);

    return (
        <>
            <div style={{
                flexDirection: "column",
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto"
            }}
            >
                <h2 style={{color: "white", margin: "1rem auto 0 auto"}}>Patikrinkite failo saugumą</h2>
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
                    {isChecking ? "Tikrinama..." : "Tikrinti failo saugumą"}
                </button>

                {result && (
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
                        </div>

                        {(hashValues.md5 || hashValues.sha1 || hashValues.sha256) && (
                            <div style={{
                                backgroundColor: "#374151",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                color: "white"
                            }}>
                                <h3 style={{marginBottom: "0.5rem", fontSize: "1rem"}}>Maišos reikšmės:</h3>
                                <div style={{display: "grid", gap: "0.5rem", textAlign: 'left'}}>
                                    {hashValues.md5 && (
                                        <div>
                                            <span style={{fontWeight: "bold"}}>MD5:</span>
                                            <span style={{
                                                display: "block",
                                                wordBreak: "break-all",
                                                overflowWrap: "break-word"
                                            }}>
											{hashValues.md5}
										</span>
                                        </div>
                                    )}
                                    {hashValues.sha1 && (
                                        <div>
                                            <span style={{fontWeight: "bold"}}>SHA-1:</span>
                                            <span style={{
                                                display: "block",
                                                wordBreak: "break-all",
                                                overflowWrap: "break-word"
                                            }}>
											{hashValues.sha1}
										</span>
                                        </div>
                                    )}
                                    {hashValues.sha256 && (
                                        <div>
                                            <span style={{fontWeight: "bold"}}>SHA-256:</span>
                                            <span style={{
                                                display: "block",
                                                wordBreak: "break-all",
                                                overflowWrap: "break-word"
                                            }}>
											{hashValues.sha256}
										</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <br/>
            </div>
        </>
    );
}


export default FileStatus;