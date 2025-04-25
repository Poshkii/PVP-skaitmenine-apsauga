import {useState} from "react";
import { Lightbulb } from 'lucide-react';
import { useTranslation } from "react-i18next";


// const titles = [
//     { id: 1, content: "Pasikeiskite slaptažodį" },
//     { id: 2, content: "Aktyvuokite dviejų faktorių autentifikaciją" },
//     { id: 3, content: "Patikrinkite savo paskyras" },
//     { id: 4, content: "Pridėkite arba atnaujinkite paskyrų atkūrimo informaciją" },
//     { id: 5, content: "Saugokitės internetinių sukčių laiškų" },
// ]

// const descriptions = [
//     {id: 1, content: "Nutekėję slaptažodžiai gali būti panaudoti bandant prisijungti prie kitų jūsų paskyrų, "+
//                      "ypač jei naudojate tą patį slaptažodį ar jo derinį. Keisdami slaptažodį į naują ir saugų užtikrinate, "+
//                      "kad įsilaužėliai negalės lengvai pasiekti jūsų duomenų."},
//     {id: 2, content: "Įjungus papildomą veiksnį, prisijungimui reikės unikalaus kodo iš SMS ar autentifikavimo programėlės. "+
//                      " Net sužinojus jūsų slaptažodį, piktavaliams be šio kodo prisijungti nepavyks."},
//     {id: 3, content: "Sužinoti, kad informacija nutekėjo, gali užtrukti ilgai. Per tą laiką piktavaliai galėjo "+
//                      "gauti prieigą prie jūsų paskyrų, todėl svarbu patikrinti ar jose nebuvo įtartinos veiklos."},
//     {id: 4, content: "Pridėdami paskyros atkūrimo informaciją ir atnaujindami ją užtikrinate, jog paskyros vagystės " +
//                      "atveju galėsite nesunkiai atgauti prieigą."},
//     {id: 5, content: "Nutekinti el. pašto adresai dažnai panaudojami fišingo laiškams siųsti. Atkreipkite dėmesį į "+
//                      "skyrybos klaidas, siuntėjo adresą bei nespauskite ant nuorodų."},
// ]

function EmailLeakTips({ switchPage }: { switchPage: () => void }) {
    const { t } = useTranslation('emails');
    const titles = [
        { id: 1, content: t('title1') },
        { id: 2, content: t('title2') },
        { id: 3, content: t('title3') },
        { id: 4, content: t('title4') },
        { id: 5, content: t('title5') },
    ]
    
    const descriptions = [
        {id: 1, content: t('desc1')},
        {id: 2, content: t('desc2')},
        {id: 3, content: t('desc3')},
        {id: 4, content: t('desc4')},
        {id: 5, content: t('desc5')},
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
            <div style={{ 
                display: "flex", 
                flexDirection: "column",
                height: "100%", // Set height to parent container
            }}>                  
                <div style={{ 
                    marginTop: "1rem", 
                    color: "white", 
                    display: "flex", 
                    flexDirection: "column",
                    flex: "1", // Makes this container take available space
                    height: "100%", // Ensure this container uses full height
                    justifyContent: "space-between" // This is important - distributes space
                }}>
                    {/* Top content section */}
                    <div>
                        {/* Title */}
                        <h2 className="panel-title">{t('dataTips')}</h2>

                        {/* Status container */}
                        <div className="security-status" style={{ 
                            marginTop: "24px", 
                            display: "flex", 
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: "1rem"
                        }}>
                            {/* Icon (Fixed Position) */}
                            <div className="status-icon" style={{ 
                                backgroundColor: "var(--error)",                             
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%"
                            }}>
                                <Lightbulb color="white" size={30} />
                            </div>

                            {/* Text Content */}
                            <div className="status-text" style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                textAlign: "left",
                                flexGrow: 1,
                                overflow: "hidden",
                                minWidth: "0"
                            }}>
                                {/* Titles */}
                                {titles.map((title, index) => (
                                    <div key={title.id} style={{ display: index === currentIndex ? "block" : "none" }}>
                                        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.4rem"}}>{title.content}</h3>
                                    </div>
                                ))}

                                {/* Descriptions */}
                                {descriptions.map((description, index) => (
                                    <div key={description.id} style={{ 
                                        display: index === currentIndex ? "block" : "none",
                                        overflow: "auto",
                                        maxHeight: "100%"
                                    }}>
                                        <div style={{ color: "#ADADAD", fontSize: "1rem"}}>
                                            {description.content}
                                        </div>                          
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom navigation with explicit padding */}
                    <div style={{
                        marginTop: "3rem", // Add significant margin above
                        paddingBottom: "1rem", // Explicit padding at bottom
                    }}>  
                        {/* Page Number */}
                        <div style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                            {currentIndex + 1} / {descriptions.length}
                        </div>
                        {/* Buttons */}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                            marginTop: "1rem"
                        }}>                              
                            <button className="btn btn-secondary" onClick={prevSlide}>❮</button>
                            <button className="btn btn-primary" onClick={switchPage}>{t('return')}</button>
                            <button className="btn btn-secondary" onClick={nextSlide}>❯</button>
                        </div>  
                    </div>
                </div>     
            </div>
        </>
    );
}

export default EmailLeakTips;