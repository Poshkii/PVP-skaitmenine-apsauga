
function EmailStatus({ inputEmail } : {inputEmail: string }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
                setResult("El. paštas buvo nutekintas!");
            } else {
                setResult("El. paštas saugus!");
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
                    <div style={{ marginTop: "0.5rem", fontWeight: "bold", color: "white" }}>
                        {email.match(emailPattern) ? result : (email.length > 0 ? "Patikrinkite el. pašto formatą" : "")}                        
                    </div>
                    <div style={{ paddingTop: "0.8rem"}}>
                        {loading && <div className="loader"></div>}
                    </div>                    
                </div>
                <br />
            </>
        );
}    

export default EmailStatus;