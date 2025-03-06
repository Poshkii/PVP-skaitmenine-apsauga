import PasswordCheckerOptions from "@/components/pages/settings/PasswordCheckerOptions.tsx";
import {Search} from "lucide-react";

const values = []

function Settings(){
    return (
      <>
          <div className="top-bar">
              <Search className="search-icon" size={18}/>
              <input
                  type="text"
                  placeholder="Search"
                  className="search-input"
              />
          </div>

          <div className="items-list">
              <PasswordCheckerOptions/>
          </div>
      </>
    );

}

export default Settings;