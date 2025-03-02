import './App.css';
import { Search } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.css';
import AppRoutes from "@/components/pages/app/AppRoutes.tsx";
import NavBar from "@/components/pages/app/NavBar.tsx";

function App() {
  return (
    <div className="main-window">
      {/* Top Search Bar */}
      <div className="top-bar">
        <Search className="search-icon" size={18} />
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
