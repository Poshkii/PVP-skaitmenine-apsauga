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
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            minHeight: "80vh",  // Ensures full height
            height: "100%" // Prevents any scrolling on the container
        }}>
            {/* Content area */}
            <div style={{ 
                flexGrow: 1, 
                padding: "1rem 0",
                display: "flex", 
                flexDirection: "column",
                justifyContent: "flex-start"  // Ensure content stays at top
            }}>
                <h2 className="panel-title">Data leak tips</h2>

                <div style={{
                    marginTop: "24px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: "1rem"
                }}>
                    <div className="status-icon" style={{
                        backgroundColor: "var(--error)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        padding: "0.5rem"
                    }}>
                        <Lightbulb color="white" size={30} />
                    </div>

                    <div className="status-text" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        textAlign: "left",
                        flexGrow: 1,
                        overflow: "hidden",
                        minWidth: 0
                    }}>
                        {/* Title */}
                        {titles.map((title, index) => (
                            <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.4rem" }}>{title.content}</h3>
                            </div>
                        ))}

                        {/* Description */}
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
                </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{
                marginTop: "auto",  // Forces this section to stick to the bottom
                paddingTop: "1rem",
                paddingBottom: "1rem"
            }}>
                <div style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {currentIndex + 1} / {descriptions.length}
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    marginTop: "1rem"
                }}>
                    <button className="btn btn-secondary" onClick={prevSlide}>❮</button>
                    <button className="btn btn-secondary" onClick={nextSlide}>❯</button>
                </div>
            </div>
        </div>
    );
}

export default CookiesTips;
