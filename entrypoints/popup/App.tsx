import './App.css';
import {Search} from "lucide-react";
import 'bootstrap/dist/css/bootstrap.css';
import AppRoutes from "@/components/pages/app/AppRoutes.tsx";
import NavBar from "@/components/pages/app/NavBar.tsx";
import {BgMessageId} from "@/entrypoints/content/types/bg-message.ts";
import {UiMessage, UiMessageId} from "@/entrypoints/content/types/ui-message.ts";
import {useNavigate} from "react-router";

function App() {
    const navigate = useNavigate();

    // setup background and ui messaging
    useEffect(() => {
        // send a popup opened sync message
        browser.runtime.sendMessage({id: BgMessageId.PopupOpened});

        const onMessage = (message: UiMessage) => {
            switch (message.id) {
                case UiMessageId.NavigateTo: {
                    navigate(message.data);
                }
            }
        };

        browser.runtime.onMessage.addListener(onMessage);

        return () => {
            browser.runtime.onMessage.removeListener(onMessage);
        }
    }, [navigate]);


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
                <AppRoutes/>
            </div>

            {/* Bottom Page Selection Buttons */}
            <NavBar/>
        </div>
    );
}

export default App;
