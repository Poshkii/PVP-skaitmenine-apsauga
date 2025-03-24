import {useState} from "react";

const slides = [
    { id: 1, content: "The length of a password is significantly more important than its complexity.", img: "/pswd_images/complexity.png"  },
    { id: 2, content: "Passwords should be at least 8 characters long.", img: "/pswd_images/length.png"  },
    { id: 3, content: "Avoid using common dictionary words in passwords.", img: "/pswd_images/dictionary.png"  },
    { id: 4, content: "Do not use repeating or predictable sequences in passwords (e.g., 'aaaa' or '1234').", img: "/pswd_images/repetition.png"  },
    { id: 5, content: "Do not include personal information in passwords (e.g., birthdate, name, etc.).", img: "/pswd_images/personal.png"  },
    { id: 6, content: "Store passwords in a specialized password manager.", img: "/pswd_images/managers.png"  },
    { id: 7, content: "Change your password immediately if a data breach occurs.", img: "/pswd_images/leaks.png"  },
    { id: 8, content: "Do not reuse the same password across multiple systems.", img: "/pswd_images/reuse.png"  },
    { id: 9, content: "Avoid using password reminder questions or hints.", img: "/pswd_images/hints.png"  },
    { id: 10, content: "Protect your logins by enabling two-factor authentication (2FA).", img: "/pswd_images/2fa.png"  }
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
            }}>
                <h2 className="menu-name">Tips for your passwords</h2>
               
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
                    bottom: "180px",
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
                bottom: "120px", 
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