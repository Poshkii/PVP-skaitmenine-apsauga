
import EmailBreachDetails from "@/components/pages/email-checker/EmailBreachData.tsx";
import EmailBreachData from "@/components/pages/email-checker/EmailBreachData.tsx";
import { FormEvent } from "react";
import { data } from "react-router";

function EmailStatus({ inputEmail, switchPage }: { inputEmail: string; switchPage: () => void }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [breachData, setBreachData] = useState<any | null>(null); // Stores full API response

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const EmailCheck = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.match(emailPattern)) {
            setResult("Wrong email format");
            return;
        }

        setResult("🔍 Searching...");
        setLoading(true);
        setBreachData(null); // Clear previous data before a new search

        try {
            const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`);
            const data = await response.json();

            console.log("API response: ", response)
            console.log("API data: ", data)

            if (response.status === 200 && data.BreachesSummary.site) {
                setResult(`⚠️ Found ${data.ExposedBreaches.breaches_details.length} breaches!`);
                setBreachData(data);
            } else {
                setResult("✅ Email is safe!");
                setBreachData(null);
            }
        } catch (error) {
            console.error("API klaida:", error);
            setResult("❌ Error");
        }

        setLoading(false);
    };

    return (
        <div style={{ marginTop: "1em", marginBottom: "4rem", textAlign: "center" }}>
            <h2 style={{ color: "white" }}>Check if your email was leaked</h2>
            
            <form onSubmit={EmailCheck}>
                <input
                    type="text"
                    placeholder="Enter your email address"
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
                        cursor: email.match(emailPattern) ? "pointer" : "not-allowed"
                    }}
                >
                    🔍 Check
                </button>
            </form>

            <div style={{ padding: "1rem"}}>
                {loading && <div className="loader"></div>}
            </div>

            {/* Display result status */}
            <h3 style={{ color: breachData ? "red" : "green" }}>{result}</h3>

            {
            //Tips button
            breachData && (
                <button
                        onClick={switchPage}
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#4b5563",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        What do I do?
                    </button>
            )
            }
            {/* Show EmailBreachDetails if breaches are found */}
            {breachData && <EmailBreachDetails data={breachData} />}
        </div>
    );
}

export default EmailStatus;
