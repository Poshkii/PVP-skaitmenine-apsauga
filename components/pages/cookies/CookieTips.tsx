import {useState} from "react";
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
    }
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + titles.length) % titles.length);
    }

    return (
        <>            
                <div style={{ marginTop: "1rem", color: "white" }}>
                    <h2>{t('tips')}</h2>
                
                    {titles.map((title, index) => (
                        <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                            <div style={{ marginTop: "2rem", marginBottom: "1rem", textAlign: 'center', fontSize: "1.2rem"}}>{title.content}</div>
                        </div>
                    ))}

                    {descriptions.map((description, index) => (
                        <div key={description.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                            <div style={{ margin: "1rem", color: "#ADADAD", textAlign: 'center', fontSize: "1rem"}}>{description.content}</div>                          
                            <div>{currentIndex + 1} / {descriptions.length}</div>
                        </div>
                    ))}
                </div>        
                
                <div className="bottom-slide-buttons-new" style={{ backgroundColor: "#1f2937" }}>                                     
                    <button className="slide-button" onClick={prevSlide}>❮</button>                    
                    <button className="slide-button" onClick={nextSlide}>❯</button>
                </div>                
        </>
    );
}

export default CookiesTips;