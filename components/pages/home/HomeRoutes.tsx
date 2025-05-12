import {Route, Routes} from "react-router";
import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import Settings from "@/components/pages/settings/Settings.tsx";
import URLChecker from "../url-checker/URLChecker";
import EmailChecker from "../email-checker/EmailChecker";
import FileChecker from "@/components/pages/file-checker/FileChecker";
import InfoPage from "../info-page/InfoPage";
import Profile from "@/components/pages/profile/Profile.tsx";
import Login from "@/components/pages/profile/Login.tsx";
import Register from "@/components/pages/profile/Register.tsx";
import Cookies from "@/components/pages/cookies/Cookies";
import Trackers from "@/components/pages/trackers/Trackers";
import ReportPage from "@/components/pages/report-page/ReportPage.tsx";
import PhishEmail from "@/components/pages/phish-email/PhishChecker";

import URLData from "../data-usage/URL/URLDataUsage";
import FileData from "../data-usage/File/FileDataUsage";
import PasswordData from "../data-usage/Password/PasswordDataUsage";
import EmailData from "../data-usage/Email/EmailDataUsage";
import PhishData from "../data-usage/Phish/PhishDataUsage";
import TrackerData from "../data-usage/Tracker/TrackerDataUsage";;
import PaidRoute from "@/components/pages/unauthorized/PaidRoute.tsx";
import {useTranslation} from "react-i18next";

function HomeRoutes(){
        const {t} = useTranslation();

        return (
        <Routes>
            <Route path="/" element={<ReportPage />}></Route>
            <Route path="/info-page" element={<InfoPage />}></Route>
            <Route path="/password-checker/:password?" element={<PasswordChecker />}/>
            <Route path="/url-checker/:url?" element={<URLChecker />}/>
            <Route path="/file-checker/:file?" element={
                    <PaidRoute featureName={t("meniu:fileCheck.name")}>
                            <FileChecker />
                    </PaidRoute>
            }/>
            <Route path="/settings" element={<Settings />}/>
            <Route path="/report-page" element={<ReportPage />}/>
            <Route path="/email-checker/:email?" element={<EmailChecker />}/>
            <Route path="/profile" element={<Profile />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/cookies" element={<Cookies />}/>
            <Route path="/phish-email" element={
                    <PaidRoute featureName={t("meniu:phishEmail.name")}>
                            <PhishEmail />
                    </PaidRoute>
            }/>
            <Route path="/trackers" element={<Trackers />}/>
            <Route path="/url-data" element={<URLData />}></Route>
            <Route path="/file-data" element={<FileData />}></Route>
            <Route path="/password-data" element={<PasswordData />}></Route>
            <Route path="/phish-data" element={<PhishData />}></Route>
            <Route path="/email-data" element={<EmailData />}></Route>
            <Route path="/tracker-data" element={<TrackerData />}></Route>
        </Routes>
    );
}

export default HomeRoutes;