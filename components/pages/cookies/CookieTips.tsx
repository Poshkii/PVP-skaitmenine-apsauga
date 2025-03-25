import {useState} from "react";

const titles = [
    { id: 1, content: "What are cookies?" },
    { id: 2, content: "What is their purpose?" },
    { id: 3, content: "What should I be aware of?" },
    { id: 4, content: "Should I accept cookies?" },
]

const descriptions = [
    {id: 1, content: "Cookies are small text files websites store on your device."},
    {id: 2, content: "Cookies store your login data, shopping cart details or other preferences. That way you don't have to redo everything on each visit."},
    {id: 3, content: "Cookies may be used to store information about your activity online, raising privacy concerns. Such data is commonly used for advertisement purposes."},
    {id: 4, content: "Be cautious when accepting cookies. It is recommended to accept cookies that are required for website functionality because it enchances browsing experience. "+
                     "However, you should decline any marketing, statistics cookies if you are concerned about privacy."},
]

function CookiesTips() {

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
                    <h2>Internet Cookies Tips</h2>
                
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