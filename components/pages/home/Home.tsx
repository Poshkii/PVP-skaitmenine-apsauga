import {useNavigate} from "react-router";
import FeatureList from "@/components/pages/home/FeatureList.tsx";

import {useBackgroundMessaging} from "@/hooks/useBackgroundMessaging.ts";

import {Settings} from "lucide-react";
import logo from "@/assets/icon.png";
import HomeRoutes from "@/components/pages/home/HomeRoutes.tsx";

function Home() {
    useBackgroundMessaging();
    const navigate = useNavigate();

    return (
        <div className="main-window">
            {/* Left Panel */}
            <div className="left-panel">
                <div className="title-container">
                    <img className="logo-image" src={logo} alt="FalconFort logo"/>
                    <h1 className="falcon-fort-title">FalconFort</h1>
                </div>
                <FeatureList/>

                {/* Settings button at bottom */}
                <button className="settings-button"
                        onClick={() => navigate("/settings")}>
                    <div className="settings-icon">
                        <Settings/>
                    </div>
                    <span className="settings-text">Settings</span>
                </button>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                <HomeRoutes/>
            </div>
        </div>
    );

}

export default Home;