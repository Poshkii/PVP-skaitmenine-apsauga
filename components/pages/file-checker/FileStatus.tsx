import {Upload} from "lucide-react";

function FileStatus({ inputFile } : {inputFile: string }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState(inputFile || "");
    const [result, setResult] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [hashValues, setHashValues] = useState({
        md5: "",
        sha1: "",
        sha256: ""
    });
    const [safety, setSafety] = useState<"safe" | "unsafe" | "unknown">("unknown");

    const FileChecker = () => {
        setIsChecking(true);
        setResult("Skaičiuojama...");
    };
    
        return (
            <>
            <div style={{ 
                flexDirection: "column", 
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto"
            }}
            >
                <h2 style={{color: "white", margin: "1rem auto 0 auto"}}>Patikrinkite failo saugumą</h2>
				
				<div style={{ margin: "1rem auto", width: "90%" }}>
					<label 
						htmlFor="file-upload" 
						style={{ 
							display: "block", 
							backgroundColor: "#374151", 
							color: "white", 
							padding: "1rem", 
							borderRadius: "8px", 
							textAlign: "center",
							cursor: "pointer",
							border: "2px dashed #6b7280"
						}}
					>
						
						{/* nezinau tiksliai ar galima bus realizuot failo itempima i extension'o langa */}
                        <Upload />
						<div>Pasirinkite arba nutempkite failą čia</div>
						{fileName && <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>Pasirinktas: {fileName}</div>}
					</label>
					<input 
						id="file-upload" 
						type="file" 
						// cia kai paspaudziama pasirinkti kita faila
						// onChange={}
						style={{ display: "none" }} 
					/>
				</div>
				
				<button
					onClick={FileChecker}
					style={{ 
						width: "60%", 
						height: "40px", 
                        margin: "auto",
						backgroundColor: !selectedFile || isChecking ? "#6b7280" : "#4b5563", 
						color: "white", 
						border: "none",
						borderRadius: "8px", 
						outline: "none"
					}}
				>  
					{isChecking ? "Tikrinama..." : "Tikrinti failo saugumą"}
				</button>
				
				{result && (
					<div style= {{ margin: "1rem auto", width: "90%"}}>
						<div style={{ 
                            padding: "0.75rem", 
                            borderRadius: "8px", 
                            backgroundColor: safety === "safe" ? "#065f46" : safety === "unsafe" ? "#7f1d1d" : "#374151",
                            color: "white",
                            marginBottom: "1rem"
                        }}>
							<div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Rezultatas: {
								safety === "safe" ? "Failas saugus" : 
								safety === "unsafe" ? "Failas nesaugus" : 
								""
							}</div>
							<div>{result}</div>
						</div>
						
                        {/* pakeisti i !== normalioj versijoj */}
						{safety == "unknown" && (
							<div style={{ backgroundColor: "#374151", padding: "0.75rem", borderRadius: "8px", color: "white" }}>
								<h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>Maišos reikšmės:</h3>
								<div style={{ display: "grid", gap: "0.5rem" }}>
									<div>
										<span style={{ fontWeight: "bold" }}>MD5:</span> 
										<span>{hashValues.md5}</span>
									</div>
									<div>
										<span style={{ fontWeight: "bold" }}>SHA-1:</span> 
										<span>{hashValues.sha1}</span>
									</div>
									<div>
										<span style={{ fontWeight: "bold" }}>SHA-256:</span> 
										<span>{hashValues.sha256}</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
                <br />
            </div>
            </>
        );
}
    

export default FileStatus;