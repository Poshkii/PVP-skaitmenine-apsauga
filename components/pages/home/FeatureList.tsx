import {useNavigate} from "react-router";
import {Search} from "lucide-react";

// TODO: define routes in a more global file
const meniu = [
    { name: "URL patikra", hint: "Ar tikrai nori čia apsilankyti?", route: "/url-checker"},
    { name: "El. pašto apsauga", hint: "Laiško tikrinimas, pavojingų failų analizė..", route: "/" },
    { name: "Failų patikra", hint: "Failų naudojimo saugumo tikrinimas", route: "/file-checker" },
    { name: "Tracker tikrintojas", hint: "Kažką tikrina...", route: "/" },
    { name: "Slapukų analizė", hint: "Sausainiai, mmmm...", route: "/" },
    { name: "Slaptažodžio patikra", hint: "Jautiesi saugus?", route: "/password-checker" },
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