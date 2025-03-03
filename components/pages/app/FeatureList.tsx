import {useNavigate} from "react-router";

// TODO: define routes in a more global file
const meniu = [
    { name: "URL apsauga", hint: "SSL sertifikatų tikrinimas...", route: "/"},
    { name: "El. pašto apsauga", hint: "Laiško tikrinimas, pavojingų failų analizė..", route: "/" },
    { name: "Tracker tikrintojas", hint: "Kažką tikrina...", route: "/" },
    { name: "Slapukų analizė", hint: "Sausainiai, mmmm...", route: "/" },
    { name: "Slaptažodžio patikra", hint: "Jautiesi saugus?", route: "/password-checker" },
];

function FeatureList(){
    const navigate = useNavigate();

    return (
    <>
        <h2 className="items-title">All items</h2>
        <div className="items-list">
            {meniu.map((item, index) => (
                <button key={index} className="menu-button" onClick={() => navigate(item.route)}>
                    <p className="menu-name">{item.name}</p>
                    <p className="menu-hint">{item.hint}</p>
                </button>
            ))}
        </div>
    </>
    );
}

export default FeatureList;