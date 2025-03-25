import {useState} from "react";

const titles = [
    { id: 1, content: "Change your password" },
    { id: 2, content: "Activate two factor authentication" },
    { id: 3, content: "Check your accounts" },
    { id: 4, content: "Add or update account recovery details" },
    { id: 5, content: "Look out for phishing emails" },
]

const descriptions = [
    {id: 1, content: "Leaked passwords can be used to login to your other accounts if the passwords are the same "+
                     "or similar. By changing the password into a new and safe one, you take away the opportunity "+
                     "for hackers to easily access your data."},
    {id: 2, content: "Activating 2FA will require you to use an additional code from SMS or authentication app when logging in. "+
                     " Even if your password is cracked, the hackers won't be able to login without the code."},
    {id: 3, content: "Realizing that the information was leaked takes a long time. This gives time to hackers to access your "+
                     "accounts. Therefore it is recommended to check your accounts for suspicious activity."},
    {id: 4, content: "By adding recovery information and keeping it updated, you ensure that in case of account theft, " +
                     "you could easily recover access."},
    {id: 5, content: "Leaked email addresses are commonly targeted by phishing attacks. Be cautious when "+
                     "opening unknown emails, do not press on random url links."},
]
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
                    <h2>Data leak tips</h2>
                
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
                        Return
                    </button>
                    <button className="slide-button" onClick={nextSlide}>❯</button>
                </div>                
        </>
    );
}

export default EmailLeakTips;