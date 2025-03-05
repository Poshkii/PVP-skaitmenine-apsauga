import HomeRoutes from "@/components/pages/home/HomeRoutes.tsx";
import NavBar from "@/components/pages/home/NavBar.tsx";
import {useBackgroundMessaging} from "@/hooks/useBackgroundMessaging.ts";

function Home(){
    useBackgroundMessaging();

    return (
        <div className="main-window">

            <HomeRoutes/>

            {/* Bottom Page Selection Buttons */}
            <NavBar/>
        </div>
    )

}

export default Home;