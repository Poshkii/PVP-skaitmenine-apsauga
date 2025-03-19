import {useState} from "react";

const titles = [
    { id: 1, content: "Pakeiskite nutekintą slaptažodį." },
    { id: 2, content: "Aktyvuokite dviejų faktorių autentifikaciją." },
    { id: 3, content: "Patikrinkite savo paskyras." },
    { id: 4, content: "Pridėkite arba atnaujinkite paskyrų atkūrimo informaciją." },
    { id: 5, content: "Saugokitės internetinių sukčių laiškų." },
]

const descriptions = [
    {id: 1, content: "a"},
    {id: 2, content: "b"},
    {id: 3, content: "c"},
    {id: 4, content: "d"},
    {id: 5, content: "e"},
]

function EmailLeakTips({ switchPage }: { switchPage: () => void }) {

    const [currentIndex, setCurrentIndex] = useState(0);
    
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
    }
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + titles.length) % titles.length);
    }

    return (
        <>
            <div>
                <div style={{ marginTop: "1rem", color: "white" }}>
                    <h2>Patarimai dėl nutekėjusios informacijos</h2>
                
                    {titles.map((title, index) => (
                        <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                            <div style={{ marginTop: "3rem", textAlign: 'center', fontSize: "1rem"}}>{title.content}</div>
                            <br />
                        </div>
                    ))}

                    {descriptions.map((description, index) => (
                        <div key={description.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                            <div style={{ marginTop: "0", textAlign: 'center', fontSize: "1rem", height: "50px"}}>{description.content}</div>
                            <br />
                            <div>{description.id} / {descriptions.length}</div>
                        </div>
                    ))}
                </div>
                
                <div className="bottom-slide-buttons" style={{ marginTop: "5rem", backgroundColor: "#1f2937" }}>
                    <button className="slide-button" onClick={prevSlide}>❮</button>
                    <button
                        onClick={switchPage}
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#4b5563",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Grįžti
                    </button>
                    <button className="slide-button" onClick={nextSlide}>❯</button>
                </div>                
            </div>            
        </>
    );
}

export default EmailLeakTips;