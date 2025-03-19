
import EmailBreachDetails from "@/components/pages/email-checker/EmailBreachData.tsx";
import EmailBreachData from "@/components/pages/email-checker/EmailBreachData.tsx";
import { data } from "react-router";

function EmailStatus({ inputEmail, switchPage }: { inputEmail: string; switchPage: () => void }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [breachData, setBreachData] = useState<any | null>(null); // Stores full API response

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const EmailCheck = async () => {
        if (!email.match(emailPattern)) {
            setResult("Neteisingas el. pašto formatas");
            return;
        }

        setResult("🔍 Ieškoma...");
        setLoading(true);
        setBreachData(null); // Clear previous data before a new search

        try {
            const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`);
            const data = await response.json();

            console.log("API response: ", response)
            console.log("API data: ", data)

            if (response.status === 200 && data.BreachesSummary.site) {
                setResult(`⚠️ Rasti ${data.ExposedBreaches.breaches_details.length} nutekėjimai!`);
                setBreachData(data);
            } else {
                setResult("✅ El. paštas saugus!");
                setBreachData(null);
            }
        } catch (error) {
            console.error("API klaida:", error);
            setResult("❌ Klaida tikrinant el. paštą");
        }

        setLoading(false);
    };

    return (
        <div style={{ marginTop: "1em", marginBottom: "4rem", textAlign: "center" }}>
            <h2 style={{ color: "white" }}>Patikrinkite, ar jūsų el. paštas buvo nutekintas</h2>
            
            <input
                type="text"
                placeholder="Įveskite el. pašto adresą"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "0.5rem", width: "90%", marginBottom: "0.5rem" }}
            />
            
            <button
                onClick={EmailCheck}
                disabled={!email.match(emailPattern)}
                style={{
                    width: "200px",
                    height: "40px",
                    backgroundColor: email.match(emailPattern) ? "#4b5563" : "#212121",
                    color: email.match(emailPattern) ? "white" : "#5b5a5b",
                    border: "none",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "background-color 0.2s ease-in-out",
                    marginBottom: "1rem",
                    cursor: email.match(emailPattern) ? "pointer" : "not-allowed"
                }}
            >
                🔍 Tikrinti
            </button>

            <div style={{ padding: "1rem"}}>
                {loading && <div className="loader"></div>}
            </div>

            {/* Display result status */}
            <h3 style={{ color: breachData ? "red" : "green" }}>{result}</h3>

            {/* Show EmailBreachDetails if breaches are found */}
            {breachData && <EmailBreachDetails data={breachData} />}
        </div>
    );
}

export default EmailStatus;
