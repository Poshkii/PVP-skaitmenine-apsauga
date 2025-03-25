import {useNavigate} from "react-router";
import {Clock, Cookie, Home, Settings} from "lucide-react";

function NavBar() {
    const navigate = useNavigate();

    return (
        <div className="bottom-buttons fixed-bottom">
            <button className="page-button" onClick={() => navigate("/")}><Home/></button>
            <button className="page-button"><Clock/></button>
            <button className="page-button" onClick={() => navigate("/cookies")}><Cookie/></button>
            <button className="page-button" onClick={() => navigate("/settings")}><Settings/></button>
        </div>
    );
}

export default NavBar;