import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import FeatureList from "@/components/pages/home/FeatureList.tsx";
import SettingsPage from "@/components/pages/settings/Settings.tsx";
import URLChecker from "../url-checker/URLChecker";
import EmailChecker from "../email-checker/EmailChecker";
import FileChecker from "@/components/pages/file-checker/FileChecker";
import InfoPage from "../info-page/InfoPage";
import Profile from "@/components/pages/profile/Profile.tsx";
import Login from "@/components/pages/profile/Login.tsx";
import Register from "@/components/pages/profile/Register.tsx";
import CookiesManager from "@/components/pages/cookies/Cookies";
import { Cookie } from "lucide-react";
import ReportPage from "@/components/pages/report-page/ReportPage.tsx";
import {Route, Routes} from "react-router";
import {useBackgroundMessaging} from "@/hooks/useBackgroundMessaging.ts";
import {useNavigate} from "react-router";
import {Settings} from "lucide-react";

function Home(){
    useBackgroundMessaging();
    const navigate = useNavigate();

    return (
        <div className="main-window">
          {/* Left Panel */}
            <div className="left-panel">
                <h1 className="falcon-fort-title">FalconFort</h1>
                <FeatureList />
            
                {/* Settings button at bottom */}
                <button className="settings-button "
                    onClick={() => navigate("/settings")}>
                    <div className="settings-icon">
                    <Settings />
                    </div>
                    <span className="settings-text">Settings</span>
                </button>
            </div>
          
          {/* Right Panel */}
          <div className="right-panel">
            <Routes>
              <Route path="/url-checker" element={<URLChecker />} />
              <Route path="/file-checker" element={<FileChecker />} />
              <Route path="/password-checker" element={<PasswordChecker />} />
              <Route path="/cookies" element={<CookiesManager />} />
              <Route path="/email-checker" element={<EmailChecker />} />
              <Route path="/info-page" element={<InfoPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      );

}

export default Home;