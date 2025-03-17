import "./info.css";

function InfoPage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };

    return (
        <div className="info-page">
            <h2 className="info-title"><b>DigitalWellness</b> – focused on digital hygiene and privacy.</h2>
            <div className="button-container">
                <button className="custom-button" onClick={() => handleButtonClick("https://justdeleteme.xyz/")}>
                    Just<span style={{color: "red", fontWeight: "bold"}}>Delete</span>Me
                </button>
                <button className="custom-button" onClick={() => handleButtonClick("https://tosdr.org/en/")}>
                    <span style={{fontWeight: "bold"}}>Terms of Service </span>-Didn't Read
                </button>
                <button className="custom-button" onClick={() => handleButtonClick("https://www.dns0.eu/")}>
                    The&nbsp;<span style={{ color: "#ADD8E6", fontWeight: "bold" }}>European</span>&nbsp;public&nbsp;DNS
                </button>
                <button className="custom-button" onClick={() => handleButtonClick("https://whoer.net/")}>
                        Whoer – check your IP address
                </button>
                <button className="custom-button" onClick={() => handleButtonClick("https://www.mydataremoval.com/")}>
                    MyDataRemoval – remove personal data from the internet.
                </button>
            </div>
        </div>
    );

}

export default InfoPage;