import { useState } from "react";
import { Lightbulb } from 'lucide-react';
import { useTranslation } from "react-i18next";

function CookiesTips() {
    const { t } = useTranslation('cookies');

    const titles = [
        { id: 1, content: t('title1') },
        { id: 2, content: t('title2') },
        { id: 3, content: t('title3') },
        { id: 4, content: t('title4') },
    ]
    
    const descriptions = [
        {id: 1, content: t('desc1')},
        {id: 2, content: t('desc2')},
        {id: 3, content: t('desc3')},
        {id: 4, content: t('desc4')},
    ]

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + titles.length) % titles.length);
    };

    return (
        <div style={{marginBottom: 0}} className="security-check-container glassmorphism">
            <div className="security-status">
                <div className="status-icon" style={{background: "var(--accent-gradient)"}}>
                    <span><Lightbulb size={30}/></span>
                </div>
                <div className="status-text">
                    {titles.map((title, index) => (
                        <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                            <h3 className="status-title" style={{margin: 0}}>{title.content}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{marginTop: "20px", height:"120px"}}>
                {descriptions.map((desc, index) => (
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
                    {currentIndex + 1} / {descriptions.length}
                </div>
                <button className="btn btn-secondary" onClick={nextSlide}>❯</button>
            </div>
        </div>
    );
}

export default CookiesTips;
