import {Route, Routes} from "react-router";
import PasswordChecker from "@/components/pages/password-checker/PasswordChecker.tsx";
import FeatureList from "@/components/pages/app/FeatureList.tsx";

function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<FeatureList />}></Route>
            <Route path="/password-checker/:password?" element={<PasswordChecker />}/>
        </Routes>
    );
}

export default AppRoutes;