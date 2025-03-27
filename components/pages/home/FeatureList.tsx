import {useNavigate} from "react-router";
import {Search} from "lucide-react";
import { Info } from 'lucide-react';


// TODO: define routes in a more global file
const meniu = [
    { name: "Website Check", hint: "Are you sure you want to visit this site?", route: "/url-checker"},
    { name: "File Check", hint: "Scan your files", route: "/file-checker" },
    { name: "Password Check", hint: "Feeling safe?", route: "/password-checker" },
    { name: "Cookies", hint: "Cookies, mmmm...", route: "/cookies" },
    { name: "Email Protection", hint: "Message, attachment analysis", route: "/email-checker" },
    { name: "Tracker Check", hint: "Tracker analysis", route: "/" },
];

function FeatureList(){
    const navigate = useNavigate();

    return (
    <>
        <div className="top-bar">
                <Search className="search-icon" size={18}/>
                <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                />
                <button onClick={() => navigate("/info-page")} className="info-button"><Info/></button>
        </div>
        {/* Middle Menu Section */}
        <div className="middle-menu">
        <h2 className="items-title">All items</h2>
        <div className="items-list">
            {meniu.map((item, index) => (
                <button key={index} className="menu-button" onClick={() => navigate(item.route)}>
                    <p className="menu-name">{item.name}</p>
                    <p className="menu-hint">{item.hint}</p>
                </button>
            ))}
        </div>
        </div>

    </>
    );
}


export default FeatureList;