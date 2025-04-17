import {useLocation, useNavigate} from "react-router";
import { useState, useEffect } from "react"; // Don't forget to import these
import { Shield, FileText, Key, Cookie, Mail, Radar, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

function FeatureList() {
  const menuItems = [
    { 
      nameKey: "websiteCheck.name", 
      hintKey: "websiteCheck.hint", 
      route: "/url-checker",
      icon: <Shield size={18} />
    },
    { 
      nameKey: "fileCheck.name", 
      hintKey: "fileCheck.hint", 
      route: "/file-checker",
      icon: <FileText size={18} />
    },
    { 
      nameKey: "passwordCheck.name", 
      hintKey: "passwordCheck.hint", 
      route: "/password-checker",
      icon: <Key size={18} />
    },
    { 
      nameKey: "cookies.name", 
      hintKey: "cookies.hint", 
      route: "/cookies",
      icon: <Cookie size={18} />
    },
    { 
      nameKey: "emailProtection.name", 
      hintKey: "emailProtection.hint", 
      route: "/email-checker",
      icon: <Mail size={18} />
    },
    { 
      nameKey: "trackerCheck.name", 
      hintKey: "trackerCheck.hint", 
      route: "/trackers",
      icon: <Radar size={18} />
    },
    { 
      nameKey: "info.name", 
      hintKey: "info.hint", 
      route: "/info-page",
      icon: <Info size={18} />
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const { t } = useTranslation('meniu');

  // Filter menu items based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(
        item => 
          t(item.nameKey).toLowerCase().includes(searchTerm.toLowerCase()) ||
          t(item.hintKey).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, t]); // Add t to dependency array
  
  return (
    <>
      {/* Middle Menu Section */}
      <div className="middle-menu">
        <h2 className="items-title">{t('name')}</h2>
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
                <p className="menu-name">{t(item.nameKey)}</p>
              </div>
              <p className="menu-hint">{t(item.hintKey)}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default FeatureList;