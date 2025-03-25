import {useNavigate} from "react-router";
import {Clock, Home, Settings, User} from "lucide-react";

function NavBar() {
    const navigate = useNavigate();

    return (
        <div className="bottom-buttons fixed-bottom">
            <button className="page-button" onClick={() => navigate("/")}><Home/></button>
            <button className="page-button" onClick={() => navigate("/report-page")}><Clock/></button>
            <button className="page-button" onClick={() => navigate("/profile")}><User/></button>
            <button className="page-button" onClick={() => navigate("/settings")}><Settings/></button>
        </div>
    );
}

export default NavBar;