import React from 'react';
import './settings.css';

interface SettingsProps {
  settings: {
    blockAnalytics: boolean;
    blockAdvertising: boolean;
    blockSocial: boolean;
    blockOther: boolean;
    blockFingerprints: boolean;
    lastUpdated: string | null;
  };
  updateSettings: (settings: SettingsProps['settings']) => void;
  updateRules: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, updateRules }) => {
  const handleToggle = (setting: keyof Omit<SettingsProps['settings'], 'lastUpdated'>): void => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    updateSettings(newSettings);
  };
  
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="settings">
      <div className="setting-header">
        <h2>Blocking Settings</h2>
        <button className="update-button" onClick={updateRules}>
          Update Rules Now
        </button>
      </div>
      
      <div className="last-update">
        Last update: {formatDate(settings.lastUpdated)}
      </div>
      
      <div className="setting-item">
        <div>
          <h3>Analytics Trackers</h3>
          <p>Block scripts that collect usage analytics (Google Analytics, etc.)</p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={settings.blockAnalytics} 
            onChange={() => handleToggle('blockAnalytics')}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="setting-item">
        <div>
          <h3>Advertising Trackers</h3>
          <p>Block ad networks and tracking pixels</p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={settings.blockAdvertising} 
            onChange={() => handleToggle('blockAdvertising')}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="setting-item">
        <div>
          <h3>Social Media Trackers</h3>
          <p>Block social media buttons and trackers</p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={settings.blockSocial} 
            onChange={() => handleToggle('blockSocial')}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="setting-item">
        <div>
          <h3>Other Trackers</h3>
          <p>Block miscellaneous and uncategorized trackers</p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={settings.blockOther} 
            onChange={() => handleToggle('blockOther')}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="setting-item">
        <div>
          <h3>Advanced Fingerprint Protection</h3>
          <p>Apply additional protections against browser fingerprinting</p>
        </div>
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={settings.blockFingerprints} 
            onChange={() => handleToggle('blockFingerprints')}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      
    </div>
  );
};

export default Settings;
