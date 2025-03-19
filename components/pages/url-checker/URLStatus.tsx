import { useState } from "react";
import URLScam from "./URLScam";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const [showURLScam, setShowURLScam] = useState(false);
    const [scamComponentKey, setScamComponentKey] = useState(0); // Unique key for re-mounting

    const API_KEY = String(useAppConfig().safeBrowsingApiKey);
    const API_URL = "https://www.virustotal.com/api/v3/urls";

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

    const UrlChecker = async () => {
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
            // REQUEST for analysis
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "x-apikey": API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `url=${encodeURIComponent(url)}`
            });
            // Klaidu apdorojimas
            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                const errorCode = response.status; // Get the HTTP error code
    
                let errorMessage = "❌ Klaida tikrinant URL.";
                switch (errorCode) {
                    case 400:
                        errorMessage = "❌ Neteisinga užklausa.";
                        break;
                    case 401:
                        errorMessage = "❌ Netinkamas API raktas.";
                        break;
                    case 403:
                        errorMessage = "❌ Nepakanka leidimų.";
                        break;
                    case 429:
                        errorMessage = "❌ API kvotų limitas viršytas.";
                        break;
                    case 500:
                        errorMessage = "❌ Serverio klaida. Bandykite vėliau.";
                        break;
                }
                setResult(errorMessage);
                setLoading(false);
                return;
            }
            // Jei viskas gerai, bandom gauti analize
            else{
                const data = await response.json();
                await pollResults(data.data.id);
            }
        } catch (error) {
            console.error("Klaida tikrinant URL:", error);
            setResult("❌ Klaida tikrinant URL.");
        } finally {
            setLoading(false);
            setShowURLScam(true);
        }
    };

    const pollResults = async (dataId : string) => {
        let attempts = 0;
        const maxAttempts = 10;

        const resultUrl = `https://www.virustotal.com/api/v3/analyses/${dataId}`;

        const checkResult = async() => {
            try {
                // GET analysis
                const resultResponse = await fetch(resultUrl, {
                method: "GET",
                headers: {
                    "x-apikey": API_KEY
                }
            });

            if(resultResponse.ok) {
                const resultData = await resultResponse.json();
                processResponse(resultData);
                return true;
            }

            return false;

            }
            catch (error){
                return false;
            }
        };

        while (attempts < maxAttempts) {
            const isComplete = await checkResult();
            if (isComplete) break;
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 6000)); // kas 5 sekundes poll'ina
        }
        
		// Jei daugiau nei 1 min uztrunka (per didele eile API turbut)
        if (attempts >= maxAttempts) {
            setResult("Patikrinimas užtruko per ilgai. Bandykite vėliau.");
        }
    }

    const processResponse = (resultData : any) => {
        const stats = resultData.data.attributes.stats;
        const totalDetections = stats.malicious + stats.suspicious;
        const totalVendors = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;

        if (totalVendors === 0) {
            setResult("⚠️ URL dar nebuvo analizuotas. Bandykite vėliau.");
            return;
        }
            
        if (totalDetections > 0) {
            if(stats.malicious >= 5)
                setResult(`🚨 Svetainė yra kenksminga! Aptikta ${totalDetections} grėsmingų įrašų iš ${totalVendors} tiekėjų.`);
            else
                setResult(`⚠️ Pavojinga svetainė! Aptikta ${totalDetections} grėsmingų įrašų iš ${totalVendors} tiekėjų.`);
        } else {
            setResult(`✅ Svetainė saugi. Neaptikta jokių grėsmių iš ${totalVendors} tiekėjo/-ų.`);
        }
    };

    return (
        <>
            <div style={{ marginTop: "1em" }}>
                <h2 style={{ color: "white" }}>Patikrinkite svetainės saugumą</h2>
                <input
                    type="text"
                    placeholder="Įveskite svetainės nuorodą..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ padding: "0.5rem", width: "90%" }}
                />
                <button 
                    onClick={UrlChecker}
                    disabled={!url || loading}
                    style={{ width: "200px", height: "40px", backgroundColor: "#4b5563", color: "white", border: "none", 
                        borderRadius: "8px", outline: "none", transition: "background-color 0.2s ease-in-out", 
                        marginTop: "0.5rem", cursor: !url || loading ? "not-allowed" : "pointer" }}
                >   
                    Tikrinti
                </button>
                <div style={{ marginTop: "0.5rem", fontWeight: "bold", color: "white", padding: "5px"}}>
                    {result}
                </div>
                <div style={{ paddingTop: "0.8rem"}}>
                    {loading && <div className="loader"></div>}
                </div>
                <div style={{ marginTop: "0.5rem", fontWeight: "bold", color: "white", padding: "5px"}}>
                    {debug}
                </div>
                <div>
                    {showURLScam && <URLScam key={scamComponentKey} scamURL={url ?? ''} />}
                </div>
            </div>
            <br />
        </>
    );
}

export default URLStatus;
