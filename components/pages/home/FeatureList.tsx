import {useLocation, useNavigate} from "react-router";
import { Info } from 'lucide-react';
import { Search, Shield, FileText, Key, Cookie, Mail, Radar } from "lucide-react";


const menuItems = [
    { 
      name: "Website Check", 
      hint: "Are you sure you want to visit this site?", 
      route: "/url-checker",
      icon: <Shield size={18} />
    },
    { 
      name: "File Check", 
      hint: "Scan your files", 
      route: "/file-checker",
      icon: <FileText size={18} />
    },
    { 
      name: "Password Check", 
      hint: "Feeling safe?", 
      route: "/password-checker",
      icon: <Key size={18} />
    },
    { 
      name: "Cookies", 
      hint: "Cookies, mmmm...", 
      route: "/cookies",
      icon: <Cookie size={18} />
    },
    { 
      name: "Email Protection", 
      hint: "Message, attachment analysis", 
      route: "/email-checker",
      icon: <Mail size={18} />
    },
    { 
      name: "Tracker Check", 
      hint: "Tracker analysis", 
      route: "",
      icon: <Radar size={18} />
    },
  ];

  function FeatureList() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState(menuItems);
    
    // Filter menu items based on search term
    useEffect(() => {
      if (searchTerm.trim() === "") {
        setFilteredItems(menuItems);
      } else {
        const filtered = menuItems.filter(
          item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.hint.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
      }
    }, [searchTerm]);
    
    return (
      <>
        
        
        {/* Middle Menu Section */}
        <div className="middle-menu">
          <h2 className="items-title">Security Features</h2>
          <div className="items-list">
            {filteredItems.map((item, index) => (
              <button 
                key={index} 
                className={`menu-button ${location.pathname === item.route ? 'active' : ''}`} 
                onClick={() => navigate(item.route)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="feature-icon">{item.icon}</span>
                  <p className="menu-name">{item.name}</p>
                </div>
                <p className="menu-hint">{item.hint}</p>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

export default FeatureList;