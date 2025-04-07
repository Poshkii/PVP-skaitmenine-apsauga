import {useState} from "react";
import { Lightbulb } from 'lucide-react';

const slides = [
    { id: 1, content: "The length of a password is significantly more important than its complexity.", img: "/pswd_images/complexity.png"  },
    { id: 2, content: "Passwords should be minimum 8 characters long, preferably at least 16 characters long.", img: "/pswd_images/length.png"  },
    { id: 3, content: "Avoid using common, simple and easy to guess dictionary words in passwords.", img: "/pswd_images/dictionary.png"  },
    { id: 4, content: "Do not use repeating or predictable sequences in passwords (e.g., 'aaaa' or '1234').", img: "/pswd_images/repetition.png"  },
    { id: 5, content: "Do not include personal information in passwords (e.g., birthdate, name, etc.).", img: "/pswd_images/personal.png"  },
    { id: 6, content: "Store passwords in a specialized password manager.", img: "/pswd_images/manager.png"  },
    { id: 7, content: "Change your password immediately if a data breach occurs.", img: "/pswd_images/leaks.png"  },
    { id: 8, content: "Do not reuse the same password across multiple systems, websites, etc.", img: "/pswd_images/reuse.png"  },
    { id: 9, content: "Avoid using password recovery or reminder questions and hints.", img: "/pswd_images/hints.png"  },
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
            <div className="security-check-container glassmorphism">
                <div className="security-status">
                    <div className="status-icon" style={{background: "var(--accent-gradient)"}}>
                        <span><Lightbulb/></span>
                    </div>
                    <div className="status-text">
                        <h3 className="status-title">Password Security Tips</h3>
                        <p className="status-description">
                            Improve your password security by following these recommendations
                        </p>
                    </div>
                </div>
                
                <div className="recent-items" style={{marginTop: "20px"}}>
                    {slides.map((slide, index) => (
                        <div key={slide.id} 
                            className="recent-item" 
                            style={{ 
                                display: index === currentIndex ? "block" : "none",
                                padding: "16px",
                                textAlign: "left"
                            }}
                        >
                            <div className="status-text">
                                <p className="status-description">{slide.content}</p>
                            </div>
                            <div style={{textAlign: "center", marginTop: "16px"}}>
                                <img 
                                    src={slide.img} 
                                    alt={`Tip ${slide.id}`} 
                                    style={{maxWidth:"90%", objectFit: "contain"}} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="action-buttons slide-buttons" style={{marginTop: "16px"}}>
                    <button onClick={prevSlide} className="btn btn-secondary" style={{width:"35%"}}>
                        ← Previous
                    </button>
                    <div style={{
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: "var(--text-primary)"
                    }}>
                        {currentIndex + 1} / {slides.length}
                    </div>
                    <button onClick={nextSlide} className="btn btn-secondary" style={{width:"35%"}}>
                        Next →
                    </button>
                </div>
            </div>
        </>
    );
}

export default PasswordTips;