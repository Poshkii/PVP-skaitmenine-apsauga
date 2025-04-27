import React from 'react';
import './dashboard.css';

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
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="dashboard">
      <div className="stat-card total">
        <h2>Total Trackers Blocked</h2>
        <div className="stat-value">{stats.total}</div>
        <button className="reset-button" onClick={resetStats}>Reset Stats</button>
      </div>
      
      <div className="stat-cards">
        <div className="stat-card">
          <h3>Analytics</h3>
          <div className="stat-value">{stats.analytics}</div>
        </div>
        
        <div className="stat-card">
          <h3>Advertising</h3>
          <div className="stat-value">{stats.advertising}</div>
        </div>
        
        <div className="stat-card">
          <h3>Social Media</h3>
          <div className="stat-value">{stats.social}</div>
        </div>
        
        <div className="stat-card">
          <h3>Other</h3>
          <div className="stat-value">{stats.other}</div>
        </div>
      </div>
      
      <div className="info-panel">
        <div className="info-row">
          <span>Last rules update:</span>
          <span>{formatDate(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
