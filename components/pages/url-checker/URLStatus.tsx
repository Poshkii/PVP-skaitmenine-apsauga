import { useState } from "react";

function URLStatus({ inputURL }: { inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const API_KEY = useAppConfig().safeBrowsingApiKey;
    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

    const normalizeURL = (str: string) => {
        // If the URL is missing "http://" or "https://", add "https://"
        if (!/^https?:\/\//i.test(str)) {
            return "https://" + str;
        }
        return str;
    }

    const isValidURL = (str: string) => {
        try {
            new URL(str);
            if (!str.includes(".")) {
                return false;
            }
            return true;
        } catch (_) {
            return false;
        }
    }

    const UrlChecker = async () => {
        setResult("Tikrinama...");

        setLoading(true);

        let formattedUrl = normalizeURL(url);
        if (!isValidURL(formattedUrl)) {
            setLoading(false);
            setResult("❌ Įveskite tinkamą nuorodą.");
            return;
        }

        const requestBody = {
            client: {
                clientId: "1016620479265-v07ai9hm7toqd47d221nntccrg825vcr.apps.googleusercontent.com",  // Optional but useful for tracking
                clientVersion: "1.0"
            },
            threatInfo: {
                threatTypes: [
                    "MALWARE", 
                    "SOCIAL_ENGINEERING", 
                    "UNWANTED_SOFTWARE", 
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: formattedUrl }]
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log(data);

            if (data.matches) {
                setTimeout(() => {
                    setLoading(false);
                    setResult("⚠️ Pavojinga svetainė!");
                }, 2000); 
            } else {
                setTimeout(() => {
                    setLoading(false);
                    setResult("✅ Svetainė saugi.");
                }, 2000); 
            }
        } catch (error) {
            console.error("Klaida tikrinant URL:", error);
            setResult("❌ Klaida tikrinant URL.");
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
                    style={{ width: "200px", height: "40px", backgroundColor: "#4b5563", color: "white", border: "none", borderRadius: "8px", outline: "none", transition: "background-color 0.2s ease-in-out", marginTop: "0.5rem" }}
                >   
                    Tikrinti
                </button>
                <div style={{ marginTop: "0.5rem", fontWeight: "bold", color: "white" }}>
                    {result}
                </div>
                <div style={{ paddingTop: "0.8rem"}}>
                        {loading && <div className="loader"></div>}
                </div>
            </div>
            <br />
        </>
    );
}

export default URLStatus;
