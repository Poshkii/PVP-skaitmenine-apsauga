import React from 'react';
import { useTranslation } from "react-i18next";

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
}

const Dashboard: React.FC<DashboardProps> = ({ stats, resetStats, lastUpdated }) => {
  const { t } = useTranslation('trackers');

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <>
      <div>
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
        
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={resetStats}>
          {t('resetStats')}
        </button>
      </div>
    </>
  );
};

export default Dashboard;