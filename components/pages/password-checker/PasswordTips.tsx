import {useState} from "react";
import { Lightbulb } from 'lucide-react';
import { useTranslation } from "react-i18next";

function PasswordTips() {
    const { t } = useTranslation('passwords');
    const slides = [
        { id: 1, content: t('slide1'), title: t('title1') },
        { id: 2, content: t('slide2'), title: t('title2') },
        { id: 3, content: t('slide3'), title: t('title3') },
        { id: 4, content: t('slide4'), title: t('title4') },
        { id: 5, content: t('slide5'), title: t('title5') },
        { id: 6, content: t('slide6'), title: t('title6') },
        { id: 7, content: t('slide7'), title: t('title7') },
        { id: 8, content: t('slide8'), title: t('title8') },
        { id: 9, content: t('slide9'), title: t('title9') },
        { id: 10, content: t('slide10'), title: t('title10') }
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
                        <span><Lightbulb size={30}/></span>
                    </div>
                    <div className="status-text">
                        {slides.map((title, index) => (
                            <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                                <h3 className="status-title" style={{margin: 0}}>{title.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{marginTop: "20px"}}>
                    {slides.map((desc, index) => (
                        <div key={desc.id} style={{
                            display: index === currentIndex ? "block" : "none"
                        }}>
                            <div style={{ color: "#ADADAD", fontSize: "1rem" }}>
                                {desc.content}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="action-buttons slide-buttons" style={{marginTop: "16px"}}>
                    <button className="btn btn-secondary" onClick={prevSlide}>❮</button>
                    <div style={{ display: "flex", alignItems: "center", justifyContent:"center", color: "var(--text-primary)", width: "50px" }}>
                        {currentIndex + 1} / {slides.length}
                    </div>
                    <button className="btn btn-secondary" onClick={nextSlide}>❯</button>
                </div>
            </div>
        </>
    );
}

export default PasswordTips;