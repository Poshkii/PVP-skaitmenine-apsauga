
function EmailStatus({ inputEmail, switchPage }: { inputEmail: string; switchPage: () => void }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [breachDetails, setBreachDetails] = useState<{ sources: any[], fields: string[] }>({ sources: [], fields: [] });

    const getResultColor = () => {
        if (breachDetails.sources.length === 0) return { color: "green"}; 
        if (breachDetails.sources.length <= 3) return { color: "orange"}; 
        return { color: "red"}; 
    };

    const EmailCheck = async () => {

        if (!email.match(emailPattern)) {
            setResult("Neteisingas el. pašto formatas")
            return
        }
        
        setResult("Ieškoma");
        setLoading(true);

        try {
            const response = await fetch(`https://leakcheck.io/api/public?check=${email}`);
            const data = await response.json();
    
            if (data.success && data.found > 0) {
                const pluralizedText = data.found % 10 === 1 && data.found % 100 !== 11 
                    ? `Rastas ${data.found} nutekėjimas!` 
                    : (data.found < 21 && data.found > 9) || data.found % 10 == 0 
                    ? `Rasta ${data.found} nutekėjimų` 
                    : `Rasti ${data.found} nutekėjimai!`;
                setResult(pluralizedText);
                setBreachDetails({ sources: data.sources, fields: data.fields });
                console.log("API response sources:", data.sources);
                console.log("Rendering breachDetails.sources:", breachDetails.sources);
            } else {
                setResult("El. paštas saugus!");
                setBreachDetails({ sources: [], fields: [] });
            }
        } catch (error) {
            console.error("API klaida:", error);
            setResult("Klaida tikrinant el. paštą");
        }
        
        setLoading(false);
                
    };
    
        return (
            <>
                <div style={{ marginTop: "1em" }}>
                    <h2 style={{color: "white"}}>Patikrinkite ar el. pašto adresas buvo nutekintas</h2>
                    <input
                        type="text"
                        placeholder="Įveskite el. pašto adresą"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: "0.5rem", width: "90%" }}
                    />
                    <button 
                        onClick={EmailCheck}
                        disabled={!email.match(emailPattern)}
                        style={{ 
                            width: "200px", height: "40px", 
                            backgroundColor: email.match(emailPattern) ? "#4b5563" : "#212121", 
                            color: email.match(emailPattern) ? "white" : "#5b5a5b", 
                            border: "none",
                            borderRadius: "8px", outline: "none",
                            transition: "background-color 0.2s ease-in-out", 
                            marginTop: "0.5rem",
                            cursor: email.match(emailPattern) ? "pointer" : "not-allowed"
                        }}
                        >   
                        Tikrinti
                    </button>

                    {/* STATUS CARD */}
                        {result.length > 0 && (
                            <div style={{
                                padding: "1rem",
                                borderRadius: "8px",
                                color: getResultColor().color,
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                textAlign: "center",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                            }}>
                                {result}
                            </div>
                        )}

                        {breachDetails.fields.length > 0 && (
                            <button
                            onClick={switchPage}
                            style={{
                                marginTop: "1rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "#4b5563",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                            >
                                Ką daryti?
                            </button>
                        )}

                        {/* LEAKED INFORMATION CARD */}
                        {breachDetails.fields.length > 0 && (
                            <div style={{
                                padding: "1rem",
                                borderRadius: "8px",
                                color: "white",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                paddingBottom: "0.1rem"
                            }}>
                                <h3 style={{ margin: 0, borderBottom: "2px solid #e5e7eb", paddingBottom: "5px" }}>
                                    Nutekinta informacija:
                                </h3>
                                <ul style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                                    {breachDetails.fields.map((field, index) => (
                                        <li key={index} style={{ padding: "5px 0" }}>{field}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* BREACH SOURCES CARD */}
                        {breachDetails.sources.length > 0 && (
                            <div style={{
                                padding: "1rem",
                                borderRadius: "8px",
                                color: "white",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                paddingBottom: "3.5rem"
                            }}>
                                <h3 style={{ margin: 0, borderBottom: "2px solid #e5e7eb", paddingBottom: "5px" }}>
                                    Nutekėjimo šaltiniai:
                                </h3>
                                <ul style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                                    {breachDetails.sources.map((source, index) => (
                                        <li key={index} style={{ padding: "5px 0" }}>
                                            <strong>{source.name}</strong> <span style={{ color: "#6b7280" }}>({source.date})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    <div style={{ paddingTop: "0.8rem"}}>
                        {loading && <div className="loader"></div>}
                    </div>                    
                </div>
                <br />
            </>
        );
}    

export default EmailStatus;