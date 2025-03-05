
function EmailStatus({ inputEmail } : {inputEmail: string }) {
    const [email, setEmail] = useState(inputEmail);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const EmailCheck = () => {
        
        setResult("Ieškoma");
        setLoading(true);

        // Simulating an async request (replace with actual API call)
        setTimeout(() => {
            setLoading(false);
            setResult("Patikrinimas baigtas!");
        }, 2000);        
    };
    
        return (
            <>
                <div style={{ marginTop: "1em" }}>
                    <h2>Patikrinkite ar el. pašto adresas buvo nutekintas</h2>
                    <input
                        type="text"
                        placeholder="Įveskite el. pašto adresą"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: "0.5rem", width: "90%" }}
                    />
                    <button 
                        onClick={EmailCheck}
                        
                        style={{ width: "200px", height: "40px", backgroundColor: "#4b5563", color: "white", border: "none",borderRadius: "8px", outline: "none", transition: "background-color 0.2s ease-in-out", marginTop: "0.5rem" }}
                    >   
                        Tikrinti
                    </button>
                    <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
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

export default EmailStatus;