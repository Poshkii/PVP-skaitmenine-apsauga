import "../info.css";

function InfoPage(){
    const handleButtonClick = (url: string | URL | undefined) => {
        window.open(url, "_blank");
    };

    return (
        <div className="info-page">
            <h2 className="info-title"><b>Password Data Usage</b></h2>
        </div>
    );

}

export default InfoPage;