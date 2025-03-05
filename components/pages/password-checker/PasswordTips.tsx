import {useState} from "react";

const slides = [
    { id: 1, content: "Slaptažodžio ilgis ženkliai svarbiau nei simbolių sudėtingumas." },
    { id: 2, content: "Slaptažodžiai turėtų būti minimaliai 8 simbolių ilgio." },
    { id: 3, content: "Pakartoninai nevartoti slaptažodžių kurie buvo kompromituoti." },
    { id: 4, content: "Vengti slaptažodyje vartoti įprastus žodyno žodžius." },
    { id: 5, content: "Vengti slaptažodyje vartoti pasikartojančias ar nuspėjamas simbolių sekas ('aaaa' arba '1234' ir pan.)." },
    { id: 6, content: "Vengti slaptaždoyje naudoti asmeninę informaciją (gimimo data, artimųjų vardai ir pan.)." },
    { id: 7, content: "Saugoti slaptažodžius specializuotoje tvarkyklėje (password manager)." },
    { id: 8, content: "Įvykus duomenų nutekėjimui nedelsiant keisti savo slaptažodį." },
    { id: 9, content: "Nenaudoti identiškų slaptažodžių keliose skirtingose sistemose." },
    { id: 10, content: "Nenaudoti slaptažodžio priminimo klausimų arba užuominų." },
    { id: 11, content: "Apsaugoti savo prisijungimus 2FA." }
];


function PasswordTips() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    }

    return (
        <>

            <div style={{ 
            width: "100%", 
            padding: "16px", 
            textAlign: "center", 
            backgroundColor: "#1f2937", /* Dark background similar to your theme */
            color: "#9ca3af", /* Light gray text */
            borderRadius: "8px",
            height: "100px"
            }}>
                <h2 className="menu-name">Patarimai slaptažodžiui</h2>
            
                {slides.map((slide, index) => (
                    <div key={slide.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                        <div style={{textAlign: 'left', fontSize: "0.9rem", height: "65px"}}>{slide.content}</div>
                        <br />
                        <div>{slide.id} / {slides.length}</div>
                    </div>
                ))}
            </div>
            
            <div className="bottom-slide-buttons" style={{ backgroundColor: "#1f2937" }}>
                <button className="slide-button" onClick={prevSlide}>❮</button>
                <button className="slide-button" onClick={nextSlide}>❯</button>
            </div>
        </>

    );
}

export default PasswordTips;