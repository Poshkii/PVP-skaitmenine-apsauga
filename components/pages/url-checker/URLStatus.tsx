
function URLStatus({ inputURL } : {inputURL: string }) {
    const [url, setUrl] = useState(inputURL);
    const [result, setResult] = useState("");

    const UrlChecker = () => {
        
        setResult("Skaičiuojama...");
    };
    
        return (
            <>
                <div style={{ marginTop: "1em" }}>
                    <h2>Patikrinkite svetainės saugumą</h2>
                    <input
                        type="text"
                        placeholder="Įveskite svetainės nuorodą..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{ padding: "0.5rem", width: "90%" }}
                    />
                    <button 
                        onClick={UrlChecker}
                        //style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "blue", color: "white", borderRadius: "5px", border: "none", cursor: "pointer", width: "100%" }}
                        style={{ width: "200px", height: "40px", backgroundColor: "#4b5563", color: "white", border: "none",borderRadius: "8px", outline: "none", transition: "background-color 0.2s ease-in-out", marginTop: "0.5rem" }}
                    >   
                        Tikrinti
                    </button>
                    <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                        {result}
                    </div>
                </div>
                <br />
            </>
        );
}
    

export default URLStatus;