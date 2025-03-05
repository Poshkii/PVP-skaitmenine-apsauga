import {Route, Routes} from "react-router";
import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import FeatureList from "@/components/pages/home/FeatureList.tsx";
import Settings from "@/components/pages/settings/Settings.tsx";

function HomeRoutes(){
    return (
        <Routes>
            <Route path="/" element={<FeatureList />}></Route>
            <Route path="/password-checker/:password?" element={<PasswordChecker />}/>
            <Route path="/settings" element={<Settings />}/>
        </Routes>
    );
}

export default HomeRoutes;