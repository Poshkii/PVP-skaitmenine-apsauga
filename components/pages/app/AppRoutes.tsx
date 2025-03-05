import {Route, Routes} from "react-router";
import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import FeatureList from "@/components/pages/app/FeatureList.tsx";
import URLChecker from "../url-checker/URLChecker";
import EmailChecker from "../email-checker/EmailChecker";

function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<FeatureList />}></Route>
            <Route path="/password-checker/:password?" element={<PasswordChecker />}/>
            <Route path="/url-checker/:url?" element={<URLChecker />}/>
            <Route path="/email-checker/:email?" element={<EmailChecker />}/>
        </Routes>
    );
}

export default AppRoutes;