import { useState, useEffect } from "react";
import Papa from "papaparse";
import scamList from "./crypto_scam_data.csv?url";
import { CircleX, CircleAlert , CircleCheckBig  } from 'lucide-react';
import { useTranslation } from "react-i18next";

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
    const [safe, setSafe] = useState(false);
    const [unsafe, setUnsafe] = useState(false);
    const [unknown, setUnknown] = useState(false);
    const { t } = useTranslation('urls');
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
                setUnknown(true);
                setResult(t('scamError'));
            }
        };

        loadScamData();
    }, []);

    const checkScamStatus = async () => {
        if (!url) return;
        
        setLoading(true);
        //setResult("🔍 Checking against scam database...");
        let formattedUrl = normalizeURL(url);

        if (!isValidURL(formattedUrl)) {
            setUnknown(true);
            setResult(t('invalidUrl'));
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
                setResult(t('alert', {form: formattedUrl, match: match[1]}));
                //setResult(`Alert! ${formattedUrl} appears to be a ${match[1]}.`);
                setUnsafe(true);
            } else {
                setResult(t('no', {url: url}));
                //setResult(`No crypto scam reports found for ${url}.`);
                setSafe(true);
            }
        } catch (error) {
            console.error("Error checking scam status:", error);
            setUnknown(true);
            setResult(t('scamError'));
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
            <div className="security-status" style={{ marginTop: "24px" }}>
                {unsafe && <div className="status-icon status-error"><CircleX color="white" size={30} /></div> }
                {safe && <div className="status-icon status-success"><CircleCheckBig  color="white" size={30} /></div> }
                {unknown && <div className="status-icon status-warning"><CircleAlert color="white" size={30} /></div> }
                    <div className="status-text">
                    {unsafe && <h3 className="status-title">{t('warning')}</h3> }
                    {safe && <h3 className="status-title">{t('safe')}</h3> }
                    {unknown && <h3 className="status-title">{t('error')}</h3> }
                    <p className="status-description">
                        {result}
                    </p>
                    </div>

            </div>
        </>
    );
}

export default URLScam;