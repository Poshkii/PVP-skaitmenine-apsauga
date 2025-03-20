import { useState, useEffect } from "react";
import Papa from "papaparse";
import scamList from "./crypto_scam_data.csv?url";

// Define types for PapaParse results
interface ParseResult {
  data: string[][];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

function URLScam({ scamURL }: { scamURL: string }) {
    const [url, setUrl] = useState(scamURL);
    const [result, setResult] = useState("Waiting for input...");
    const [loading, setLoading] = useState(false);
    const [scamData, setScamData] = useState<Array<[string, string]>>([]);

    // Path to your CSV file
    const CSV_FILE_PATH = scamList;

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

    // Load CSV data
    useEffect(() => {
        const loadScamData = async () => {
            try {
                const response = await fetch(CSV_FILE_PATH);
                const csvText = await response.text();
                
                Papa.parse(csvText, {
                    complete: (results: ParseResult) => {
                        // Convert data to array of [url, scamType] tuples, ensuring each row has exactly 2 elements
                        const data: [string, string][] = results.data
                            .filter((row: string[]) => row.length >= 2) // Ensure at least two elements
                            .map((row: string[]) => [
                                String(row[0]).toLowerCase(), // URL (lowercase)
                                String(row[1]) // Scam type
                            ]);
                        setScamData(data);
                    }
                });
            } catch (error) {
                console.error("Error loading CSV data:", error);
                setResult("❌ Error loading scam database.");
            }
        };

        loadScamData();
    }, []);

    const checkScamStatus = async () => {
        if (!url) return;
        
        setLoading(true);
        setResult("🔍 Checking against scam database...");
        let formattedUrl = normalizeURL(url);

        if (!isValidURL(formattedUrl)) {
            setResult("❌ Invalid URL format.");
            setLoading(false);
            return;
        }

        try {
            const normalizedUrl = formattedUrl.toLowerCase();
            
            // Check if the URL exists in the scam data
            const match = scamData.find(([scamUrl, _]) => 
                normalizedUrl.includes(scamUrl) || scamUrl.includes(normalizedUrl)
            );
            
            if (match) {
                setResult(`🚨 Alert! ${formattedUrl} appears to be a ${match[1]}.`);
            } else {
                setResult(`✅ No scam reports found for ${formattedUrl}.`);
            }
        } catch (error) {
            console.error("Error checking scam status:", error);
            setResult("❌ Error checking scam database.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (scamURL && scamData.length > 0) {
            setUrl(scamURL);
            checkScamStatus();
        }
    }, [scamURL, scamData]);

    return (
        <>
            <div style={{ marginTop: "0.5rem", fontWeight: "bold", color: "white", padding: "5px"}}>
                {result}
            </div>
            {loading && (
                <div style={{ paddingTop: "0.8rem"}}>
                    <div className="loader"></div>
                </div>
            )}
        </>
    );
}

export default URLScam;