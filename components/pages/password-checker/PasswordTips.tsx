import {useState} from "react";

const slides = [
    { id: 1, content: "Slaptažodžio ilgis ženkliai svarbiau nei simbolių sudėtingumas.", img: "/pswd_images/complexity.png"  },
    { id: 2, content: "Slaptažodžiai turėtų būti minimaliai 8 simbolių ilgio.", img: "/pswd_images/length.png"  },
    { id: 3, content: "Vengti slaptažodyje vartoti įprastus žodyno žodžius.", img: "/pswd_images/dictionary.png"  },
    { id: 4, content: "Slaptažodyje nevartoti pasikartojančių ar nuspėjamų sekų ('aaaa' arba '1234' ir pan.).", img: "/pswd_images/repetition.png"  },
    { id: 5, content: "Slaptaždoyje nenaudoti asmeninės informacijos (gimimo data, vardas ir pan.).", img: "/pswd_images/personal.png"  },
    { id: 6, content: "Saugoti slaptažodžius specializuotoje tvarkyklėje (password manager).", img: "/pswd_images/managers.png"  },
    { id: 7, content: "Įvykus duomenų nutekėjimui nedelsiant keisti savo slaptažodį.", img: "/pswd_images/leaks.png"  },
    { id: 8, content: "Nenaudoti identiškų slaptažodžių keliose skirtingose sistemose.", img: "/pswd_images/reuse.png"  },
    { id: 9, content: "Nenaudoti slaptažodžio priminimo klausimų arba užuominų.", img: "/pswd_images/hints.png"  },
    { id: 10, content: "Apsaugoti savo prisijungimus 2FA.", img: "/pswd_images/2fa.png"  }
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
                padding: "16px 16px",
                textAlign: "center",
                backgroundColor: "#1f2937",
                color: "#9ca3af",
                position: "relative",
                display: "flex",
                flexDirection: "column"
            }}>
                <h2 className="menu-name">Patarimai slaptažodžiui</h2>
               
                <div style={{ flex: "1" }}>
                    {slides.map((slide, index) => (
                        <div key={slide.id} style={{ 
                            display: index === currentIndex ? "block" : "none",
                            height: "100%"
                        }}>
                            <div style={{textAlign: 'left', fontSize: "0.9rem"}}>{slide.content}</div>
                        </div>
                    ))}
                </div>
                
                <div style={{ 
                    position: "fixed",
                    bottom: "170px",
                    left: "0",
                    width: "100%",
                    textAlign: "center",
                    backgroundColor: "#1f2937",
                }}>
                    {slides.map((slide, index) => (
                        <div key={`img-${slide.id}`} style={{ 
                            display: index === currentIndex ? "block" : "none" 
                        }}>
                            <img 
                                className="slide-image" 
                                src={slide.img} 
                                alt={`Slide ${slide.id}`} 
                                style={{ maxHeight: "100px", objectFit: "contain" }} 
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bottom-slide-controls" style={{ 
                position: "fixed",
                bottom: "100px", 
                width: "100%", 
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#1f2937",
                zIndex: "100",
            }}>
                <button className="slide-button" onClick={prevSlide} style={{ marginRight: "15px" }}>❮</button>
                <div style={{ margin: "0 15px", color: "white" }}>
                    {slides[currentIndex]?.id || 1} / {slides.length}
                </div>
                <button className="slide-button" onClick={nextSlide} style={{ marginLeft: "15px" }}>❯</button>
            </div>
        </>
    );
}

export default PasswordTips;