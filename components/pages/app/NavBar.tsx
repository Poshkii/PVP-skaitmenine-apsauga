import {useNavigate} from "react-router";
import {Home, Settings} from "lucide-react";

function NavBar() {
    const navigate = useNavigate();

    return (
        <div className="bottom-buttons">
            <button className="page-button" onClick={() => navigate("/")}><Home/></button>
            <button className="page-button">Timeline</button>
            <button className="page-button">Button 3</button>
            <button className="page-button" onClick={() => navigate("/settings")}><Settings/></button>
        </div>
    );
}

export default NavBar;