import {useState} from "react";
import { Lightbulb } from 'lucide-react';
import { useTranslation } from "react-i18next";



function PasswordTips() {
    const { t } = useTranslation('passwords');
    const slides = [
    { id: 1, content: t('slide1'), img: "/pswd_images/complexity.png"  },
    { id: 2, content: t('slide2'), img: "/pswd_images/length.png"  },
    { id: 3, content: t('slide3'), img: "/pswd_images/dictionary.png"  },
    { id: 4, content: t('slide4'), img: "/pswd_images/repetition.png"  },
    { id: 5, content: t('slide5'), img: "/pswd_images/personal.png"  },
    { id: 6, content: t('slide6'), img: "/pswd_images/manager.png"  },
    { id: 7, content: t('slide7'), img: "/pswd_images/leaks.png"  },
    { id: 8, content: t('slide8'), img: "/pswd_images/reuse.png"  },
    { id: 9, content: t('slide9'), img: "/pswd_images/hints.png"  },
    { id: 10, content: t('slide10'), img: "/pswd_images/2fa.png"  }
];
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
                        <h3 className="status-title">{t('tips')}</h3>
                        <p className="status-description">
                            {t('recommend')}
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
                        {t('prev')}
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
                        {t('next')}
                    </button>
                </div>
            </div>
        </>
    );
}

export default PasswordTips;