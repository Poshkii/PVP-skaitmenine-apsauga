import React from 'react';
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";

type Tracker = {
  type: string;
  filter: string;
};

interface DashboardProps {
  stats: {
    total: number;
    analytics: number;
    advertising: number;
    social: number;
    other: number;
  };
  resetStats: () => void;
  lastUpdated: string | null;
  blocked: Tracker[];
  url: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, resetStats, lastUpdated, blocked, url }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
      setOpenSection(openSection === section ? null : section);
  };
  const { t } = useTranslation('trackers');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(
  localStorage.getItem("skipClearConfirmation") === "true"
  );

  const clearData = () => {
    if (skipConfirmation) {
      resetStats();
    } else {
      setShowConfirmModal(true);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <>
      <div className="security-check-container glassmorphism">
        <div className="stat-card total">
          <h2>{t('totalBlocked')}</h2>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <h3>{t('analyticsBlocked')}</h3>
            <div className="stat-value">{stats.analytics}</div>
          </div>
          
          <div className="stat-card">
            <h3>{t('adsBlocked')}</h3>
            <div className="stat-value">{stats.advertising}</div>
          </div>
          
          <div className="stat-card">
            <h3>{t('socialBlocked')}</h3>
            <div className="stat-value">{stats.social}</div>
          </div>
          
          <div className="stat-card">
            <h3>{t('otherBlocked')}</h3>
            <div className="stat-value">{stats.other}</div>
          </div>
        </div>
      </div>

      <div>
          <button
              className="dropdown-button btn btn-secondary security-check-container glassmorphism"
              style={{
                  borderBottomLeftRadius: openSection === 'open' ? '0' : '12px',
                  borderBottomRightRadius: openSection === 'open' ? '0' : '12px',
                  marginBottom: 0
              }}
              onClick={() => toggleSection('open')}
          >
              <h3 className="status-title" style={{margin:0}}>{t('blockedTitle')} <br></br><span className="overflow-text" style={{maxWidth: "300px"}}>{url}</span></h3>{openSection === 'open' ? <ChevronUp/> : <ChevronDown/>}
          </button>
          <div 
              className="data-content"
              style={{
                  maxHeight: openSection === 'open' ? '100%' : '0',
                  opacity: openSection === 'open' ? 1 : 0,
                  padding: openSection === 'open' ? '16px 20px' : '0 20px',
                  visibility: openSection === 'open' ? 'visible' : 'hidden'
              }}
          >
              {blocked.length === 0 ? (
                <p className="status-title">{t('noBlocks')}</p>
              ) : (
                <ul className="recent-items" style={{paddingLeft: "0", textAlign:"left"}}>
                  {blocked.map((tracker, index) => (
                    <li className="recent-item" key={index}>
                      <div>
                        <span className="recent-item-text overflow-text" style={{maxWidth: "350px"}}><strong >{t('type')}: </strong>{tracker.type}</span>
                        <br></br>
                        <span className="recent-item-text overflow-text" style={{maxWidth: "350px"}}><strong >{t('filter')}: </strong>{tracker.filter}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
      </div>
        
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={clearData}>
          {t('resetStats')}
        </button>
      </div>

      {showConfirmModal && (
        <div 
            style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div 
            className="security-check-container glassmorphism"
            style={{
            backgroundColor: "var(--bg-primary)", padding: "30px", borderRadius: "8px",
            width: "90%", maxWidth: "400px", textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
            }}>
            <h2 className="panel-title" style={{ marginBottom: "20px" }}>
                {t('confirmClear')}
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                {t('areYouSure')}
            </p>
            <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                <input
                    type="checkbox"
                    onChange={(e) => {
                    if (e.target.checked) {
                        localStorage.setItem("skipClearConfirmation", "true");
                        setSkipConfirmation(true);
                    } else {
                        localStorage.removeItem("skipClearConfirmation");
                        setSkipConfirmation(false);
                    }
                    }}
                    defaultChecked={skipConfirmation}
                    style={{ marginRight: "8px" }}
                />
                {t('dontAsk')}
                </label>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                onClick={() => {
                    resetStats();
                    setShowConfirmModal(false);
                }}
                className="btn btn-danger"
                style={{ width: "120px" }}
                >
                {t('clear')}
                </button>
                <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
                style={{ width: "120px" }}
                >
                {t('cancel')}
                </button>
            </div>
            </div>
          </div>
        )}
    </>
  );
};

export default Dashboard;