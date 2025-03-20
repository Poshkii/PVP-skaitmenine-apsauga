import {useState} from "react";

const titles = [
    { id: 1, content: "Pasikeiskite slaptažodį" },
    { id: 2, content: "Aktyvuokite dviejų faktorių autentifikaciją" },
    { id: 3, content: "Patikrinkite savo paskyras" },
    { id: 4, content: "Pridėkite arba atnaujinkite paskyrų atkūrimo informaciją" },
    { id: 5, content: "Saugokitės internetinių sukčių laiškų" },
]

const descriptions = [
    {id: 1, content: "Nutekėję slaptažodžiai gali būti panaudoti bandant prisijungti prie kitų jūsų paskyrų, "+
                     "ypač jei naudojate tą patį slaptažodį ar jo derinį. Keisdami slaptažodį į naują ir saugų užtikrinate, "+
                     "kad įsilaužėliai negalės lengvai pasiekti jūsų duomenų."},
    {id: 2, content: "Įjungus papildomą veiksnį, prisijungimui reikės unikalaus kodo iš SMS ar autentifikavimo programėlės. "+
                     " Net sužinojus jūsų slaptažodį, piktavaliams be šio kodo prisijungti nepavyks."},
    {id: 3, content: "Sužinoti, kad informacija nutekėjo, gali užtrukti ilgai. Per tą laiką piktavaliai galėjo "+
                     "gauti prieigą prie jūsų paskyrų, todėl svarbu patikrinti ar jose nebuvo įtartinos veiklos."},
    {id: 4, content: "Pridėdami paskyros atkūrimo informaciją ir atnaujindami ją užtikrinate, jog paskyros vagystės " +
                     "atveju galėsite nesunkiai atgauti prieigą."},
    {id: 5, content: "Nutekinti el. pašto adresai dažnai panaudojami fišingo laiškams siųsti. Atkreipkite dėmesį į "+
                     "skyrybos klaidas, siuntėjo adresą bei nespauskite ant nuorodų."},
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
                <div style={{ marginTop: "1rem", color: "white" }}>
                    <h2>Patarimai dėl nutekėjusios informacijos</h2>
                
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
        </>
    );
}

export default EmailLeakTips;