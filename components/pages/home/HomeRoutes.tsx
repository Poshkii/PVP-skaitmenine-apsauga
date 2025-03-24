import {Route, Routes} from "react-router";
import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import FeatureList from "@/components/pages/home/FeatureList.tsx";
import Settings from "@/components/pages/settings/Settings.tsx";
import URLChecker from "../url-checker/URLChecker";
import EmailChecker from "../email-checker/EmailChecker";
import FileChecker from "@/components/pages/file-checker/FileChecker";
import InfoPage from "../info-page/InfoPage";
import Profile from "@/components/pages/profile/Profile.tsx";
import Login from "@/components/pages/profile/Login.tsx";
import Register from "@/components/pages/profile/Register.tsx";
import ReportPage from "../report-page/ReportPage";


function HomeRoutes(){
    return (
        <Routes>
            <Route path="/" element={<FeatureList />}></Route>
            <Route path="/info-page" element={<InfoPage />}></Route>
            <Route path="/password-checker/:password?" element={<PasswordChecker />}/>
            <Route path="/url-checker/:url?" element={<URLChecker />}/>
            <Route path="/file-checker/:file?" element={<FileChecker />}/>
            <Route path="/settings" element={<Settings />}/>
            <Route path="/report-page" element={<ReportPage />}/>
            <Route path="/email-checker/:email?" element={<EmailChecker />}/>
            <Route path="/profile" element={<Profile />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
        </Routes>
    );
}

export default HomeRoutes;