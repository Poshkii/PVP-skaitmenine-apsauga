import {useNavigate} from "react-router";
import FeatureList from "@/components/pages/home/FeatureList.tsx";

import {useBackgroundMessaging} from "@/hooks/useBackgroundMessaging.ts";

import {Settings, House, User} from "lucide-react";
import logo from "@/assets/icon.png";
import HomeRoutes from "@/components/pages/home/HomeRoutes.tsx";

function Home() {
    useBackgroundMessaging();
    const navigate = useNavigate();

    return (
        <div className="main-window">
            {/* Left Panel */}
            <div className="left-panel">
                <div className="title-container" onClick={() => navigate("/report-page")}>
                    <img className="logo-image title-hover" src={logo} alt="FalconFort logo"/>
                    <h1 className="falcon-fort-title title-hover">FalconFort</h1>
                </div>
                <FeatureList/>

                {/* Settings button at bottom */}
                <div className="bottom-buttons">
                    <button className="bottom-button home-button"
                            onClick={() => navigate("/report-page")}>
                        <div>
                            <House className="home-icon"/>
                            <span className="bottom-text">Home</span>
                        </div>
                    </button>
                    <button className="bottom-button profile-button"
                            onClick={() => navigate("/profile")}>
                        <div>
                            <User className="profile-icon"/>
                            <span className="bottom-text">Profile</span>
                        </div>
                    </button>
                    <button className="bottom-button settings-button"
                            onClick={() => navigate("/settings")}>
                        <div>
                            <Settings className="settings-icon"/>
                            <span className="bottom-text">Settings</span>
                        </div>
                    </button>
                </div>
                
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                <HomeRoutes/>
            </div>
        </div>
    );

}

export default Home;