import {Search} from "lucide-react";
import HomeRoutes from "@/components/pages/home/HomeRoutes.tsx";
import NavBar from "@/components/pages/home/NavBar.tsx";
import {useBackgroundMessaging} from "@/hooks/useBackgroundMessaging.ts";

function Home(){
    useBackgroundMessaging();

    return (
        <div className="main-window">
            {/* Top Search Bar */}
            <div className="top-bar">
                <Search className="search-icon" size={18}/>
                <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                />
            </div>

            {/* Middle Menu Section */}
            <div className="middle-menu">
                <HomeRoutes/>
            </div>

            {/* Bottom Page Selection Buttons */}
            <NavBar/>
        </div>
    )

}

export default Home;